# Icon Placeholders

This directory contains the extension icons in different sizes required by Chrome extensions.

For a production extension, you would replace these placeholder files with actual icon images:

- `icon-16.png` - 16x16 pixels (toolbar)
- `icon-32.png` - 32x32 pixels (Windows)
- `icon-48.png` - 48x48 pixels (extension management page)
- `icon-128.png` - 128x128 pixels (Chrome Web Store)

## Icon Design Guidelines

- Use a consistent design across all sizes
- Ensure good contrast and visibility
- Follow Chrome extension icon design principles
- Consider both light and dark themes
- Make sure icons are recognizable at small sizes

## Suggested Icon Concept

For the UUID Resolver extension, consider an icon that represents:
- UUID/identifier concept (perhaps stylized blocks or segments)
- Resolution/transformation (arrow or connection elements)
- Workspace ONE UEM branding compatibility (if applicable)

The icon could be a minimalist design showing segmented blocks (representing UUID parts) with an arrow pointing to text or a resolved symbol.

## Icon Design Brief

**Theme:** Identifier transformation with Workspace ONE UEM compatibility

**Visual elements:**

- **Hexadecimal String Motif:** a horizontal or diagonal string like `a3f9-1b2c` or `0e4d-a7c1` in a stylized, high-contrast font; slight tracking to evoke a UUID.
- **Barcode Element:** a subtle, abstract barcode pattern (few vertical lines with varying thickness) behind or beside the string.
- **Arrow Symbol:** a clean forward arrow (`→` or `↦`) connecting the string to a simplified object endpoint, implying resolution/transform.

**Color palette (updated):**

- Dominant: Navy. Use Indigo and Magenta as accent colors only. Ensure AA contrast on 16×16; prefer white glyphs on Navy backgrounds.
  - Example swatches (suggested): Navy (#0F1E3A), Indigo (#4B5CF0), Magenta (#E11D48). Adjust as needed to meet contrast.

**Style:**

- Flat or semi-flat; minimal gradients/shadows; legible at 16×16. Prefer vector (SVG) source and export crisp PNGs at 16, 32, 48, 128.

**Export checklist:**

- `icon-16.png`: simplify details; keep bold glyphs only.
- `icon-32.png`: add subtle barcode lines if visible.
- `icon-48.png` and `icon-128.png`: full motif with arrow and barcode.
- Test on light/dark Chrome toolbars.
