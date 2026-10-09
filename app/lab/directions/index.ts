import type { DirectionSlug } from "../registry";
import type { Direction } from "../site";

import mech from "./mech";
import monograph from "./monograph";
import portal from "./portal";
import wireframe from "./wireframe";
// `npm run lab:new` adds new imports above this line

/** Each direction's skin, keyed by its slug in `../registry.ts` */
export const directionComponents: Record<DirectionSlug, Direction> = {
  wireframe,
  monograph,
  mech,
  portal
  // `npm run lab:new` adds new directions above this line
};
