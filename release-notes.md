Blending on a single layer · 2026-11-03

- **A single layer's blending settings now work without moving it.** On a lone layer, Opacity, Blend and Transparent background did nothing until the layer's transform was changed, and then all of them appeared at once, even for a move of half a pixel. They now take effect as soon as they are set, in exports as well as on screen. A layer left at its defaults draws exactly as before.
- **Transparent background no longer keeps an old view's picture after a click zoom.** With a layer's Transparent background on, zooming with a click could leave the previous view's picture on screen until the next edit.
- **A batch re-cut that drops one member reruns only what that member reached.** Before, removing a member from a batch after its release check went red meant running the whole check again. Now the new check keeps the earlier run's passes for every test the dropped member could not affect, and reruns the rest along with anything that was red, skipped or unmeasured. A check that itself kept earlier passes can now be the source for the next re-cut too, as long as every kept pass traces back to a run that really ran it.
- **The test render cache no longer piles up in the temp directory.** It kept one folder of about 48 MB per build and never removed an old one; a busy day left more than a gigabyte. Starting a new build's folder now removes cache folders nobody has used for six hours, and a folder still being read counts as used.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
