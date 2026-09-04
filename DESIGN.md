---
name: BeforeDoors
description: Know before you go.
colors:
  paper: "oklch(1 0 0)"
  ink: "oklch(0.145 0 0)"
  quiet-gray: "oklch(0.97 0 0)"
  quiet-gray-foreground: "oklch(0.556 0 0)"
  line: "oklch(0.922 0 0)"
  focus: "oklch(0.708 0 0)"
  dark-surface: "oklch(0.205 0 0)"
  dark-muted: "oklch(0.269 0 0)"
  destructive-red: "oklch(0.58 0.22 27)"
  signal-red: "oklch(63.7% 0.237 25.331)"
  verified-green: "oklch(72.3% 0.219 149.579)"
  pending-amber: "oklch(75% 0.183 55.934)"
typography:
  navigation:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4286
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  title:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4286
    letterSpacing: "normal"
  label:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3333
    letterSpacing: "normal"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  1: "4px"
  1-5: "6px"
  2: "8px"
  2-5: "10px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 10px"
    height: "32px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 10px"
    height: "32px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
    height: "32px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "16px"
  tooltip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
---

# Design System: BeforeDoors

## Overview

**Creative North Star: "The Access Field Guide"**

BeforeDoors should feel like a practical field reference prepared before a real journey: calm, exacting, utilitarian, and candid. Its visual language favors legibility, explicit state, and compact tools over brand spectacle. Information should appear inspectable rather than persuasive, supporting the product's evidence-first trust model without implying certainty the evidence does not contain.

The incumbent reusable system is a monochrome, semantic-token interface with light and dark modes, thin structural borders, compact typography, square controls, and restrained state motion. The built diagnostic surface demonstrates this language as a full-height service record: the live state leads, an itemized specification follows, and factual scope notes close the record. New work should extend the same precise-instrument language without treating this route-specific receipt composition as a universal page template.

**Key Characteristics:**

- Calm, exacting, utilitarian, and candid.
- Compact square controls that behave like precise instruments.
- Monochrome surfaces with color reserved for explicit status meaning.
- Flat structural separation through borders and rings.
- Equivalent semantic hierarchy in light and dark modes.

## Colors

The palette is deliberately achromatic at rest; chromatic color appears only when it communicates a concrete status or destructive consequence.

### Primary

- **Ink** (`oklch(0.145 0 0)`): Primary light-mode text and filled controls; it becomes the dark-mode page ground through semantic token inversion.

### Neutral

- **Paper** (`oklch(1 0 0)`): Light-mode page, card, and popover surfaces; also the high-contrast foreground reference for dark surfaces.
- **Quiet Gray** (`oklch(0.97 0 0)`): Secondary, muted, and hover surfaces in light mode.
- **Quiet Gray Foreground** (`oklch(0.556 0 0)`): De-emphasized explanatory text in light mode.
- **Line** (`oklch(0.922 0 0)`): Light-mode borders and input strokes.
- **Focus** (`oklch(0.708 0 0)`): Focus-ring color; pair it with a one-pixel ring and a visible border shift.
- **Dark Surface** (`oklch(0.205 0 0)`): Raised cards and popovers in dark mode.
- **Dark Muted** (`oklch(0.269 0 0)`): Secondary and muted dark-mode surfaces.

### Status

- **Verified Green** (`oklch(72.3% 0.219 149.579)`): A positive, explicitly verified or connected state—not general decoration.
- **Pending Amber** (`oklch(75% 0.183 55.934)`): Work in progress, checking, or evidence still pending.
- **Signal Red** (`oklch(63.7% 0.237 25.331)`): Failed or conflicting system status when the state is represented by an indicator.
- **Destructive Red** (`oklch(0.58 0.22 27)`): Destructive actions, invalid fields, and error emphasis in light mode; dark mode uses the existing lighter red token.

### Named Rules

**The Status Reserve Rule.** Verified Green, Pending Amber, and Signal Red communicate named states only; never spend them on decoration or generic brand emphasis.

