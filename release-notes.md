WebGPU draws one frame at a time · 2026-10-30

- **WebGPU draws one frame at a time.** Switching between Buddhabrot and Anti-Buddhabrot while WebGPU was still drawing could leave the old picture on screen until the next change, and exporting a composite with a WebGPU Buddhabrot layer while the screen was still drawing could mix that drawing into the exported layer. A new WebGPU draw now waits for the one in progress, and a type that does not use WebGPU still draws at once.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
