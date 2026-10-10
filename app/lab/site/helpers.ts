// Content helpers every direction can lean on, so none of them re-derives
// the same facts from the page models in its own way.

import type { IntroSection, LabContent, SectionModel } from "../../lib/types";
import type { ProfileFact, ProfileFactId } from "../../data/profile";

type Posts = LabContent["posts"];

/** A page's `intro` section: its heading, subheading, and body copy */
export const introOf = (page: { sections: SectionModel[] }) =>
  page.sections.find(
    (section): section is IntroSection => section.type === "intro"
  );

/** A page's first section of a type, e.g. `testimonials-grid` */
export const sectionOf = <T extends SectionModel["type"]>(
  page: { sections: SectionModel[] },
  type: T
) =>
  page.sections.find(
    (section): section is Extract<SectionModel, { type: T }> =>
      section.type === type
  );

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
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).length;
  return Math.max(1, Math.round(words / 230));
}

/** Posts grouped by year, keeping their order */
export function postsByYear(posts: Posts): [year: string, posts: Posts][] {
  const years = new Map<string, Posts>();
  for (const post of posts) {
    years.set(post.year, [...(years.get(post.year) ?? []), post]);
  }
  return [...years];
}

/** Every post type, in order of first appearance */
export const postTypes = (posts: Posts) => [
  ...new Set(posts.flatMap((post) => (post.type ? [post.type] : [])))
];

/**
 * The profile facts in a direction's own words: every fact, in order, with
 * any label the direction renames. New facts show up with their default
 * label until a direction renames them.
 */
export const relabel = (
  facts: ProfileFact[],
  labels: Partial<Record<ProfileFactId, string>>
) => facts.map((fact) => ({ ...fact, label: labels[fact.id] ?? fact.label }));
