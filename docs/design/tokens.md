# Design Tokens

Do not invent values outside this file. Wire them via CSS variables in `apps/web/src/app/globals.css`.

## Brand / primary

| Token | Hex | Use |
|-------|-----|-----|
| `primary-900` | `#002C1B` | Deepest brand (hero overlays) |
| `primary-800` | `#0B2E1F` | Nav, sidebar, primary buttons |
| `primary-700` | `#1B4332` | Hover / secondary brand |
| `primary-600` | `#2D6A4F` | Links, active, progress fill |
| `primary-500` | `#40916C` | Accuracy fills (≥70%) |
| `primary-400` | `#74C69D` | Hover borders on options/cards |
| `primary-100` | `#D8F3DC` | Hover backgrounds / pills |
| `primary-50` | `#F0FBF4` | Section tints |

## Semantic

| Token | Hex | Use |
|-------|-----|-----|
| `success` | `#1B4332` | Correct states |
| `success-bg` | `#D8F3DC` | Correct backgrounds |
| `success-text` | `#0B2E1F` | Correct option text |
| `error` | `#C62828` | Wrong states |
| `error-bg` | `#FFEBEE` | Wrong backgrounds |
| `error-text` | `#B71C1C` | Wrong option text |
| `warning` | `#F59E0B` | Mid accuracy / timer amber |
| `warning-text` | `#B45309` | Mid-band score text |
| `warning-bg` | `#FFFBEB` | Medium difficulty badge |

## Accent

| Token | Hex | Use |
|-------|-----|-----|
| `accent-500` | `#F4A261` | Streaks, weak-topic emphasis, Melak |
| `accent-600` | `#E08E4F` | Melak link text |
| `accent-100` | `#FEF3E2` | Accent tints |

## Gray

| Token | Hex | Use |
|-------|-----|-----|
| `gray-950` | `#0C0C0E` | Body text |
| `gray-800` | `#1F2937` | Option text default |
| `gray-700` | `#374151` | Secondary text |
| `gray-600` | `#4B5563` | Quiz chrome, secondary labels |
| `gray-500` | `#6B7280` | Placeholder, disabled |
| `gray-400` | `#9CA3AF` | Section labels, chevrons |
| `gray-200` | `#E5E7EB` | Borders |
| `gray-100` | `#F3F4F6` | Subtle backgrounds |
| `gray-50` | `#F9FAFB` | Page background |

## Subject colors

| Subject | Color | Background |
|---------|-------|------------|
| math | `#1D4ED8` | `#EFF6FF` |
| physics | `#7C3AED` | `#F5F3FF` |
| chemistry | `#B45309` | `#FFFBEB` |
| biology | `#15803D` | `#F0FDF4` |
| english | `#0E7490` | `#ECFEFF` |
| history | `#92400E` | `#FEF3C7` |
| geography | `#065F46` | `#ECFDF5` |
| economics | `#1E40AF` | `#EEF2FF` |
| civics | `#9D174D` | `#FFF1F2` |

## Spacing

| Token | Value |
|-------|-------|
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-7` | 28px |
| `space-8` | 32px |

## Radius

| Token | Value |
|-------|-------|
| `radius-md` | 8px |
| `radius-lg` | 12px |
| `radius-xl` | 16px |
| `radius-2xl` | 24px |
| `radius-full` | 9999px |

## Fonts

| Token | Stack |
|-------|-------|
| `font-body` | Inter, system-ui, sans-serif |
| `font-ethiopic` | Noto Serif Ethiopic, serif |

## Answer Option → token map (M1)

| State | Container | Letter circle | Text / icon |
|-------|-----------|---------------|-------------|
| Default | border `gray-200`, bg white | border `gray-300`≈`gray-200`, text `gray-500` | `gray-800` |
| Hover | border `primary-400`, bg `primary-50` | border `primary-400`, text `primary-700` | `gray-950` |
| Selected | border 2px `primary-600`, bg `primary-50` | bg `primary-600`, text white | `gray-950` |
| Correct | border `success`, bg `success-bg` | bg `success`, text white | `success-text` + CheckCircle2 |
| Wrong selected | border `error`, bg `error-bg` | bg `error`, text white | `error-text` + XCircle |
| Correct unselected | as Correct, opacity 0.75 | — | CheckCircle2 |
