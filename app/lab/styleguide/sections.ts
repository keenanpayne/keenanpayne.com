/**
 * Style guide sections
 * ==================================================
 * Everything the style guide at `/lab/styleguide/` shows for a direction, in
 * order. Shared sections are drawn the same way for every direction, from
 * its stylesheet and Shell; the rest are specimens each direction renders
 * with its own parts (`specimens.tsx` in its folder). Kept free of React so
 * the prerender config can read it.
 */

export type SectionGroup = "Foundations" | "Components" | "Layout";

export interface StyleSection {
  id: string;
  label: string;
  group: SectionGroup;
  /** What the section shows, in a sentence */
  blurb: string;
  /** Drawn by the style guide itself rather than by each direction */
  shared?: true;
}

export const STYLE_SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    group: "Foundations",
    blurb: "The direction at a glance: its idea, palette, and typefaces.",
    shared: true
  },
  {
    id: "color",
    label: "Color",
    group: "Foundations",
    blurb:
      "Every token in the stylesheet. Swatches show light on the left and dark on the right, over the page color.",
    shared: true
  },
  {
    id: "typefaces",
    label: "Typefaces",
    group: "Foundations",
    blurb: "Each font family and the styles loaded for it.",
    shared: true
  },
  {
    id: "type",
    label: "Type scale",
    group: "Foundations",
    blurb:
      "Display, headings, body, and small copy. Specs are measured from the rendered text."
  },
  {
    id: "motifs",
    label: "Motifs",
    group: "Foundations",
    blurb:
      "Ornament, icons, and the flourishes that make the skin recognizable."
  },
  {
    id: "imagery",
    label: "Imagery",
    group: "Foundations",
    blurb: "How photos, covers, and portraits are treated."
  },
  {
    id: "pageHeader",
    label: "Page header",
    group: "Components",
    blurb: "The eyebrow, title, and lede that open a page."
  },
  {
    id: "actions",
    label: "Buttons & links",
    group: "Components",
    blurb: "Calls to action, buttons, and links, in each of their variants."
  },
  {
    id: "labels",
    label: "Labels & tags",
    group: "Components",
    blurb: "Eyebrows, badges, chips, tags, and metadata."
  },
  {
    id: "surfaces",
    label: "Sections & panels",
    group: "Components",
    blurb: "The containers, rules, and dividers that structure a page."
  },
  {
    id: "cards",
    label: "Cards",
    group: "Components",
    blurb: "Work, writing, and services as cards."
  },
  {
    id: "lists",
    label: "Lists & tables",
    group: "Components",
    blurb: "Post lists, ledgers, facts, and tables."
  },
  {
    id: "quotes",
    label: "Testimonials",
    group: "Components",
    blurb: "Kind words from clients and colleagues."
  },
  {
    id: "forms",
    label: "Forms",
    group: "Components",
    blurb:
      "The questions every direction asks, and the newsletter sign-up. Nothing submits."
  },
  {
    id: "wayfinding",
    label: "Wayfinding",
    group: "Components",
    blurb:
      "Previous and next, back links, contents, switches, and other ways around."
  },
  {
    id: "prose",
    label: "Prose",
    group: "Components",
    blurb:
      "An article body with every element the Markdown can produce: headings, lists, quotes, code, tables, callouts, figures, and footnotes."
  },
  {
    id: "shell",
    label: "Shell",
    group: "Layout",
    blurb:
      "The header, navigation, and footer around every page, here around a placeholder. About is the current page.",
    shared: true
  }
] as const satisfies readonly StyleSection[];

export type StyleSectionId = (typeof STYLE_SECTIONS)[number]["id"];

/** Sections each direction renders itself */
export type SpecimenId = Exclude<
  (typeof STYLE_SECTIONS)[number],
  { shared: true }
>["id"];

export const GROUPS: SectionGroup[] = ["Foundations", "Components", "Layout"];

export const getSection = (id: string | undefined) =>
  STYLE_SECTIONS.find((section) => section.id === id);

export const STYLEGUIDE_PATH = "/lab/styleguide/";

/**
 * Names a direction can't take: `/lab/styleguide/` is the guide's own route,
 * and `/lab/styleguide/compare/…` holds its comparisons (`npm run lab:new`
 * rejects both)
 */
export const RESERVED_SLUGS = ["styleguide", "compare"];

/** What a style guide page shows: one direction, or one section across all */
export type StyleGuideMode =
  | {
      kind: "direction";
      slug: string;
      /** Shows only this section */
      only?: StyleSectionId;
    }
  | { kind: "compare"; section: StyleSectionId };

/**
 * Reads the path after `/lab/styleguide/`: nothing (every direction's
 * overview), `<slug>/` (one direction), `<slug>/<section>/` (one section of
 * it), or `compare/<section>/`
 */
export function resolveMode(
  splat: string,
  slugs: readonly string[]
): StyleGuideMode | undefined {
  const parts = splat.split("/").filter(Boolean);
  if (parts.length === 0) return { kind: "compare", section: "overview" };
  if (parts.length === 1 && slugs.includes(parts[0])) {
    return { kind: "direction", slug: parts[0] };
  }
  if (parts.length === 2 && slugs.includes(parts[0]) && getSection(parts[1])) {
    return {
      kind: "direction",
      slug: parts[0],
      only: getSection(parts[1])!.id
    };
  }
  const section = parts[0] === "compare" ? getSection(parts[1]) : undefined;
  return parts.length === 2 && section && section.id !== "overview"
    ? { kind: "compare", section: section.id }
    : undefined;
}

/** A direction's whole style guide, scrolled to a section */
export const styleguidePath = (slug: string, section?: string) =>
  `${STYLEGUIDE_PATH}${slug}/${section ? `#${section}` : ""}`;

/** One section of one direction, on its own */
export const sectionPath = (slug: string, section: string) =>
  `${STYLEGUIDE_PATH}${slug}/${section}/`;

/** One section across every direction */
export const comparePath = (section: string) =>
  section === "overview"
    ? STYLEGUIDE_PATH
    : `${STYLEGUIDE_PATH}compare/${section}/`;
