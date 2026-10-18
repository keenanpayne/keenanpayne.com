/**
 * Conformance
 * ==================================================
 * Holds every direction to the same feature set, information architecture,
 * and foundations: renders each of its sample pages, then checks them
 * against `./requirements.ts`, its stylesheet against `./foundations.ts`,
 * and its code against `./source.ts`. `npm run lab:check` runs it.
 *
 * A failure names the direction, the requirement, and what's missing on
 * which page. What a direction fell short of when the requirements were
 * written is listed in `./gaps.ts`, which only shrinks.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { directions, SAMPLE_PAGES } from "../registry";
import { parseTokens } from "../styleguide/tokens.server";

import { flatten, FOUNDATIONS } from "./foundations";
import { KNOWN_GAPS } from "./gaps";
import { renderPage } from "./render";
import { REQUIREMENTS } from "./requirements";
import { factsIn, SOURCE_RULE } from "./source";

// Read from disk: Vitest serves CSS imports, even `?raw` ones, empty, and
// a glob is fixed when the test is first compiled, so it would miss a new
// direction
const directionsDir = new URL("../directions/", import.meta.url);

const stylesheetOf = (slug: string) => {
  const file = new URL(`${slug}/${slug}.css`, directionsDir);
  return existsSync(file) ? readFileSync(file, "utf8") : undefined;
};

/** Source files of a direction, by their path inside its folder */
const sourcesOf = (slug: string) => {
  const folder = new URL(`${slug}/`, directionsDir);
  return readdirSync(folder, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file))
    .sort()
    .map(
      (file) => [file, readFileSync(new URL(file, folder), "utf8")] as const
    );
};

const skins = await Promise.all(
  directions.map(async (info) => ({
    ...info,
    skin: (await info.load()).default
  }))
);

/**
 * Passes when a direction meets a requirement, or falls short of it in a
 * way `./gaps.ts` already lists
 */
function expectMet(
  slug: string,
  id: string,
  rule: string,
  problems: string[],
  label = "needs"
) {
  const known = KNOWN_GAPS[slug as keyof typeof KNOWN_GAPS]?.includes(id);
  if (known) {
    expect(
      problems,
      `${slug} now meets ${id}: delete it from app/lab/conformance/gaps.ts`
    ).not.toEqual([]);
  } else {
    expect(problems, `${rule}\n${slug} ${label}`).toEqual([]);
  }
}

describe.each(skins)("$name", ({ slug, skin }) => {
  const pages = SAMPLE_PAGES.map(({ path }) => renderPage(slug, skin, path));

  describe("pages", () => {
    it.each(REQUIREMENTS)("$id", ({ id, rule, kinds, check }) => {
      const problems = pages
        .filter((page) => !kinds || kinds.includes(page.view.kind))
        .flatMap((page) =>
          check(page).map((problem) => `${page.path}: ${problem}`)
        );
      expectMet(slug, id, rule, problems);
    });
  });

  describe("foundations", () => {
    const css = stylesheetOf(slug) ?? "";
    const sheet = { root: skin.root, css, tokens: parseTokens(css) };
    const flat = flatten(css);

    it.each(FOUNDATIONS)("$id", ({ id, rule, check }) => {
      expect(css, `app/lab/directions/${slug}/${slug}.css`).not.toBe("");
      expectMet(slug, id, rule, check(sheet, flat));
    });
  });

  describe("source", () => {
    it.each(sourcesOf(slug))("source.facts:%s", (file, source) => {
      expectMet(
        slug,
        `source.facts:${file}`,
        SOURCE_RULE,
        factsIn(source),
        "spells out"
      );
    });
  });
});

describe("gaps", () => {
  const ids = new Set([
    ...REQUIREMENTS.map((requirement) => requirement.id),
    ...FOUNDATIONS.map((foundation) => foundation.id)
  ]);

  it.each(Object.entries(KNOWN_GAPS))(
    "%s lists real requirements",
    (slug, gaps) => {
      expect(directions.map((direction) => direction.slug)).toContain(slug);
      const files = new Set(
        sourcesOf(slug).map(([file]) => `source.facts:${file}`)
      );
      expect(gaps.filter((id) => !ids.has(id) && !files.has(id))).toEqual([]);
    }
  );

  it("leaves Wireframe, the baseline, without any", () => {
    expect(KNOWN_GAPS.wireframe ?? []).toEqual([]);
  });
});
