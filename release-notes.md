3D fractals have a Fog density control · 2026-10-28

- **Fog density for 3D fractals.** A new Fog density slider in 3D Quality sets how thick the fog is. Fog distance only moved where fog began, at a fixed thickness, so inside a Mandelbox or close to any surface the fog never showed whatever the slider said. Raise Fog density for close or interior fog. At its default of 1 every existing view looks exactly as before.
- **Quaternion Julia fog on WebGPU starts where it does on WebGL.** On WebGPU the fog in front of a Quaternion Julia set began more than twice as far away as on WebGL, so Fog distance and Fog density barely changed it.
- **`reactor-render` writes images again.** Every render through the command-line renderer waited for a second frame that never came and gave up after `--wait` without writing a file. It now waits for the frame it asked for. A bare `--geometry` renders the default pattern instead of saving the default fractal under a geometry name, and an unknown `--format` is refused as a bad argument (exit 2) instead of failing with a stack trace.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
