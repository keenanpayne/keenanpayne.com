/**
 * Design lab
 * ==================================================
 * Each aesthetic direction explored at `/lab/<slug>/`: its metadata, and
 * the chunk its skin loads from. Each one mocks up every page in
 * `SAMPLE_PAGES`; the live one (`./live.ts`) renders the site itself too.
 * Skins are imported on demand only, so the prerender config can read this
 * without pulling in components.
 */

import type { Direction } from "./site/direction";

export { SAMPLE_PAGES } from "./site/ia";

export interface DirectionInfo {
  slug: string;
  name: string;
  summary: string;
  /** What inspired the direction */
  reference: string;
  /** When the direction was started (yyyy-mm-dd) */
  date: string;
  /** Its skin, `./directions/<slug>/`, as a chunk of its own */
  load: () => Promise<{ default: Direction }>;
}

export const directions = [
  {
    slug: "wireframe",
    name: "Wireframe",
    summary:
      "The shared content and information architecture with no skin: plain semantic HTML in system type. The baseline every direction reskins, and the starting point for new ones.",
    reference: "The site’s own content model",
    date: "2026-10-09",
    load: () => import("./directions/wireframe")
  },
  {
    slug: "monograph",
    name: "Monograph",
    summary:
      "Grayscale broadsheet. Light serif display type over tiny monospace copy, hairline and double rules, column dividers, and a dithered footer.",
    reference: "Helena Zhang’s portfolio",
    date: "2026-10-07",
    load: () => import("./directions/monograph")
  },
  {
    slug: "mech",
    name: "Mech",
    summary:
      "Mecha command HUD. Amber panels with corner brackets on a black lattice, compressed serif title cards, hexagon clusters, live readouts, and red alert banners with hazard stripes.",
    reference: "Neon Genesis Evangelion’s NERV and MAGI interfaces",
    date: "2026-10-08",
    load: () => import("./directions/mech")
  },
  {
    slug: "portal",
    name: "Portal",
    summary:
      "Early-2000s console-maker web portal. A chunky periwinkle bezel around halftone nav bars, vertical tab rails, pixel-font buttons, rating-badge game cards, skyscraper banner ads, and a pixel mascot with a speech bubble.",
    reference: "Nintendo.com, circa 2002–2003",
    date: "2026-10-08",
    load: () => import("./directions/portal")
  },
  {
    slug: "stipple",
    name: "Stipple",
    summary:
      "Olive ink on white, inside a hairline frame that steps around its navigation and footer. Condensed serif display over a quiet grotesk and light monospace, with every image, and a generated terrain, rendered in stippled dither.",
    reference: "Urbit.org’s dithered, olive-and-sage site design",
    date: "2026-10-09",
    load: () => import("./directions/stipple")
  },
  {
    slug: "gridline",
    name: "Gridline",
    summary:
      "The current site, rebuilt on its grid. Every section and cell is outlined in hairlines between two full-height rails, with type doing the work: Instrument Sans headings, Instrument Serif ledes and quotes, IBM Plex Mono labels. Light and dark mirror each other in inverted bands, and violet light rays and a grid horizon light the panels.",
    reference: "VoidZero’s Vite+ and Void sites",
    date: "2026-10-17",
    load: () => import("./directions/gridline")
  }
  // `npm run lab:new` adds new directions above this line
] as const satisfies readonly DirectionInfo[];

export type DirectionSlug = (typeof directions)[number]["slug"];

export const getDirection = (slug: string | undefined) =>
  directions.find((direction) => direction.slug === slug);

/** Where a direction's mockups live, e.g. `/lab/mech`: a prefix for site paths */
export const labBase = (slug: string) => `/lab/${slug}`;

/** Lab URL of a direction's mockup of a site path */
export const labPath = (slug: string, path = "/") => `${labBase(slug)}${path}`;
