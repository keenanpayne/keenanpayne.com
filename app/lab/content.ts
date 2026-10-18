/**
 * The shared content, shipped once
 * ==================================================
 * `virtual:lab-content` (see `vite.config.ts`) is `getLabContent()`
 * serialized at build time as a module of its own, so the routes that
 * render a direction don't repeat it in every page's loader data. The lab
 * rebases its links in the browser, as the style guide does.
 */

import { useMemo } from "react";

import content from "virtual:lab-content";

import { rebaseLinks } from "./links";

/** The shared content, with its links pointed at `base` (`""` for the site root) */
export function useLabContent(base: string) {
  return useMemo(() => (base ? rebaseLinks(content, base) : content), [base]);
}
