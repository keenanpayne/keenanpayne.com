/**
 * Design lab
 * ==================================================
 * Metadata for each aesthetic direction explored at `/lab/<slug>/`. Kept free
 * of component imports so the prerender config can read it.
 */

export interface DirectionInfo {
  slug: string;
  name: string;
  summary: string;
  /** What inspired the direction */
  reference: string;
  /** When the direction was started (yyyy-mm-dd) */
  date: string;
  /** Site pages mocked up in this direction, by their real path */
  pages: { label: string; path: string }[];
}

export const directions: DirectionInfo[] = [
  {
    slug: "monograph",
    name: "Monograph",
    summary:
      "Grayscale broadsheet. Light serif display type over tiny monospace copy, hairline and double rules, column dividers, and a dithered footer.",
    reference: "Helena Zhang’s portfolio",
    date: "2026-10-07",
    pages: [
      { label: "Home", path: "/" },
      { label: "Portfolio", path: "/portfolio/" },
      { label: "Case study", path: "/portfolio/asana/" },
      { label: "Writing archive", path: "/archive/" },
      { label: "Blog post", path: "/acting-from-fear/" },
      { label: "Tutorial post", path: "/css-multi-line-buttons/" },
      { label: "About", path: "/about/" },
      { label: "Services", path: "/services/" },
      { label: "Service", path: "/services/web-performance/" },
      { label: "Testimonials", path: "/testimonials/" },
      { label: "Contact", path: "/contact/" },
      { label: "Project inquiry", path: "/project-inquiry/" },
      { label: "Not found", path: "/404/" }
    ]
  },
  {
    slug: "mech",
    name: "Mech",
    summary:
      "Mecha command HUD. Amber panels with corner brackets on a black lattice, compressed serif title cards, hexagon clusters, live readouts, and red alert banners with hazard stripes.",
    reference: "Neon Genesis Evangelion’s NERV and MAGI interfaces",
    date: "2026-10-08",
    pages: [
      { label: "Home", path: "/" },
      { label: "Portfolio", path: "/portfolio/" },
      { label: "Case study", path: "/portfolio/asana/" },
      { label: "Writing archive", path: "/archive/" },
      { label: "Blog post", path: "/acting-from-fear/" },
      { label: "Tutorial post", path: "/css-multi-line-buttons/" },
      { label: "About", path: "/about/" },
      { label: "Services", path: "/services/" },
      { label: "Service", path: "/services/web-performance/" },
      { label: "Testimonials", path: "/testimonials/" },
      { label: "Contact", path: "/contact/" },
      { label: "Project inquiry", path: "/project-inquiry/" },
      { label: "Not found", path: "/404/" }
    ]
  }
];

export const getDirection = (slug: string | undefined) =>
  directions.find((direction) => direction.slug === slug);

/** Lab URL of a direction's mockup of a site path */
export const labPath = (slug: string, path = "/") => `/lab/${slug}${path}`;
