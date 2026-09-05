---
name: BeforeDoors
description: Know before you go.
colors:
  trailhead-paper: "oklch(0.965 0.025 88)"
  evergreen-ink: "oklch(0.28 0.075 151)"
  evergreen-muted: "oklch(0.4 0.05 145)"
  route-orange: "oklch(0.69 0.2 52)"
  route-orange-hover: "oklch(0.62 0.2 49)"
  route-orange-ink: "oklch(0.2 0.05 145)"
  map-line: "oklch(0.34 0.06 145 / 24%)"
  field-paper: "oklch(0.99 0.01 88 / 94%)"
  field-ink: "oklch(0.25 0.06 145)"
  field-placeholder: "oklch(0.47 0.04 145)"
  field-border: "oklch(0.31 0.07 145)"
  focus-orange: "oklch(0.69 0.2 52)"
  night-evergreen: "oklch(0.24 0.025 151)"
  night-paper: "oklch(0.96 0.025 88)"
  night-muted: "oklch(0.82 0.035 94)"
  night-field: "oklch(0.96 0.018 88)"
  verified-green: "oklch(72.3% 0.219 149.579)"
  pending-amber: "oklch(75% 0.183 55.934)"
  signal-red: "oklch(63.7% 0.237 25.331)"
  destructive-red: "oklch(0.58 0.22 27)"
typography:
  display:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "clamp(2rem, 7vw, 5rem)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  diagnostic:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "clamp(3.25rem, 13vw, 6rem)"
    fontWeight: 600
    lineHeight: 0.88
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3333
    letterSpacing: "0.14em"
  data:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.3333
    letterSpacing: "normal"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
components:
  button-primary:
    backgroundColor: "{colors.route-orange}"
    textColor: "{colors.route-orange-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 10px"
    height: "32px"
  button-trailhead-cta:
    backgroundColor: "{colors.route-orange}"
    textColor: "{colors.route-orange-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "16px 20px"
    height: "64px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.evergreen-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 10px"
    height: "32px"
  input:
    backgroundColor: "{colors.field-paper}"
    textColor: "{colors.field-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "16px 20px"
    height: "64px"
---

# Design System: BeforeDoors

## Overview

**Creative North Star: “The Trailhead Field Guide”**

BeforeDoors now uses one visual world across the homepage and system status route. The page feels like a calm field guide at the start of a journey: warm map paper, deep evergreen ink, a bright orange route signal, and precise square instruments. The homepage uses that world to make a venue URL feel like a trailhead; the status page uses the same surface and controls to make system evidence easy to inspect.

The design is expressive in its material and restrained in its information treatment. Contour lines and route marks provide orientation, while text, borders, and explicit state labels carry meaning. The same light and dark semantic tokens drive both routes through `--app-*` variables; route-specific composition may differ, but color, type, shape, focus, and navigation behavior stay shared.

**Key Characteristics:**

- Warm contour-map paper with a deep evergreen reading voice.
- Bright orange reserved for the primary route action and directional linework.
- Square, one-pixel instruments with visible focus and pressed states.
- Inter Variable for all interface text; monospace only for diagnostic values.
- Evidence-first status labels that remain explicit in both themes.
- Full-height, low-clutter entry view on `/`; readable, scrollable diagnostic record on `/status`.

## Colors

The shared palette pairs warm ivory and evergreen with a single vivid orange route accent. The status colors remain semantic and never become decoration.

### Primary

- **Route Orange** (`oklch(0.69 0.2 52)`): The homepage CTA, focus treatment, and route line. Hover deepens to `oklch(0.62 0.2 49)`.
- **Route Orange Ink** (`oklch(0.2 0.05 145)`): Text and icons placed on orange controls.

### Neutral