**The Evidence Before Atmosphere Rule.** Neutral surfaces carry the interface so evidence, provenance, and uncertainty labels remain the visual focus.

## Typography

**Display Font:** No display face is committed in the incumbent system.
**Body Font:** Inter Variable (with `sans-serif` fallback)

**Character:** The type system is compact and matter-of-fact. It uses size, medium weight, and muted foreground color to establish hierarchy without theatrical contrast. Monospace is reserved for exact identifiers, query names, and tabular results rather than brand voice.

### Hierarchy

- **Navigation** (600, `0.875rem`, `1.4286`, `-0.015em`): The compact product identity link in the current app shell.
- **Body** (400, `1rem`, `1.5`): Default reading and page copy. Keep longer prose within approximately 65–75 characters per line.
- **Title** (500, `0.875rem`, `1.4286`): Card titles, compact section headings, and empty-state titles.
- **Label** (500, `0.75rem`, `1.3333`): Buttons, inputs, menu items, evidence metadata, and dense operational controls.

The current diagnostic uses a route-specific state display (`clamp(3.25rem, 13vw, 6rem)`, 600 weight, `0.88` line height, `-0.04em` tracking) and a 12-pixel monospace specification. These values serve the service-record hierarchy and are not general display or brand-heading tokens.

### Named Rules

**The Plain Statement Rule.** Use type to make meaning easier to scan, not to make uncertain information sound authoritative.

## Layout

The reusable components follow Tailwind's four-pixel base rhythm, most often using 6, 8, 10, 12, 16, and 24 pixel steps. Controls are intentionally compact: primary inputs and buttons are 32 pixels high, while smaller variants step down to 24 or 28 pixels. Component groups use tight 4–8 pixel internal gaps; major content groups use 16–24 pixels.

The current shell aligns a 56-pixel product bar and a full-height service record on the same centered `44rem` column. One-pixel side rules hold the column against a quiet page ground; internal horizontal padding is `20px` on narrow screens and `32px` from the 640-pixel breakpoint. The receipt retains logical source order, lets its content scroll beneath the fixed-height shell, and changes the two-column scope notes only when width permits. This is a proven diagnostic expression, not the complete application grid. Dense evidence views may use compact spacing, but touch targets must remain comfortably operable through padding, adjacent hit areas, or responsive expansion.

## Elevation & Depth

The system is flat and structurally separated. Resting surfaces, including input groups, use background contrast, one-pixel borders, or low-opacity rings rather than floating shadows. Shadows are reserved for transient overlays such as dropdown menus and tooltips.

### Shadow Vocabulary

- **Overlay Medium** (`0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): Dropdowns and short-lived menus.
- **Overlay Large** (`0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): Nested or higher-order transient menus only.

### Named Rules

**The Flat-by-Default Rule.** If a surface is present at rest, separate it with tone or a one-pixel line; reserve shadow for something temporarily above the document.

## Shapes

Square corners are the dominant component signature. Buttons, cards, inputs, menus, tooltips, attachments, message bubbles, empty states, checkboxes, and structural records all resolve to `0px` corners. Fully circular geometry is reserved for objects that are intrinsically round, such as avatars or small status dots; the diagnostic receipt uses a 12-pixel circle only as its state signal.

Borders are one pixel and semantic. Focus adds a one-pixel ring at 50% ring opacity plus a border-color shift. Pressed buttons move down by one pixel, giving the otherwise flat geometry a small tactile response.

## Components

Components should feel like precise instruments rather than soft promotional UI.

### Buttons

- **Shape:** Square (`0px`) with a compact 32-pixel default height and `10px` horizontal padding.
- **Primary:** Ink background with Paper foreground in light mode; semantic primary tokens invert appropriately in dark mode.
- **Hover / Focus:** Hover reduces primary opacity to 80%; focus shifts the border to Focus and adds a one-pixel 50%-opacity ring; active non-popup buttons translate down one pixel.
- **Outline:** Paper or transparent background with a Line border; hover uses Quiet Gray.
- **Destructive:** A low-opacity Destructive Red surface with red text, strengthening slightly on hover without becoming a solid alarm block.

