/**
 * Checked pages
 * ==================================================
 * The pages every direction is checked on: the lab's samples, one of each
 * kind of page, and the pages whose sections no sample has, so every
 * section a requirement reads gets rendered (`./conformance.test.ts` makes
 * sure). Free of server code, so the style guide can read it.
 */

import { SAMPLE_PAGES } from "../site/ia";

export const CHECKED_PATHS = [
  ...SAMPLE_PAGES.map((page) => page.path),
  // A case study with a quote in it, every tag, every page, and the
  // newsletter on a page of its own
  "/portfolio/gofundme/",
  "/tags/",
  "/page-list/",
  "/subscribe/"
];
