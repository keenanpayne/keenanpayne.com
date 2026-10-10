/**
 * Information architecture
 * ==================================================
 * The kinds of page every direction designs, how a site path maps to one,
 * and the primary navigation. Directions share all of this, so their pages
 * line up one to one; only the skin changes between them.
 *
 * Adding a kind to `View` is a type error in every direction until each one
 * gives it a template (see `./direction.tsx`). Kept free of React so the
 * prerender config can read it.
 */

import type {
  BasicPageModel,
  PageModel,
  PortfolioPageModel,
  PostPageModel
} from "../../lib/types";

export type View =
  | { kind: "home" }
  | { kind: "work"; page: BasicPageModel }
  | { kind: "caseStudy"; page: PortfolioPageModel }
  | { kind: "writing"; page: BasicPageModel }
  | { kind: "post"; page: PostPageModel }
  | { kind: "about"; page: BasicPageModel }
  | { kind: "services"; page: BasicPageModel }
  | { kind: "service"; page: BasicPageModel }
  | { kind: "testimonials"; page: BasicPageModel }
  | { kind: "contact"; page: BasicPageModel }
  | { kind: "inquiry"; page: BasicPageModel }
  /** Any other page: type and tag archives, subscribe, … */
  | { kind: "page"; page: BasicPageModel }
  | { kind: "notFound" };

export type ViewKind = View["kind"];

/** Pages with a template of their own, by URL */
const PAGE_KINDS: Record<
  string,
  Extract<View, { page: BasicPageModel }>["kind"]
> = {
  "/portfolio/": "work",
  "/archive/": "writing",
  "/about/": "about",
  "/services/": "services",
  "/testimonials/": "testimonials",
  "/contact/": "contact",
  "/project-inquiry/": "inquiry"
};

/** Picks the kind of page to render for a site path and its page model */
export function resolveView(path: string, page: PageModel | undefined): View {
  if (path === "/") return { kind: "home" };
  if (!page) return { kind: "notFound" };
  if (page.layout === "post") return { kind: "post", page };
  if (page.layout === "portfolio") return { kind: "caseStudy", page };

  const kind =
    PAGE_KINDS[page.url] ??
    (page.url.startsWith("/services/") ? "service" : "page");
  return { kind, page };
}

/** One real page for each kind, mocked up by every direction */
export const SAMPLE_PAGES: { label: string; path: string }[] = [
  { label: "Home", path: "/" },
  { label: "Portfolio", path: "/portfolio/" },
  { label: "Case study", path: "/portfolio/asana/" },
  { label: "Writing archive", path: "/archive/" },
  { label: "Blog post", path: "/acting-from-fear/" },
  { label: "Tutorial post", path: "/css-multi-line-buttons/" },
  { label: "Type archive", path: "/type/essays/" },
  { label: "About", path: "/about/" },
  { label: "Services", path: "/services/" },
  { label: "Service", path: "/services/web-performance/" },
  { label: "Testimonials", path: "/testimonials/" },
  { label: "Contact", path: "/contact/" },
  { label: "Project inquiry", path: "/project-inquiry/" },
  { label: "Not found", path: "/404/" }
];

/** Primary navigation, in order */
export const NAVIGATION = [
  { text: "Work", path: "/portfolio/" },
  { text: "Writing", path: "/archive/" },
  { text: "About", path: "/about/" },
  { text: "Services", path: "/services/" },
  { text: "Contact", path: "/contact/" }
];

/** The navigation item each kind of page belongs under */
const SECTIONS: Partial<Record<ViewKind, string>> = {
  work: "/portfolio/",
  caseStudy: "/portfolio/",
  writing: "/archive/",
  post: "/archive/",
  about: "/about/",
  services: "/services/",
  service: "/services/",
  contact: "/contact/",
  inquiry: "/contact/"
};

export interface NavItem {
  text: string;
  url: string;
  /** The current page is this item's page or one beneath it */
  current: boolean;
}

export function navigationFor(view: View, path: string): NavItem[] {
  const section = SECTIONS[view.kind];
  return NAVIGATION.map((item) => ({
    text: item.text,
    url: item.path,
    current: section ? item.path === section : path.startsWith(item.path)
  }));
}
