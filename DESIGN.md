# Design System: Estore — Arabic Phone & Electronics Store

> RTL-first (Arabic primary, `dir="rtl"`). Premium consumer-electronics retail.
> This file is the single source of truth for the visual redesign. Values are
> exact; adapt component code to these tokens rather than inventing new ones.

## 1. Visual Theme & Atmosphere

A calm, confident, **"daily-app balanced"** storefront (Density 4) with **offset
asymmetric** composition (Variance 7) and **fluid spring-physics** motion
(Motion 6). The mood is *quiet-premium electronics boutique* — think a
well-lit Apple-adjacent showroom rendered for Arabic readers: generous
whitespace, one decisive accent, product photography doing the heavy lifting,
zero visual noise. Not flashy, not "techy-neon" — expensive through restraint.

Supports light and dark. Light is the default retail canvas; dark is a true
theme (not inverted grays), stamped via `:root[data-theme="dark"]`.

## 2. Color Palette & Roles

**Light (default)**
- **Porcelain** (`#FAFAF9`) — Primary page canvas
- **Pure Surface** (`#FFFFFF`) — Cards, product tiles, sheets
- **Ink** (`#1C1C1E`) — Primary text (never `#000`)
- **Graphite** (`#6B6B70`) — Secondary text, metadata, prices-strikethrough
- **Hairline** (`rgba(28,28,30,0.08)`) — 1px borders, dividers
- **Signal Amber** (`#C2410C`) — SINGLE accent: CTAs, active nav, focus rings, sale price. Saturation kept < 80%.
- **Success Moss** (`#3F6212`) — In-stock / order-confirmed only (semantic, not decorative)

**Dark**
- **Obsidian** (`#0E0E11`) — Page canvas (not pure black)
- **Slate Surface** (`#17171B`) — Cards
- **Porcelain Text** (`#F4F4F5`) — Primary text
- **Ash** (`#9A9AA2`) — Secondary text
- **Hairline Dark** (`rgba(244,244,245,0.10)`)
- **Signal Amber** stays `#E8703A` (lifted for dark contrast)

Rules: max **1** accent. No purple/blue neon, no gradient text, no oversaturation.
One palette throughout — no warm/cool gray drift.

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

- **Buttons:** Flat, no outer glow. Primary = Signal Amber fill, `border-radius: 12px`, tactile `translateY(1px)` on `:active`. Secondary = ghost with Hairline border. Min height `44px`. One primary CTA per view.
- **Product cards:** Pure Surface, `border-radius: 20px`, `1px Hairline` border, **diffused** shadow `0 1px 2px rgba(28,28,30,.04), 0 8px 24px -12px rgba(28,28,30,.10)`. Image top, generous internal padding (`16px`), price in mono, one-line title clamp. Hover: lift `-4px` + shadow deepen (spring). No borders *and* heavy shadow both — pick elevation intent.
- **Inputs (checkout/forms):** Label above, `12px` radius, `1px Hairline`, focus ring = 2px Signal Amber. Error text below in a muted red, never shouting. Keep the existing RTL field layout.
- **Loaders:** Skeleton shimmer matching the exact card/list dimensions. Kill circular spinners on page/list loads.
- **Empty states:** Composed — a line-art glyph + one calm sentence + one action (e.g. empty cart → "ابدأ التسوق"). Not bare "لا يوجد".
- **Badges:** Sale/new as small mono uppercase chips, Signal Amber text on tinted amber `rgba(194,65,12,.10)`.

## 5. Layout Principles

- CSS Grid first; contain in `max-width: 1320px` centered with fluid gutters.
- **Home hero:** asymmetric split (featured device + headline), NOT centered, NOT a carousel of stock banners. Headline may use the inline-image technique (a small rounded product photo sitting inline at type-height between words).
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

1. **Global theme layer** — CSS custom properties for the palette + type + radii + shadows in the root stylesheet; wire `@font-face`/font links (Tajawal, IBM Plex Sans Arabic, Geist Mono). This cascades everywhere.
2. **Primitives** — buttons, inputs, cards, badges, skeletons.
3. **Header / nav + footer** — spacing, hairlines, active-accent.
4. **Home** — asymmetric hero, product grid, category zig-zag.
5. **Product listing + detail** — grid tiles, gallery, sticky buy box.
6. **Cart / Checkout / Order confirmation** — align to the primitives (checkout logic already done; visual pass only).
7. **Admin dashboard** — sans-only, denser tokens, mono numerals.
