# Shared DB — one Firestore, many isolated stores

This repo is a storefront template cloned per store. All stores share **one Firebase project**
(`estore-8f76b`) and **one Firestore database**, but each store owns a separate document subtree
and cannot read or write another store's data.

This document is self-contained. Read it before touching anything under `stores/`.

---

## 1. Why this exists

Originally every clone pointed at the same flat top-level collections — `products`, `orders`,
`users`, `categories`, `settings`, `contactMessages`. Two consequences:

- One store's products appeared in every other store; all stores shared one `settings/store`.
- **Admin was project-wide.** `verifyAdmin` and the rules both resolved admin from a global
  `users/{uid}.role`. Because Cloud Functions deploy **once per project** and are shared by all
  stores, any store's admin could call `tabbySaveSettings` / `cjCreateOrder` against any other
  store and read its payment credentials.

The second point is the real reason for the change. Everything below follows from it.

---

## 2. Data model

```
stores/{storeId}                     root doc: { name, domain, active, createdAt }
  ├── settings/{store|email|tabby|tamara|cjDropshipping|googleMerchant}
  ├── products/{productId}
  ├── categories/{categoryId}
  ├── orders/{orderId}
  ├── users/{uid}                    profile + role, scoped to THIS store
  └── contactMessages/{messageId}

pending_payments/{orderRef}          top-level, Admin-SDK-only, carries { storeId }
```

`storeId` is a slug matching `^[a-z0-9][a-z0-9-]{0,63}$` — e.g. `leapsmart`, `techma`.

### Why subcollections, not `products-leapsmart` / `settings-techma`

A flat prefix-per-store naming was the obvious first idea. It loses on three counts:

1. **Indexes.** A composite index is keyed on collection ID. `orders-leapsmart` and
   `orders-techma` are different IDs, each needing its own index deployed. A `queryScope:
   COLLECTION` index on collection group `orders` automatically covers *every*
   `stores/*/orders`. `firestore.indexes.json` needed **no change** and needs none per new store.
2. **Rules.** One `match /stores/{storeId}/...` block covers all stores. The flat form needs
   wildcard matches plus string parsing.
3. **Lifecycle.** Deleting or exporting a store is one subtree.

### What is deliberately NOT isolated

| Thing | Status | Reason |
|---|---|---|
| Firebase **Auth** | Shared across all stores | One Auth pool per Firebase project. Same email/password signs into every store. Only the *profile and role* are per-store. True separation needs separate Firebase projects. |
| `pending_payments` | Top-level, with a `storeId` field | Payment webhooks receive only an order reference. They must resolve the store *before* they can load that store's credentials to verify a signature. Admin-SDK-only and denied to all clients by rules, so nothing leaks. |
| Cloud Functions | One deployment for all stores | Firebase deploys functions per project. This is why every call must carry `storeId` — see §4. |

---

## 3. Client

`src/config/store.ts` is the only place that knows the store identity.

```ts
export const STORE_ID = import.meta.env.VITE_STORE_ID;   // per-deployment env var

storeRootDoc()                 // stores/{STORE_ID}
storeCol("products")           // stores/{STORE_ID}/products
storeDoc("orders", id)         // stores/{STORE_ID}/orders/{id}
storagePath("products/x.jpg")  // stores/{STORE_ID}/products/x.jpg
withStore(payload)             // { ...payload, storeId: STORE_ID }  → for callables
```

**Rule: never write `collection(db, "products")` or `doc(db, "orders", id)` again.** Those are
top-level paths shared by every store. Always go through the helpers above.

If `VITE_STORE_ID` is missing, `STORE_ID` falls back to `__unconfigured__` and logs an error —
the app still renders instead of white-screening, but every write lands on a path rules reject,
so a misconfigured deploy cannot pollute a real store.

One deployment = one store. Each Vercel project / Firebase Hosting site sets its own
`VITE_STORE_ID`.

---

## 4. Cloud Functions

Functions are deployed **once for the whole project**, so a function cannot learn its store from
an env var. Every call carries the store, and the server verifies permission *within that store*.

Helpers at the top of `functions/src/index.ts`:

```ts
storeRef(storeId)                    // stores/{storeId}
storeCol(storeId, "orders")          // stores/{storeId}/orders
storeDoc(storeId, "products", id)    // stores/{storeId}/products/{id}
settingsRef(storeId, "tabby")        // stores/{storeId}/settings/tabby

requireStoreId(data)                 // reads data.storeId, validates slug + store exists + active
verifyAdmin(auth, storeId)           // reads stores/{storeId}/users/{uid}.role === 'admin'
requireStoreAdmin(data, context)     // the two above combined → returns storeId
parseStoreIdParam(value)             // for onRequest endpoints (query string)
getStoreIdentity(storeId)            // { baseUrl, brand } from that store's settings/store
```

- **All 28 `onCall` handlers** take `storeId` from the payload. The client injects it via
  `withStore(...)` — see `src/services/{tabby,tamara,paypal,productImport}.ts`.
