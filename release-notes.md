Copy Link says when a link cannot carry a piece, and a missing fractal type is named instead of hidden · 2026-10-19

- **Copy Link refuses a piece the link cannot carry.** When a piece uses keyframes, more than one layer, or flame transforms, Copy Link says why and the Export menu offers Save Project (.aeon) instead, so a shared link never opens a different picture.
- **Opening a saved project or gallery entry made in a newer version now says when its fractal type is missing.** A note names the type and the version you are running, and everything else in the file still loads; before, it quietly opened as Mandelbrot.
- **A saved layer made in a newer version now says when its fractal type is missing, too.** The same note names the type and your version, and the rest of the project loads.
- internal: the test browsers move to puppeteer 25.14.0 (Chrome 155) and playwright 1.64.1, from dependabot #543 and #542. All five renderer-pinned stores (smoke goldens, visual baselines, color-chain and timed goldens, and the Catalog previews) were re-recorded under it; every hash and image came out byte-identical, so only their renderer stamps change.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
