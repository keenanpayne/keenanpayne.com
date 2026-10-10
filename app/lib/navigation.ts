import { useLocation, useMatches } from "react-router";

import type { PageModel } from "./types";

/**
 * The canonical URL of the page being rendered (e.g. `/about/`), falling back
 * to the current pathname for routes without a page model.
 */
export function usePageUrl() {
  const location = useLocation();
  const matches = useMatches();
  const page = matches[matches.length - 1]?.loaderData as PageModel | undefined;

  return page?.url ?? location.pathname;
}

// A navigation item is active on its own page and on any page beneath it
export const isActive = (itemUrl: string, pageUrl: string) =>
  itemUrl === pageUrl || pageUrl.includes(itemUrl);