### Cards / Containers

- **Corner Style:** Square (`0px`).
- **Background:** Semantic card surface; Paper in light mode and Dark Surface in dark mode.
- **Shadow Strategy:** None at rest.
- **Border:** One-pixel, 10%-foreground ring.
- **Internal Padding:** `16px` by default and `12px` for the small variant.

### Inputs / Fields

- **Style:** Square, transparent 32-pixel field with a one-pixel input stroke and `10px` horizontal padding.
- **Focus:** Border changes to Focus and gains a one-pixel 50%-opacity ring.
- **Error / Disabled:** Invalid state uses Destructive Red border and ring; disabled fields mute opacity and use a quiet filled surface while preserving readable text.

### Checkboxes

- **Style:** A square `16px` control with a one-pixel input stroke.
- **State:** Checked state uses semantic primary background and foreground; focus and invalid states follow the field conventions.
- **Hit Area:** The component adds invisible horizontal and vertical inset area so the visual control can stay compact without making interaction equally small.

### Menus and Tooltips

- **Menus:** Square semantic popovers with compact `12px` items, one-pixel rings, and 100-millisecond fade/zoom/slide transitions.
- **Tooltips:** Inverted Ink/Paper blocks with `12px` horizontal and `6px` vertical padding; the arrow is a small square rotated 45 degrees.
- **Elevation:** Use Overlay Medium or Overlay Large only while the overlay is open.

### Navigation

- **Style:** A 56-pixel product bar aligned to the document column, with one-pixel side and bottom rules, the BeforeDoors identity at the start, and a compact outlined theme control at the end.
- **Typography:** The product identity is `0.875rem` semibold with slightly tightened tracking; supporting phrase and route context use muted `0.75rem` text.
- **Theme:** Light, dark, and system choices are explicit; the icon transition uses scale and quarter-turn rotation without changing layout.

### Diagnostic Receipt

- **Structure:** A full-height, `44rem`-maximum service record placed directly beneath the product bar, divided by one-pixel rules rather than card elevation.
- **State:** A named live-query state dominates the upper record and always pairs its chromatic signal with text, an explanation, and a machine-readable result code.
- **Specification:** A 12-pixel monospace definition list itemizes system, query, expected result, refresh behavior, scope, and current result in a two-column ledger.
- **Motion:** Only the Pending signal pulses, using the standard two-second pulse; `prefers-reduced-motion` removes it.
- **Scope:** Plain-language blocks state both what the check confirms and what remains unverified. The record has no primary action because its purpose is inspection.

### Message and Evidence Primitives

- **Bubbles:** Square, compact, maximum 80% width, with semantic filled, muted, outline, ghost, tinted, and destructive variants.
- **Attachments:** Square bordered units with clear idle, processing, completed, and error states; thumbnails remain clipped to the component geometry.
- **Metadata:** Use `12px` text, muted foreground, short gaps, and explicit labels so source, freshness, and confidence can be scanned independently of color.

## Do's and Don'ts

### Do:

- **Do** keep evidence, provenance, confidence, and status labels explicit and readable in both themes.
- **Do** use square geometry, compact type, one-pixel borders, and the established 4-pixel spacing rhythm for reusable controls.
- **Do** reserve Verified Green, Pending Amber, and Signal Red for named status meaning.
- **Do** use visible focus borders and rings, semantic structure, and non-color status labels.
- **Do** preserve the same information hierarchy when semantic tokens invert for dark mode.

### Don't:

- **Don't** collapse exact diagnostic or provenance records into soft floating health cards that hide their scope.
- **Don't** soften the interface into pill-heavy, oversized, promotional SaaS styling.
- **Don't** use status colors as decoration or as the only carrier of meaning.
- **Don't** add resting card shadows where a tonal surface or one-pixel border provides enough separation.
- **Don't** use typography or visual emphasis to imply certainty beyond the evidence.
