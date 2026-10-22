/**
 * The live direction
 * ==================================================
 * The direction the site runs at its root: `app/routes/page.tsx` renders
 * every page with it, at `base=""`. The others stay in the lab, at
 * `/lab/<slug>/`, until their turn; to launch one, point this at it (and
 * run `npm run lab:check`, which holds every direction to the same feature
 * set, so it's ready). Imported statically, so the live skin ships in the
 * page route's chunk rather than loading after it.
 */

export { default as live } from "./directions/gridline";
