import type { DirectionSlug } from "../registry";
import type { Direction } from "../site";

// Each direction is its own chunk, so a lab page loads only the one it shows
const loaders: Record<DirectionSlug, () => Promise<{ default: Direction }>> = {
  wireframe: () => import("./wireframe"),
  monograph: () => import("./monograph"),
  mech: () => import("./mech"),
  portal: () => import("./portal"),
  stipple: () => import("./stipple")
  // `npm run lab:new` adds new directions above this line
};

const loaded = new Map<DirectionSlug, Promise<Direction>>();

/**
 * Each direction's skin, keyed by its slug in `../registry.ts`. Returns the
 * same promise for a slug every time, so it can be passed to `use()`.
 */
export function loadDirection(slug: DirectionSlug) {
  let direction = loaded.get(slug);
  if (!direction) {
    direction = loaders[slug]().then((module) => module.default);
    loaded.set(slug, direction);
  }
  return direction;
}
