import type { ComponentType } from "react";

import type { LabContent, PageModel } from "../../lib/types";

import { Mech } from "./mech/Mech";
import { Monograph } from "./monograph/Monograph";
import { Portal } from "./portal/Portal";

export interface DirectionProps {
  /** Lab URL prefix for internal links, e.g. `/lab/monograph` */
  base: string;
  /** The site path being mocked up, e.g. `/about/` */
  path: string;
  /** The real page at `path` (`null` for the home page or a missing page) */
  page: PageModel | null;
  notFound: boolean;
  content: LabContent;
}

/** Each direction's page, keyed by its slug in `../registry.ts` */
export const directionComponents: Record<
  string,
  ComponentType<DirectionProps>
> = {
  monograph: Monograph,
  mech: Mech,
  portal: Portal
};
