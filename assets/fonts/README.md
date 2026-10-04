# Reactor — Bundled fonts

The brand fonts for the AEON / Reactor mission build live here. The
launch build is fully offline-self-contained: zero external HTTP
origins, zero CDN dependencies. Both `index.html` (the app),
`aeon.html` (landing page), and `aeon-poster.html` (specimen poster)
load these files directly via inline `@font-face` declarations.

## Files in this directory

Three Latin-regular static-axis cuts, ~62 KB total:

| File | Size | SHA-256 |
|---|---|---|
| `inter-tight-v9-latin-regular.woff2` | 22,016 | `6f32da94d4f26e98cb6ccd97034d306aa38945322c816f54a93c7d15dc0905b8` |
| `fraunces-v38-latin-regular.woff2`   | 17,968 | `e558f39453a9c611908be04294b50dea5f21ae6c49b41c6e47f4115e91f90209` |
| `eb-garamond-v32-latin-regular.woff2`| 21,704 | `b63448e2680a0dbde70ebb2f3de78f6c515122835491f938e8a8595b46f29210` |

These are the **`google-webfonts-helper`** (`gwfh.mranftl.com`)
packaging of the standard Google Fonts cuts at single-axis Latin
range — small, fast, no licensing entanglement (all three fonts are
SIL-OFL).

## License

All three families are licensed under the **SIL Open Font License,
Version 1.1**. The full license text and per-font copyright notices live
in [`OFL.txt`](./OFL.txt) in this directory, distributed alongside the
`.woff2` files as OFL §2 requires. None of the three declares a Reserved
Font Name.

Heavier weights (semibold, bold) and italic synthesize via the
browser's CSS `font-weight` / `font-style` cascade (faux-bold +
oblique transforms applied to the regular cut). At the sizes the UI
uses this is visually indistinguishable from a static-bold cut for
all but the most discerning typographer; if pre-flight visual audit
shows artifacts, swap the regular files for an italic / bold static
cut from the same family without changing the `@font-face` family
names — the cascade resolves automatically.

## How they wire in

Inline `@font-face` declarations live at the top of:

- `index.html` `<style>` block — main app
- `aeon.html` initial `<style>` block — landing page
- `aeon-poster.html` initial `<style>` block — specimen poster

`sw.js` `SHELL_ASSETS` pre-caches all three at install time, so the
service worker has them available offline from first activation.

## Acceptable fallback

If a future mission rebuilds the app and these files are missing,
the bundle gracefully degrades to platform fonts:

- `Inter Tight` → `Poppins` → `system-ui` → `sans-serif`
- `Fraunces` → `Lora` → `Georgia` → `serif`
- `EB Garamond` → `Georgia` → `serif`

Functional but visually generic. `tests/a11y.mjs` reports zero
violations either way.

## File integrity

The hashes above are baked into `docs/mission-launch/LAUNCH_RECORD.md`
and the `mission-launch-v5.2.0` git-tag annotation. Future
archaeologists verify font bytes by computing `shasum -a 256 *.woff2`
against this table.

## Replacing fonts in a future build

If a future build needs to swap fonts (typeface change, weight cut
upgrade, language coverage extension):

1. Drop the new woff2 file(s) into this directory.
2. Update the filename references in:
   - `index.html` (search for `@font-face`)
   - `aeon.html` (search for `@font-face`)
   - `aeon-poster.html` (search for `@font-face`)
   - `sw.js` `SHELL_ASSETS` (the three font paths)
3. Run `npm run build` and `npm run test:full`.
4. Update this README's hash table and `docs/mission-launch/LAUNCH_RECORD.md`.
