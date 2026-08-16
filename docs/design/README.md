# Kasina Design System

Canonical visual language for Kasina (ካሲና) web (and shared UI later).

**Source:** MVP webapp design spec + locked gap fills in the M0 plan.  
**Hard rule:** If a screen needs a color, font, spacing, or radius not listed in [tokens.md](./tokens.md), update that doc first — do not one-off hex in components.

## Brand

- Product name in UI: **Kasina (ካሲና)** — never “Kasina” alone in teacher chrome
- Melak icon: Lucide **`Sparkles`** only (no emoji)
- Icons: Lucide throughout
- Page background: `gray-50`; cards: white + `gray-200` border

## Typography

| Use | Token / font |
|-----|----------------|
| Body / English UI | Inter (`font-body` / `--font-body`) |
| Amharic / Ethiopic | Noto Serif Ethiopic (`font-ethiopic`) with `lang="am"` on Ethiopic runs |

Do not introduce other display fonts for MVP web.

## Layout conventions

| Context | Max width | Horizontal padding |
|---------|-----------|--------------------|
| Subject / progress | 720px centered | 24px |
| Quiz / results / review | 680px centered | 24px |

- Primary button height: **52px**
- Secondary button height: **48px**
- Section labels: `text-xs`, uppercase, tracking ~0.08em, `gray-400`

## Buttons

| Variant | Style |
|---------|--------|
| Primary | bg `primary-800`, text white, radius `lg` |
| Secondary | white bg, `primary-800` border + text |
| Ghost | no border, `gray-600` or `primary-600` text |

## Implementation

- CSS variables + Tailwind v4 `@theme`: [`apps/web/src/app/globals.css`](../../apps/web/src/app/globals.css)
- Full token tables: [tokens.md](./tokens.md)
