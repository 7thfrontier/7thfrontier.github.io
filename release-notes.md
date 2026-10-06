Fractals draw only what you can see · 2026-10-06

- **Escape-time fractals draw only the window.** With the Inspector open, the 24 escape-time types (Mandelbrot, Julia, Burning Ship, Newton and the rest) also drew the strip under the Inspector, which nobody sees. They now draw the window alone, 21% fewer pixels at 1440 by 900, on every path including deep zoom, so slow views finish sooner, and the picture does not move. In a composite, an IFS, Buddhabrot, attractor or flame layer stays in place beside them.
- **Post-FX now applies to deep zoom past the GPU's precision.** There the vignette, grain and other Post-FX were applied to the previous picture and then painted over, so the finished frame showed none of them. IFS, attractor and fractal flame renders on the main thread now also show the slow-render hint and announce "Render complete" to screen readers when they finish.
- **The Catalog stops re-rendering the view while you scroll.** The picture behind the sheet is redrawn once, when you close it, instead of every time a batch of previews finishes. Each preview still shows the art centred, as picking that card draws it. Previews are also kept across an update unless that update changes how pictures are drawn.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
