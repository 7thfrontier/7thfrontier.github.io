Buddhabrot frames keep their brightness, and Fog Distance works everywhere · 2026-10-13

- **Buddhabrot PNG sequences keep their brightness.** The first frame of a PNG sequence from Motion Studio could be written before its render finished, because a redraw queued by rewinding to the first keyframe started on top of it. A Buddhabrot frame then came out almost black. Video and frame-exact exports drop that queued redraw the same way.
- **Frame-exact video export saves its file again.** The export rendered and encoded every frame, then failed while naming the file, so nothing was saved and the status stayed on its progress line.
- **Fog Distance works on Quaternion Julia and Mandelbox.** On both types the fog began beyond the farthest surface of the opening view, so the default picture had no fog and moving Fog Distance changed nothing. The fog now begins just in front of each type's own surface, as it already did on Mandelbulb, so the default shows a little depth haze and the control moves it both ways.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
