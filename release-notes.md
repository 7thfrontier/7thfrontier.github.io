The Apollonian Gasket pattern draws a true gasket · 2026-10-28

- **`reactor-render` centers its picture and keeps geometry to `--size`.** It laid the page out with the inspector open, and the app centers the view on the part of the window the inspector leaves uncovered, so a fractal sat left of center and a geometry image came out 384 px wider than `--size`. It now renders with the inspector folded.
- **The Apollonian Gasket pattern draws a true gasket.** It drew some circles twice, overlapped circles in the middle gap, and left the three gaps along the outer circle nearly empty. Each gap now gets exactly one circle per level, touching the three circles around it, so the middle is no longer crowded with overlapping circles and every gap, the three along the outer circle included, is filled to the chosen depth.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
