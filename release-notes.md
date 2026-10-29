reactor-render gains --list, --gallery and --version · 2026-10-28

- **`reactor-render --list`, `--gallery` and `--version`.** `--list` prints every fractal type, pattern and palette key the app knows, read from the built app itself. `--gallery <dir>` renders one image of every fractal type into a directory in a single Chrome session, names each type that fails and exits 1 if any did. `--version` prints the version.
- **`reactor-render` refuses an unknown type, pattern or palette key.** A mistyped `--fractal`, `--pattern` or `--palette` rendered the app's fallback (Mandelbrot, Flower of Life, or the first palette) and reported success. It now exits 2, names any close matches and points at `--list`; a retired pattern name still renders the pattern that replaced it.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
