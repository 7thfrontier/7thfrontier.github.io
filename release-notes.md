Variation sheets no longer freeze the app · 2026-10-21

- **Making a variation sheet no longer freezes the app.** After File > Variation sheet the app could stop answering clicks and keys until the page was reloaded, most often on a flame: two layer renders overlapped and left it waiting for one that had already finished. Each cell's preview now renders at the size it is shown instead of the full frame, so a deep-zoom or 3D sheet no longer blocks the window for many seconds, and one Undo returns the picture you had before the sheet.
- **Keyboard focus stays in the status bar's More menu.** When the bar refolded its cells (a render finishing, the window resizing), focus on More or on a badge inside it fell back to the page, so Enter did nothing. Focus now stays where it was, and Enter on a folded Raise Max Iter raises it.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
