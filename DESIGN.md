# FinMate Design System

> Companion to `UI.md`. `UI.md` owns strategy, screen intent, and the privacy-scope rules. This file owns the concrete token/component spec.
> **Brand foundation is locked to `UI.md`:** primary = teal `#009591`, accent/FOMO = red `#ED1651`. Font = **Paperlogy** (replaces the earlier Pretendard/Hana2 stack). Token **names below are unchanged** from the previous version — only their values changed — so existing code keeps working; just re-map the removed multi-hue chart tokens.

## Atmosphere
FinMate should feel like a real Korean mobile finance app with a social layer. The home screen follows the reference structure: daily mission, budget, spending summary, asset status, and following finance updates. The product should read as precise and trustworthy first, then lightly social through verified peer activity.

**Teal is the single product primary** for active navigation, missions, budget/progress, success, and primary actions. **Red is the accent, reserved for FOMO** — the comparison gap, "friends are already doing this," and alerts — used sparingly so the stimulus stays sharp. Avoid generic AI-purple glow, decorative gradients, glass panels, and playful density that makes the app feel like a demo.

Fixed color logic (never invert): in any comparison, **me = teal, the other side (group/friends) = red.**

## Color

**Brand**
- `#009591` `--color-primary` active tab, mission, budget/progress, and primary CTA.
- `#007C78` `--color-primary-strong` pressed primary / high-emphasis teal text.
- `#E6F5F4` `--color-primary-soft` mission and selected surfaces, quiet teal insight surface.
- `#BEE6E4` `--color-primary-border` primary soft border.

**Accent / FOMO (red — use sparingly, max 1–2 emphases per screen)**
- `#ED1651` `--color-accent` FOMO stimulus, comparison gap, social alert, "you're the only one not doing this."
- `#C90E43` `--color-accent-strong` pressed accent / high-emphasis gap text.
- `#FDE7EC` `--color-accent-soft` FOMO card and alert surface.
- `#FBC7D3` `--color-accent-border` accent soft border.

**Neutrals (slightly teal-cool ink — not pure gray, not cream)**
- `#F5F6F6` `--color-page` app canvas and desktop background.
- `#FFFFFF` `--color-app` phone app surface.
- `#FFFFFF` `--color-card` primary card surface.
- `#101413` `--color-ink` primary text.
- `#2B3937` `--color-ink-soft` secondary strong text.
- `#5D6E6B` `--color-muted` helper text.
- `#8A9A97` `--color-muted-soft` quiet labels.
- `#E3E9E8` `--color-border` default border.
- `#CBD8D3` `--color-border-strong` selected border.

**Success (budget / progress — teal family, per UI.md)**
- `#007C78` `--color-success` budget and success progress.
- `#E6F5F4` `--color-success-soft` success surface.
- `#00605D` `--color-success-strong` success text.

**Compare flow (Hana-inspired identity now folded into the main teal — aliases kept for existing code)**
- `#009591` `--color-compare-primary` compare report CTA and identity accent.
- `#007C78` `--color-compare-primary-strong` pressed compare CTA / high-emphasis compare text.
- `#E6F5F4` `--color-compare-primary-soft` quiet compare icon and insight surfaces.
- `#DCE6E3` `--color-compare-border` compare report divider and card border.
- `#CBD8D3` `--color-compare-border-strong` compare report frame and muted chart segment.

**Data-viz (duotone — teal sequential + red for the gap. The old blue/orange/violet chart tokens are removed; re-map chart code to these.)**
- `#009591` `--color-chart-1` primary segment / "me".
- `#79CAC7` `--color-chart-2` secondary segment.
- `#BEE6E4` `--color-chart-3` tertiary segment.
- `#ED1651` `--color-chart-gap` over-budget / comparison-gap / FOMO segment.
- `#D7DEDB` `--color-chart-muted` "other" / remainder segment.

**Coach (recommends action → teal side, not violet)**
- `#009591` `--color-coach` AI coach accent.
- `#E6F5F4` `--color-coach-soft` AI coach subtle surface.
- `#BEE6E4` `--color-coach-border` AI coach border.

**State**
- `#E8912A` `--color-warning` true over-budget / warning only (rare).
- `#FDF1E3` `--color-warning-soft` warning surface.
- `#C90E43` `--color-danger` destructive state (red-600, one shade darker than accent).
- `#FDE7EC` `--color-danger-soft` destructive surface.
- `#EEF0F1` `--color-track` progress track.
- `#BFC7C4` `--color-track-strong` secondary progress.
- `rgba(0, 149, 145, 0.18)` `--color-focus` focus ring.

## Typography
- Font stack: `Paperlogy`, `Apple SD Gothic Neo`, `Noto Sans KR`, system sans-serif.
- Load Paperlogy via `@font-face` (adjust paths/filenames to the files placed in `public/`; Paperlogy ships numbered weights `1Thin`–`9Black`):

