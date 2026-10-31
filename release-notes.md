Keys respond at once while a transparent Buddhabrot layer redraws · 2026-10-31

- **Keys respond at once while a transparent Buddhabrot layer redraws.** With Transparent background on, a Buddhabrot layer redrew its whole transparent picture each time the view refreshed, even when nothing had changed, and a key pressed meanwhile waited for the redraw to finish, about 12 seconds at the default sample count. The layer now keeps its picture until something changes, and a key pressed during a redraw interrupts it and takes effect at once.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