- **Trailhead Paper** (`oklch(0.965 0.025 88)`): Light-mode page ground for both `/` and `/status`.
- **Evergreen Ink** (`oklch(0.28 0.075 151)`): Primary text, product identity, and structural emphasis.
- **Evergreen Muted** (`oklch(0.4 0.05 145)`): Supporting copy, route labels, and quiet metadata.
- **Map Line** (`oklch(0.34 0.06 145 / 24%)`): One-pixel borders and low-contrast contour structure.
- **Field Paper** (`oklch(0.99 0.01 88 / 94%)`): URL input surface and raised paper-toned controls.
- **Field Border** (`oklch(0.31 0.07 145)`): URL instrument stroke.
- **Night Evergreen** (`oklch(0.24 0.025 151)`): Dark-mode page ground.
- **Night Paper** (`oklch(0.96 0.025 88)`): Dark-mode text and warm contrast reference.

### Status

- **Verified Green** (`oklch(72.3% 0.219 149.579)`): A confirmed live connection only.
- **Pending Amber** (`oklch(75% 0.183 55.934)`): A query that is still checking or awaiting evidence.
- **Signal Red** (`oklch(63.7% 0.237 25.331)`): A failed or conflicting system state.
- **Destructive Red** (`oklch(0.58 0.22 27)`): Invalid or destructive consequences.

### Named Rules

**The Shared Trailhead Rule.** Homepage and status use the same `--app-*` palette, contour surface, header, border, focus, and control treatment. A route may change composition, but it does not invent a second theme.

**The Signal Reserve Rule.** Green, amber, and red communicate named state only. Orange is the brand route accent and is not a substitute for status meaning.

**The Evidence Before Atmosphere Rule.** Map texture stays quiet behind content; provenance, uncertainty, and current state always win the contrast hierarchy.

## Typography

**Display Font:** Inter Variable (with `sans-serif`)
**Body Font:** Inter Variable (with `sans-serif`)
**Label/Mono Font:** Inter Variable for labels; `ui-monospace` for diagnostic values and tabular data.

**Character:** Typography is direct and compact, with a large, tightly tracked promise on the homepage and an equally confident live-state word on the status page. Supporting copy remains readable and matter-of-fact so visual confidence never implies evidence certainty.

### Hierarchy

- **Display** (600, `clamp(2rem, 7vw, 5rem)`, `0.9`): The homepage promise, held to one line in the normal desktop viewport.
- **Diagnostic** (600, `clamp(3.25rem, 13vw, 6rem)`, `0.88`): The live status state such as Connected or Checking.
- **Body** (400, `1rem`, `1.75` on the homepage): Explanatory copy, kept near 46–58ch for comfortable reading.
- **Label** (600, `0.75rem`, uppercase with `0.14em` tracking): Field labels, compact route labels, buttons, and metadata.
- **Data** (400, `0.75rem`, `1.3333`): Diagnostic keys and values where exact strings matter.

### Named Rules

**The Plain Promise Rule.** Let the headline invite action, while supporting copy names what the product can actually verify and leaves room for unknowns.

## Layout

Both routes share a 56px product bar, responsive horizontal padding of 20px below 640px and 32px from the `sm` breakpoint, square side rules, and the same centered 5xl header alignment. The homepage fills the viewport beneath the bar and keeps its single URL action in the visual center; its stage intentionally does not scroll in the normal viewport. The status route uses the same map stage but places a readable 44rem diagnostic record inside it, allowing the record to scroll when its specification exceeds the viewport.

The core spacing rhythm follows 4px steps, with 12–20px control internals, 24px group gaps, and 32–40px section separation. Content that explains evidence stays within roughly 48–58ch even when the surrounding stage is wider.

## Elevation & Depth

The system is flat at rest. Warm paper, a one-pixel evergreen line, and a lightly contrasting field provide depth without floating cards. Shadows appear only on transient menus and tooltips, where they communicate temporary elevation.

### Shadow Vocabulary

- **Overlay Medium** (`0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): Dropdown menus and short-lived overlays.
- **Overlay Large** (`0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): Nested or higher-order transient menus only.

