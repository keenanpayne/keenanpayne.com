/**
 * Conformance report
 * ==================================================
 * Runs every check against a direction and says where each one stands,
 * measured against the known gaps. The tests (`./conformance.test.ts`) and
 * the style guide's Conformance page (`/lab/styleguide/conformance/`) both
 * read it, so they never disagree.
 */

import { directions } from "../registry";
import type { Direction } from "../site/direction";
import { parseTokens, readStylesheet } from "../styleguide/tokens.server";

import { flatten, FOUNDATIONS } from "./foundations";
import { KNOWN_GAPS } from "./gaps";
import { CHECKED_PATHS } from "./pages";
import { renderPage } from "./render";
import { REQUIREMENTS } from "./requirements";
import { factsIn, SOURCE_RULE } from "./source";

/**
 * - `met`: it passes
 * - `gap`: it fails, as `gaps.ts` already lists
 * - `regression`: it fails, and nothing lists it, so the tests fail
 * - `closed`: it passes but `gaps.ts` still lists it, so the tests fail
 *   until the line comes off
 */
export type CheckStatus = "met" | "gap" | "regression" | "closed";

export type CheckGroup =
  "Shell" | "Every page" | "Pages" | "Foundations" | "Source";

export interface CheckResult {
  /** e.g. `shell.skipLink`, or `source.facts:Shell.tsx` for one file */
  id: string;
  group: CheckGroup;
  rule: string;
  status: CheckStatus;
  /** What's missing or wrong, e.g. `/about/: the portrait` */
  problems: string[];
}

export interface DirectionReport {
  slug: string;
  results: CheckResult[];
}

export interface ConformanceReport {
  /** When the checks ran, as an ISO date */
  checkedAt: string;
  directions: DirectionReport[];
}

const statusOf = (slug: string, id: string, problems: string[]) => {
  const known = KNOWN_GAPS[slug as keyof typeof KNOWN_GAPS]?.includes(id);
  if (problems.length) return known ? "gap" : "regression";
  return known ? "closed" : "met";
};

/** Every check, run against one direction */
export function checkDirection({
  slug,
  skin,
  css,
  sources
}: {
  slug: string;
  skin: Direction;
  /** Its `<slug>.css`, from the package */
  css: string;
  /** Its code, by path inside its folder, e.g. `pages/Home.tsx` */
  sources: (readonly [file: string, source: string])[];
}): CheckResult[] {
  const result = (
    id: string,
    group: CheckGroup,
    rule: string,
    problems: string[]
  ): CheckResult => ({
    id,
    group,
    rule,
    status: statusOf(slug, id, problems),
    problems
  });

  const pages = CHECKED_PATHS.map((path) => renderPage(slug, skin, path));
  const sheet = { root: skin.root, css, tokens: parseTokens(css) };
  const flat = flatten(css);

  return [
    ...REQUIREMENTS.map(({ id, group, rule, kinds, check }) =>
      result(
        id,
        group,
        rule,
        pages
          .filter((page) => !kinds || kinds.includes(page.view.kind))
          .flatMap((page) =>
            check(page, flat).map((problem) => `${page.path}: ${problem}`)
          )
      )
    ),
    ...FOUNDATIONS.map(({ id, rule, check }) =>
      result(
        id,
        "Foundations",
        rule,
        css
          ? check(sheet, flat)
          : [`${slug}.css in @keenanpayne/forma-ui (src/directions/${slug}/)`]
      )
    ),
    ...sources.map(([file, source]) =>
      result(`source.facts:${file}`, "Source", SOURCE_RULE, factsIn(source))
    )
  ];
}

// The app reads the directions' code through Vite, which keeps it current
// in development and bundles each file as a chunk of its own, loaded only
// by the Conformance page
const code = import.meta.glob<string>("../directions/*/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default"
});

/** Every direction, checked now */
export async function getConformanceReport(): Promise<ConformanceReport> {
  const reports = await Promise.all(
    directions.map(async ({ slug, load }) => {
      const prefix = `../directions/${slug}/`;
      const sources = await Promise.all(
        Object.entries(code)
          .filter(([path]) => path.startsWith(prefix) && !/\.test\./.test(path))
          .sort(([a], [b]) => a.localeCompare(b))
          .map(
            async ([path, read]) =>
              [path.slice(prefix.length), await read()] as const
          )
      );
      return {
        slug,
        results: checkDirection({
          slug,
          skin: (await load()).default,
          css: await readStylesheet(slug),
          sources
        })
      };
    })
  );
  return { checkedAt: new Date().toISOString(), directions: reports };
}
