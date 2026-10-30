A long WebGPU export keeps the GPU to itself · 2026-10-30

- **A long WebGPU export keeps the GPU to itself.** An export whose WebGPU dispatch ran past 15 seconds (an 8K Buddhabrot on a slower GPU, or the first WebGPU use in a session) was taken for a hung one, and the screen started a render into the same GPU buffers while the export still used them, so the export could be colored from the screen render's density instead of its own. The export now keeps the GPU until it finishes, for up to two minutes.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