- **The 3 merchant `onRequest` endpoints** take `?store=<storeId>` and 400 without it.
  `cjImageProxy` touches no Firestore, so it needs nothing.
- **Firestore triggers** are `stores/{storeId}/orders/{orderId}`; `context.params.storeId` gives
  the store. One trigger serves every store.
- `STORE_BASE_URL` / `STORE_BRAND` env vars are **fallbacks only**. Real values come from each
  store's `settings/store` (`store.baseUrl`, `store.storeName`). A single project-wide value
  cannot describe several storefronts.
- The Resend owner-notification recipient is per-store: `settings/store.store.storeEmail`,
  falling back to the `OWNER_EMAIL` env var.

### Credential isolation caveat

`functions/src/tabbyClient.ts` and `tamaraClient.ts` hold API keys in **module-level globals**
shared by all stores in a warm container. Therefore:

- Always call `initTabbyKeys(storeId)` / `initTamaraToken(storeId)` immediately before any call
  into those clients. They overwrite the globals from that store's settings.
- Any temporary use (test-connection handlers) must end with `clearApiKeys()` / `clearApiToken()`
  in a `finally` block, or the test keys leak into the next store's request.

`cjClient.ts` reads settings from Firestore per call and caches nothing, so it only needed
`storeId` threading.

---

## 5. Security rules

`firestore.rules` — one block, all stores:

```
function isStoreAdmin(storeId) {
  return isAuth() &&
    get(/databases/$(database)/documents/stores/$(storeId)/users/$(request.auth.uid)).data.role == 'admin';
}

match /stores/{storeId} {
  allow read: if true;    // storefront reads name/domain
  allow write: if false;  // Admin SDK only

  match /products/{id}     { allow read: if true; allow write: if isStoreAdmin(storeId); }
  match /categories/{id}   { allow read: if true; allow write: if isStoreAdmin(storeId); }
  match /settings/store    { allow read: if true; allow write: if isStoreAdmin(storeId); }
  match /settings/{id}     { allow read, write: if isStoreAdmin(storeId); }   // secrets
  match /users/{uid}       { owner reads/updates; role immutable by owner; admin full }
  match /orders/{id}       { owner reads own; admin full }
  match /contactMessages/{id} { allow create: if true; rest admin-only }
}

match /pending_payments/{ref} { allow read, write: if false; }
match /{document=**}          { allow read, write: if false; }
```

Two protections worth preserving when editing:

- `users` **create** requires `request.resource.data.role == 'customer'`. Without it an
  authenticated user can create their own doc with `role: 'admin'` — that was a live hole in the
  pre-multi-tenant rules.
- `users` **update** by the owner blocks any change to `role`
  (`!diff(resource.data).affectedKeys().hasAny(['role'])`).

`storage.rules` scopes uploads to `stores/{storeId}/products/**` and `.../categories/**`.

> Note: Firebase Storage download URLs contain a `?token=`, which bypasses rules entirely.
> Images uploaded before this change still resolve from their old flat `products/...` path.
> Tightening storage rules does **not** break existing image URLs.

---

## 6. Scripts

All four use the Admin SDK and bypass rules. Authenticate first with either
`GOOGLE_APPLICATION_CREDENTIALS` pointing at a service-account key, or
`gcloud auth application-default login`.

| Command | Purpose |
|---|---|
| `npm run store:create -- <id> "<name>" [adminUid\|email] [baseUrl]` | Create a new store: root doc, `settings/store`, optional first admin. Refuses if the store exists. |
| `npm run store:admin -- <id> <uid\|email> [--revoke]` | Grant/revoke admin **in one store only**. Use this after `store:create`, or to add more admins. |
| `npm run store:move -- <from> <to> [collection] [plan\|apply\|copy]` | Move a collection between stores. Copies, verifies every id landed, then deletes from source. |
| `npm run store:migrate -- <id> [plan\|apply\|overwrite]` | One-off: lift the legacy top-level collections into `stores/{id}/*`. Already run for `leapsmart`. |
| `npm run store:seed -- <id> [plan\|apply\|replace]` | Seed the sheep catalogue from `functions/scripts/data/sheep-products.js`. Matches existing docs by `slug`, so `apply` is idempotent. |

### ⚠️ Mode is a positional word, not a flag

**npm swallows `--foo` flags even after `--`.** `npm run store:move -- a b products --plan` loses
`--plan` entirely and the script sees only the positionals. This already caused two scripts to run
destructively when a preview was intended.

So the mode is passed as a bare word and **defaults to the safe option**:

```bash
npm run store:move -- leapsmart techma products         # plan (default) — writes nothing
npm run store:move -- leapsmart techma products apply   # actually moves
```

A swallowed flag is now a no-op, never data loss. Keep it that way if you add scripts.

---

## 7. Adding a new store

```bash
# 1. Create it (empty — no products, orders, or customers from any other store)
npm run store:create -- techma "تكما" owner@example.com https://techma.sa

# 2. Grant admin (or if the store already exists and needs another admin)
npm run store:admin -- techma owner@example.com
```

