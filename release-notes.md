Exports work in Brave · 2026-10-05

- **The landing page names its first section "The Instrument".** The top menu link and the section heading are capitalized; running text keeps the lowercase. Its second button reads "Read the Foreword", the in-app name, and opens the Foreword.
- **Shared links to the site show its picture and title.** The landing page and the app give an absolute address for their preview image and page, which link previews need, and the landing's title reads "AEON: Universal Dynamics Reactor".
- **"7th Frontier, Inc." links to the company site.** The Foreword, the landing page, the poster and the release notes link the name to https://www.7thfrontier.com/.
- **The public site and release notes read without engineering references.** Ticket numbers and test and tooling notes stay out of the landing page's changelog, the published release notes and the app's own messages.
- **The landing page gallery is captured again.** Its pictures come from the current renderer, each subject on a fixed seed so a recapture repeats, and the Mandelbrot frames seahorse valley in the Dusk palette.
- **A link that opens a seeded view keeps its framing.** On some browsers the app checked the picture before it was drawn, decided the view had come out a flat color, reset it to the type's default and said so. It now draws before it checks, and does not judge a picture that is not the one on screen.
- **Exports work in Brave.** Before an export the app checks that the browser can hold a canvas of that size by painting a test color and reading it back. Brave alters canvas readback slightly to resist fingerprinting, so the check refused every size and no file was written. It now accepts a near match and still refuses a canvas the browser could not allocate.
- **The inspector header is one row.** The type name and About sit on the left, play and fold on the right, with the small Inspector label above. A long name ends in an ellipsis instead of pushing the buttons onto a row of their own.
- **Opening a link with a seed no longer shows a false "uniform color" notice.** The check that rescues a restored view that came out as one flat color now runs only after you accept the offer to restore your last session, the case it was written for.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
