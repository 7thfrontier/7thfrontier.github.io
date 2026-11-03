The vignette and opacity fields with the inspector open · 2026-11-02

- **The vignette frames what you see with the inspector open.** With the inspector open, the on-screen Post-FX vignette was sized for the whole canvas, including the strip under the inspector and the strip off the left edge, so the visible left and right edges came out barely darkened (about 0.09 against 0.65 with the inspector folded). It now darkens the visible edges the same way open or folded, in every family. Exports are unchanged.
- **Opening the inspector no longer changes how an opacity field fades the art.** A per-pixel stroke opacity field (radial, banded, angular, gradient, spectrum) took its center and size from the whole canvas, which with the inspector open includes the strip under the inspector and the strip off the left edge. Opening the inspector faded the art more, and the screen no longer matched the export. On screen the field now uses the frame the export uses, so the art fades the same with the inspector open or folded. Exports are unchanged.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