3. **Deploy a storefront for it.** One hosting target = one store.
   - Vercel: new project, env var `VITE_STORE_ID=techma`.
   - Firebase Hosting: `firebase hosting:sites:create techma`, add a target in `firebase.json`.

4. **Nothing else.** No rules change, no index change, no functions redeploy. That is the point
   of the subcollection layout.

5. The new admin must log out and back in for the role to take effect in the UI.

### Local development against a specific store

Create `.env.local` with `VITE_STORE_ID=techma` (it overrides `.env` and is gitignored).

> **Delete it before `npm run build`.** Otherwise you produce a techma-flavoured bundle and can
> deploy it over another store's hosting site.

---

## 8. Deploy order

The app stops reading legacy paths the moment new code ships, so sequence matters:

1. Run `store:migrate` **first** — data must exist at the new paths before new rules go live.
2. Deploy rules + functions + hosting **together**:
   ```bash
   npx firebase deploy --only firestore:rules,storage,functions,hosting
   ```
3. Verify, then delete the legacy top-level collections by hand. Keep `pending_payments`.

---

## 9. Debugging permission errors

`onSnapshot` without an error callback prints `Uncaught Error in snapshot listener` with **no
path**, which makes multi-tenant permission problems nearly undiagnosable. All five subscriptions
in `src/services/firestore.ts` now pass `snapshotError(path)`, and the auth callback in
`src/App.tsx` is wrapped in try/catch. Failures now read:

```
[Firestore] فشل الاشتراك في stores/techma/orders: Missing or insufficient permissions.
[Auth] تعذّر قراءة/إنشاء ملف المستخدم في stores/techma/users/<uid>: ...
```

Keep this pattern on any new listener.

**Most common cause of `permission-denied` on a store that "should" work: the signed-in user has
no `role: 'admin'` doc in *that* store.** Auth is shared, so login succeeds; authorization is
per-store, so the dashboard is denied. That is the isolation working, not a bug. Fix with
`npm run store:admin`.

Quick read-only probe of the deployed rules (unauthenticated), no build required:

```bash
curl "https://firestore.googleapis.com/v1/projects/estore-8f76b/databases/(default)/documents/stores/<id>/products?key=<VITE_FIREBASE_API_KEY>&pageSize=1"
```

200 = public read path is fine and the problem is authorization, not the rules.

---

## 10. Current state

- Project `estore-8f76b`. Stores: **`leapsmart`**, **`techma`**.

| | leapsmart | techma |
|---|---|---|
| products | 24 (ذبائح) | 15 (phones) |
| categories | 1 | 0 |
| orders | 1 | 0 |
| users | 4 | 2 |
| settings | `store` | `store`, `tamara` |

- `leapsmart` — the live site (`https://estore-8f76b.web.app`), a livestock/sheep storefront
  (`storeName: "Leap-Smart"`). Migrated from the legacy top-level collections. Its 15 phone
  products were **moved to `techma`**; its catalogue was then seeded with 24 sheep-carcass
  products by `store:seed` (8 breeds × whole/half/third).
- `techma` — the phone store (`storeName: "tatchme"`). Holds the 15 products and the Tamara
  credentials. No hosting target yet, so it is not publicly visible.
- Legacy top-level collections still exist untouched as a backup. Rules deny all client access.

### Cleanup applied after the migration

`store:migrate` copies **every** doc in the legacy top-level `settings` collection into the target
store. That collection already contained `store__techma` — left over from an earlier attempt at
the flat `settings-{name}` naming — so techma's settings landed under `leapsmart`. Corrected by
hand:

- `stores/leapsmart/settings/store__techma` → `stores/techma/settings/store` (its `baseUrl` field
  preserved), source deleted.
- `stores/leapsmart/settings/tamara` → `stores/techma/settings/tamara`; the token was configured
  for the phone business, which is now techma.

**If you migrate another legacy store, inspect `settings/*` first** — the migration does not know
which store a legacy settings doc belongs to.

> Consequence to be aware of: `stores/leapsmart/settings/store` still lists `tamara` and `tabby`
> as enabled payment methods, but leapsmart no longer holds a Tamara token. Choosing Tamara at
> leapsmart checkout returns a `failed-precondition` ("مفتاح Tamara API غير مُعد") rather than a
> crash. Either disable those methods in the dashboard or give leapsmart its own credentials.

### Known gaps

- **No `baseUrl` field in the Settings UI** (`src/pages/Dashboard/Settings.tsx` edits `storeName`
  and `storeEmail` only). Functions read `settings/store.store.baseUrl` for product links and the
  Merchant feed; until it is set per store they fall back to one project-wide env var, which is
  wrong as soon as a second store is live. Set it manually in Firestore or add the input.
- **Google Merchant feed URLs need `?store=<storeId>`.** The old URLs now return 400:
  ```
  https://us-central1-estore-8f76b.cloudfunctions.net/merchantProductsFeed?store=techma
  ```
- Rules have **not** been emulator-tested (the dev machine has no Java). They are verified only
  against the deployed project by manual probe.