### Named Rules

**The Flat-by-Default Rule.** Resting surfaces use paper tone or a one-pixel line. Shadow belongs to temporary overlays, never to a content card at rest.

## Shapes

Square corners (`0px`) define buttons, fields, records, menus, and structural borders. Fully round geometry is reserved for intrinsically round status signals. Contour paths and the dashed route line are crisp vector geometry, not a replacement for content. Focus adds a one-pixel orange ring, and pressed controls move down one pixel.

## Components

Components are precise trail instruments: compact where they support inspection, larger where they invite the first action.

### Buttons

- **Shape:** Square (`0px`) with a 32px shared default height.
- **Primary:** Route Orange with Route Orange Ink; the homepage CTA expands to 56px on narrow screens and 64px from `sm` upward.
- **Hover / Focus:** Hover deepens the route orange; focus changes the border and adds a one-pixel ring from `--app-focus`; active controls translate down one pixel.
- **Outline / Ghost:** Transparent or paper-toned with a one-pixel map-line border; hover uses a warm muted surface.

### Cards / Containers

- **Corner Style:** Square (`0px`).
- **Background:** Trailhead Paper for page records; Field Paper for URL instruments.
- **Shadow Strategy:** No resting shadow; use a one-pixel line and tonal contrast.
- **Border:** One-pixel `--app-line` or `--app-field-border`.
- **Internal Padding:** 16px for compact groups, 20–32px for route sections.

### Inputs / Fields

- **Style:** Square Field Paper surface with a one-pixel field border. The homepage URL instrument is 56px high on narrow screens and 64px from `sm` upward, with 18px text.
- **Focus:** The full field group shifts to Route Orange and gains a 2px low-opacity ring.
- **Error / Disabled:** Invalid fields use Destructive Red with an inline, announced message; disabled controls preserve readable text and lower opacity.

### Navigation

- **Style:** Shared 56px product bar with BeforeDoors identity at the start, the phrase “Know before you go” on wider screens, route context at the end, and the square theme menu control.
- **States:** Both `/` and `/status` use the landing header treatment and the same 5xl alignment. Links underline on hover and retain visible keyboard outlines.
- **Theme:** Light, dark, and system choices invert the semantic Trailhead tokens without changing layout.

### Diagnostic Receipt

- **Structure:** `/status` keeps a 44rem readable record within the Trailhead map stage, with a heading, live state, monospace specification ledger, scope notes, and footer.
- **State:** Connected, Checking, and Error pair a text label with a semantic signal color and live announcement.
- **Scope:** “What this confirms” and “What remains unverified” keep the diagnostic honest and preserve the product’s evidence-first voice.

### Trailhead Surface

- **Material:** A warm contour-map field with a dashed orange route entering from the edges.
- **Use:** Shared by the homepage and status stage; keep contours behind content and keep the route accent purposeful.

## Do's and Don'ts

### Do:

- **Do** use the shared `--app-*` tokens for both `/` and `/status`.
- **Do** keep the Trailhead paper, evergreen ink, orange route, square geometry, and 56px navigation bar consistent across routes.
- **Do** preserve explicit status labels and use green, amber, and red only for named states.
- **Do** keep focus visible, errors announced, and explanatory copy readable in both themes.
- **Do** use contour texture as quiet orientation and keep evidence text above atmosphere.
- **Do** use monospace only for exact diagnostic values, identifiers, or tabular data.

### Don't:

- **Don't** introduce a second route palette or revert `/status` to a monochrome-only shell.
- **Don't** use orange as a proxy for Connected, Checking, Error, Unknown, or Conflicting.
- **Don't** add resting card shadows, rounded SaaS cards, gradients, or pill-heavy controls.
- **Don't** let contour lines reduce text contrast or cross the primary reading path at high opacity.
- **Don't** use confident copy to hide unknown or conflicting accessibility evidence.
