Turning WebGPU off no longer leaves a WebGPU frame on screen · 2026-11-23

- **Turning WebGPU off no longer leaves a WebGPU frame on screen.** A WebGPU render still waiting or drawing when a WebGL render followed, as when WebGPU was switched off mid-render, could finish afterwards and cover the WebGL picture with a frame from the engine just turned off, until the next render. The WebGL render now cancels any WebGPU frame still pending.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
