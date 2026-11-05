The release check finds browser tests that reach a changed function · 2026-11-04

- **Test runs can record which app functions each browser test exercises.** With `REACTOR_COVERAGE_DIR` set, every browser test writes the names of the functions it ran, and `bin/coverage-map.mjs` turns those records into a map from function to tests. It can pick the tests a change needs from that map and score the pick against past release checks. Nothing uses the map to choose tests yet; it is measured beside the current rules first.
- **A change to a function that tests reach only through the interface now selects those tests.** A test that clicks through the app, such as the user journeys, never names the functions behind the clicks, so the release check could not tell it ran them. The selection now also takes the tests the coverage recording saw run a changed function, when fewer than one test in ten ran it. It only adds tests, and names the function that added each one.

© 2026 [7th Frontier, Inc.](https://www.7thfrontier.com/) All Rights Reserved.
