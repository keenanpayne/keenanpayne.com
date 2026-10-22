/**
 * A site path, resolved for a direction
 * ==================================================
 * What every renderer of a direction's page starts from: the live site
 * (`app/routes/page.tsx`), the lab's mockups (`app/routes/lab.$direction.tsx`),
 * the style guide's Shell sample, and the conformance checks. One place
 * turns a path into its view, navigation, content, and metadata, so they
 * can't drift apart.
 */

import {
  getLabContent,
  getNotFoundPage,
  getPage
} from "../../lib/content/content.server";
import type { LabContent, PageMeta } from "../../lib/types";
import { rebaseLinks } from "../links";

import { navigationFor, resolveView, type NavItem, type View } from "./ia";

export interface SitePage {
  /** The page's own path, e.g. `/about/`, however it was asked for */
  path: string;
  view: View;
  navigation: NavItem[];
  content: LabContent;
  /** The page's metadata, or the not-found page's */
  meta: PageMeta;
}

// The content is the same on every page, so its links are rebased once for
// each base (the lab's `/lab/<slug>`, or nothing on the live site)
const contents = new Map<string, LabContent>();

/** The shared content, with its links pointed at `base` */
export function labContentFor(base = "") {
  let content = contents.get(base);
  if (!content) {
    content = base ? rebaseLinks(getLabContent(), base) : getLabContent();
    contents.set(base, content);
  }
  return content;
}

/**
 * The page at a site path, as a direction renders it under `base` (where
 * its links lead: `/lab/<slug>`, or `""` at the site root). A path without
 * its trailing slash resolves to the same page.
 */
export function resolveSitePage(requested: string, base = ""): SitePage {
  const page = getPage(requested);
  const path = page?.url ?? requested;
  const view = resolveView(path, page);
  const links = { view, navigation: navigationFor(view, path) };

  return {
    path,
    ...(base ? rebaseLinks(links, base) : links),
    content: labContentFor(base),
    meta: (page ?? getNotFoundPage()).meta
  };
}