```css
@font-face { font-family:"Paperlogy"; src:url("/Paperlogy/Paperlogy-3Light.ttf")     format("truetype"); font-weight:300; font-display:swap; }
@font-face { font-family:"Paperlogy"; src:url("/Paperlogy/Paperlogy-4Regular.ttf")   format("truetype"); font-weight:400; font-display:swap; }
@font-face { font-family:"Paperlogy"; src:url("/Paperlogy/Paperlogy-5Medium.ttf")    format("truetype"); font-weight:500; font-display:swap; }
@font-face { font-family:"Paperlogy"; src:url("/Paperlogy/Paperlogy-6SemiBold.ttf")  format("truetype"); font-weight:600; font-display:swap; }
@font-face { font-family:"Paperlogy"; src:url("/Paperlogy/Paperlogy-7Bold.ttf")      format("truetype"); font-weight:700; font-display:swap; }
@font-face { font-family:"Paperlogy"; src:url("/Paperlogy/Paperlogy-8ExtraBold.ttf") format("truetype"); font-weight:800; font-display:swap; }
@font-face { font-family:"Paperlogy"; src:url("/Paperlogy/Paperlogy-9Black.ttf")     format("truetype"); font-weight:900; font-display:swap; }
```

- Home greeting: `22px / 900 / 1.3 / 0`.
- Auth lead title: `22px / 900 / 1.3 / 0`, text-first with no decorative character art.
- Page title: `18px / 800 / 1.3 / 0`.
- Section title: `16px / 900 / 1.35 / 0`.
- Card title: `16px / 800 / 1.45 / 0`.
- Body: `14px / 500 / 1.58 / 0`.
- Caption: `12px / 700 / 1.45 / 0`.
- Display numbers (hero amounts / percentages / counts): Paperlogy `900` (Black), tighten `letter-spacing:-0.02em`, scale `34–56px`. This is the oversized-numeral signature.
- Numbers: use `font-variant-numeric: tabular-nums` everywhere money or counts appear.

## Spacing
- Base unit: `4px`.
- Tokens: `--space-1 4px`, `--space-2 8px`, `--space-3 12px`, `--space-4 16px`, `--space-5 20px`, `--space-6 24px`, `--space-7 28px`, `--space-8 32px`, `--space-10 40px`, `--space-12 48px`.
- Home horizontal padding: `20px`.
- Card padding: `16px`.
- Home section gap: `12px`.
- Bottom safe area: keep at least `32px` scroll padding above the tab bar.

## Components
- Phone shell: max-width `430px`, desktop radius `28px`, mobile radius `0`.
- Home card: white, `1px solid --color-border`, radius `18px`, soft shadow.
- Home first-screen order: greeting, birthday fund, asset status, today budget, daily mission, today points, spending summary, and following finance signals.
- Mission card: white card surface, compact status icon, **teal (`--color-primary`) progress**, clear next-action affordance; on completion the check fills teal and points animate toward the wallet.
- Budget card: white, three number columns, **teal (`--color-success`) progress**.
- Spending summary: four circular category icons with compact values (icons neutral; use `--color-chart-gap` red only when a category is over budget).
- Asset status: total asset number plus right-aligned sparkline (teal line; red only for a loss/gap).
- Following summary: four compact stats with social-finance icon badges; a high participation ratio (≥60%) may use `--color-accent` as the FOMO cue.
- Participation bar (`N / M · %`): filled bar + avatar stack; the fill uses teal, the "you're behind" emphasis uses `--color-accent`.
- Compare gauge (me vs group): split bar, **me = teal, other = red**, big tabular number, one-line reading caption.
- FOMO card: `--color-accent-soft` (or solid `--color-accent`) surface, one bold stimulus line + immediate CTA; max one per screen.
- Primary button: **teal (`--color-primary`)** background, white text, minimum height `48px`, radius `14px`; pressed = `--color-primary-strong`.
- Compare report flow: teal primary CTA, quiet white report surfaces, divider rows for repeated content, `1/4` progress rail instead of pill-like step tabs, and a floating sticky CTA button above BottomNav without a visible tray.
- Bottom tab: fixed 5 tabs, **active teal (`--color-primary`)** state, safe-area padding.
- Empty state card: dashed border, muted background, clear next action.
- Auth lead: text-first app entry panel with no decorative character art, supporting copy spanning the full card width.

## Motion
- Compare flow shadows: `--shadow-compare-tray`, `--shadow-compare-panel`, `--shadow-compare-button`, and `--shadow-compare-success` are reserved for the compare report flow.
- Duration: `150ms` for press/focus, `220ms` for card and route affordances.
- Signature: hero numbers count up (`300–600ms`); participation/compare bars fill once on scroll-in (`500ms`).
- Easing: `cubic-bezier(.2, .8, .2, 1)`.
- GPU-only motion: transform and opacity.
- Reduced motion: remove nonessential transitions and count-ups; render final values immediately.

## Do / Don't
- Do keep **teal as the single brand primary**; use **red only** for FOMO, comparison gaps, and alerts (1–2 emphases per screen max).
- Do keep the current home reference order: birthday fund, asset status, today budget, daily mission, today points, spending summary, then following finance signals.
- Do keep charts **teal/red duotone** (teal sequential for categories, red for the gap/over segment).
- Do separate real user state from seeded demo state.
- Do make SNS elements feel like verified financial activity, not casual comments.
- Don't auto-fill new accounts with fake missions, assets, friends, or birthday funds.
- Don't use **purple/violet** anywhere, or multi-hue (blue/orange/violet) chart palettes.
- Don't use Pretendard/Inter/Hana2 for display — the project font is **Paperlogy**.
- Don't use competitor logos, unverified claims, heavy gradients, glass panels, or decorative glow.