// Content helpers every direction can lean on, so none of them re-derives
// the same facts from the page models in its own way.

import type {
  IntroSection,
  LabContent,
  LinkModel,
  PageListSection,
  PageModel,
  SectionModel
} from "../../lib/types";
import type { ProfileFact, ProfileFactId } from "../../data/profile";

import { HOME } from "./ia";

type Posts = LabContent["posts"];

/** A page's `intro` section: its heading, subheading, and body copy */
export const introOf = (page: { sections: SectionModel[] }) =>
  page.sections.find(
    (section): section is IntroSection => section.type === "intro"
  );

/**
 * The case studies Home shows (`HOME.work`), in that order. Their links may
 * be rebased (`/lab/mech/portfolio/asana/`), so they're matched by path.
 */
export const homeWork = (content: Pick<LabContent, "work">) =>
  HOME.work.flatMap((path) =>
    content.work.filter((item) => item.url.endsWith(path))
  );

/** A page's short name, from its meta title: `Essays | Keenan Payne` → `Essays` */
export const labelOf = (page: { meta: { title: string } }) =>
  page.meta.title.split(" | ")[0];

/**
 * A page's title, for its `<h1>`: a post's or case study's own, or the
 * page's intro heading (HTML), falling back to its label
 */
export function titleOf(page: PageModel) {
  if (page.layout === "post") return page.title ?? page.meta.title;
  if (page.layout === "portfolio") return page.client ?? page.meta.title;
  const intro = introOf(page);
  return intro?.heading ?? intro?.title ?? labelOf(page);
}

/** A page's first section of a type, e.g. `testimonials-grid` */
export const sectionOf = <T extends SectionModel["type"]>(
  page: { sections: SectionModel[] },
  type: T
) =>
  page.sections.find(
    (section): section is Extract<SectionModel, { type: T }> =>
      section.type === type
  );

/** Whether a page asks for the newsletter sign-up, as `/archive/` does */
export const hasNewsletter = (page: { sections: SectionModel[] }) =>
  page.sections.some(
    (section) =>
      section.type === "newsletter" || section.type === "newsletterStandalone"
  );

/**
 * The quotes a page asks for in its `testimonials` section (`/services/`
 * and `/portfolio/` list four), or the lab's shared selection on a page
 * without one
 */
export const quotesOf = (
  page: { sections: SectionModel[] },
  content: LabContent
) => sectionOf(page, "testimonials")?.testimonials ?? content.testimonials;

/** Compares site paths, ignoring a trailing slash */
export const samePath = (a: string, b: string) =>
  a.replace(/\/$/, "") === b.replace(/\/$/, "");

export const pad = (value: number, length = 2) =>
  String(value).padStart(length, "0");

/** Map coordinates, e.g. `39.74°N 104.99°W` */
export const coordinates = ({
  latitude,
  longitude
}: {
  latitude: number;
  longitude: number;
}) =>
  `${Math.abs(latitude).toFixed(2)}°${latitude < 0 ? "S" : "N"} ` +
  `${Math.abs(longitude).toFixed(2)}°${longitude < 0 ? "W" : "E"}`;

/** Minutes to read some HTML, at 230 words a minute */
export function readingMinutes(html: string) {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

/** Joins class names, leaving out the falsy ones; `undefined` for none */
export const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).join(" ") || undefined;

/** Columns a portfolio gallery's `modifier` asks for (`-two-col`, …) */
const GALLERY_COLUMNS: Record<string, number> = {
  "-one-col": 1,
  "-two-col": 2,
  "-three-col": 3
};

export const galleryColumns = (modifier?: string) =>
  GALLERY_COLUMNS[modifier ?? ""] ?? 3;

/** Posts grouped by year, keeping their order */
export function postsByYear(posts: Posts): [year: string, posts: Posts][] {
  const years = new Map<string, Posts>();
  for (const post of posts) {
    years.set(post.year, [...(years.get(post.year) ?? []), post]);
  }
  return [...years];
}

/** Every post type with its archive, in order of first appearance */
export function postTypes(posts: Posts): LinkModel[] {
  const types = new Map<string, LinkModel>();
  for (const post of posts) {
    if (post.type && post.typeUrl && !types.has(post.type)) {
      types.set(post.type, { text: post.type, url: post.typeUrl });
    }
  }
  return [...types.values()];
}

/** A page list (an archive's pages, …) as entries for a direction's list */
export const pageEntries = (section: PageListSection) => ({
  heading: section.title ?? "Pages",
  entries: section.pages.map((page) => ({
    url: page.url,
    heading: page.title ?? page.url
  }))
});

/**
 * The profile facts in a direction's own words: every fact, in order, with
 * any label the direction renames. New facts show up with their default
 * label until a direction renames them.
 */
export const relabel = (
  facts: ProfileFact[],
  labels: Partial<Record<ProfileFactId, string>>
) => facts.map((fact) => ({ ...fact, label: labels[fact.id] ?? fact.label }));
