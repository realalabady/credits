# Design System: Selfah - Arabic Digital Gift-Card Store

> RTL-first (Arabic primary, `dir="rtl"`). Trust-first digital gift-card retail.
> This file is the single source of truth for the visual redesign. Values are
> exact; adapt component code to these tokens rather than inventing new ones.

## 1. Visual Theme & Atmosphere

A calm, confident, **"daily-app balanced"** storefront (Density 4) with **offset
asymmetric** composition (Variance 7) and **fluid spring-physics** motion
(Motion 4). The mood is *quiet gifting premium*: generous whitespace, one
decisive accent, the card artwork itself doing the heavy lifting, zero visual
noise. Deliberately NOT the confetti + balloons + rainbow-gradient palette that
every gift-card site defaults to. Expensive through restraint, not decoration.

Supports light and dark. Light is the default retail canvas; dark is a true
theme (not inverted grays), stamped via `:root[data-theme="dark"]`.

## 2. Color Palette & Roles

**Light (default)**
- **Paper** (`#F8F7F4`) - Primary page canvas (warm, not cool stone)
- **Pure Surface** (`#FFFFFF`) - Cards, product tiles, sheets
- **Ink** (`#1A1815`) - Primary text (never `#000`)
- **Graphite** (`#6A655C`) - Secondary text, metadata, prices-strikethrough
- **Hairline** (`#E8E5DD`) - 1px borders, dividers
- **Antique Gold** (`#6B4E10`) - SINGLE accent: CTAs, active nav, focus rings, active chips. White on this fill measures **7.71:1 (AAA)**; the same value as text on Paper measures **7.19:1 (AAA)**.
- **On-Accent** (`--on-primary`, `#FFFFFF`) - the ONLY text/icon color allowed on a `--primary` fill. Never hardcode `#fff` against the accent.
- **Success** (`#2F6B4F`) - in-stock / order-confirmed only (semantic, not decorative). Split from the accent because a gold "success" reads as a warning.

**Dark**
- **Obsidian** (`#0F0F0D`) - Page canvas (not pure black)
- **Slate Surface** (`#1A1815`) - Cards
- **Paper Text** (`#F3F1EC`) - Primary text
- **Ash** (`#A09A8E`) - Secondary text
- **Hairline Dark** (`rgba(243,241,236,0.10)`)
- **Antique Gold** lifts to `#E3C46A`, and `--on-primary` flips to ink `#171308` so accent fills stay legible (**10.92:1**; as text on canvas **11.30:1**)

> **Do not lighten the light-mode gold.** A brighter, more obviously "gold" value
> (`#8A6516` and up) drops to 5.31:1 and fails the AAA bar this system claims.
> The accent is dark on purpose; the *gold-ness* is carried by the card artwork.

Rules: max **1** accent. No purple/blue neon, no gradient text, no oversaturation.
One palette throughout — no warm/cool gray drift.

**Card artwork is the one exception to the single-accent rule.** The six
denominations each carry their own tier colour (bronze → silver → emerald →
violet → ruby → gold) in `public/cards/*.svg`. That is *product imagery*, not UI
chrome — those hues must never leak into buttons, chips, links, or backgrounds.

## 3. Typography Rules

Arabic-first, so Latin defaults from the generic skill are swapped for
Arabic-capable type. Numerals (prices) use a mono for tabular alignment.

- **Display (Arabic):** `Tajawal` 700/800 — track-tight, weight-driven hierarchy, restrained scale via `clamp(1.6rem, 4vw, 3rem)`
- **Body (Arabic):** `IBM Plex Sans Arabic` 400/500 — leading `1.75`, comfortable measure (~60–65 Arabic chars)
- **Numerals / Mono:** `Geist Mono` (tabular-nums) — prices, order IDs, quantities, timestamps
- **Latin fallback:** `Geist` for any Latin words (brand names, "SAR", model numbers)
- **Banned:** `Inter`, `Times/Georgia/Garamond`, generic system serif. No serif anywhere in this UI.

Prices always `font-variant-numeric: tabular-nums;` so columns align.

## 4. Component Stylings

