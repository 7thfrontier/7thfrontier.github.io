Quick export keeps the whole view · 2026-10-06

- **Quick export no longer crops a wide view.** A Quick export at a square or other size whose shape differs from the canvas cut the view down to fill it, while Print showed the whole view on bars. Quick now does what Print does: the full view, centered on the background color. Match canvas is unchanged.
- **The landing page and the poster carry a security policy.** Like the app, they now run only their own scripts and styles, refuse form submissions and load nothing from other sites. Nothing visible changes.
- **Pages cannot submit forms.** The app's security policy now refuses every form submission. The app has no forms, so nothing visible changes; a form slipped into any page content can no longer post anywhere.
- **3D fractals render only the window.** With the Inspector open, the Mandelbulb, Mandelbox, Menger sponge, quaternion Julia, Sierpinski tetrahedron and custom 3D types also rendered the strip under the Inspector, which nobody sees: 27% more pixels than a 1440 by 900 window. They now render the window alone, 4 to 25% faster per frame, and the picture does not move.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