- **Buttons:** Flat, no outer glow. Primary = Antique Gold fill with `--on-primary` label, `border-radius: 10px`, tactile `translateY(1px)` on `:active`. Secondary = ghost with Hairline border. Min height `44px`. One primary CTA per view.
- **Product cards:** Pure Surface, `border-radius: 20px`, `1px Hairline` border, **diffused** shadow `0 1px 2px rgba(28,28,30,.04), 0 8px 24px -12px rgba(28,28,30,.10)`. Image top, generous internal padding (`16px`), price in mono, one-line title clamp. Hover: lift `-4px` + shadow deepen (spring). No borders *and* heavy shadow both — pick elevation intent.
- **Inputs (checkout/forms):** Label above, `12px` radius, `1px Hairline`, focus ring = 2px Antique Gold. Error text below in a muted red, never shouting. Keep the existing RTL field layout.
- **Loaders:** Skeleton shimmer matching the exact card/list dimensions. Kill circular spinners on page/list loads.
- **Empty states:** Composed — a line-art glyph + one calm sentence + one action (e.g. empty cart → "ابدأ التسوق"). Not bare "لا يوجد".
- **Badges:** Sale/new as small pill chips, Antique Gold text on `--primary-tint` `rgba(107,78,16,.10)`.

## 5. Layout Principles

- CSS Grid first; contain in `max-width: 1320px` centered with fluid gutters.
- **Home hero:** asymmetric split (fanned card artwork + headline), NOT centered, NOT a carousel of stock banners. Headline may use the inline-image technique (a small rounded card sitting inline at type-height between words).
- **Product grid:** responsive `repeat(auto-fill, minmax(260px, 1fr))` — never a rigid "3 equal cards" row.
- **Category feature row:** 2-column zig-zag or horizontal scroll, not 3 equal boxes.
- No overlapping elements; every element in its own spatial zone.
- Full-height sections use `min-h-[100dvh]`, never `h-screen`.
- Respect RTL: logical properties (`margin-inline`, `padding-inline`, `inset-inline`) so mirroring is correct.

## 6. Motion & Interaction

- Spring physics (`stiffness ~100, damping ~20`) for hovers, sheet/menu open, add-to-cart.
- Staggered cascade on product-grid mount (40–60ms waterfall), not instant paint.
- Add-to-cart: brief count bump on the cart icon (scale pulse), toast confirmation.
- Animate only `transform` / `opacity`. Never `top/left/width/height`.
- One subtle perpetual micro-loop max (e.g. a slow shimmer on a "limited offer" chip) — restraint over motion for a retail store.
- Respect `prefers-reduced-motion`.

## 7. Anti-Patterns (Banned)

- No emojis in the UI chrome.
- No `Inter`, no generic serif, no pure `#000000`.
- No neon / outer-glow shadows, no purple-blue "AI" gradients, no gradient headline text.
- No rigid 3-equal-card feature rows, no centered hero, no banner carousels.
- No overlapping text/imagery.
- No custom mouse cursors, no "اسحب للأسفل" / scroll-arrow filler.
- No broken placeholder images — use real product images or a neutral SVG placeholder (replace the current `via.placeholder.com` usage).
- No AI copy clichés ("الأفضل", "بلا حدود", "احترافي") stacked meaninglessly.
- No fake round stats.

## Implementation Order (for the redesign pass)

1. **Global theme layer** — CSS custom properties for the palette + type + radii + shadows in the root stylesheet; wire `@font-face`/font links (Tajawal, IBM Plex Sans Arabic, Geist Mono). This cascades everywhere. All accent values live in `src/styles/globals.css` only — no component hardcodes the accent hex, so a re-theme is a token edit.
2. **Primitives** — buttons, inputs, cards, badges, skeletons.
3. **Header / nav + footer** — spacing, hairlines, active-accent.
4. **Home** — asymmetric hero, product grid, category zig-zag.
5. **Product listing + detail** — grid tiles, gallery, sticky buy box.
6. **Cart / Checkout / Order confirmation** — align to the primitives (checkout logic already done; visual pass only).
7. **Admin dashboard** — sans-only, denser tokens, mono numerals.
