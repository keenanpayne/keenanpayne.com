/**
 * Conformance
 * ==================================================
 * Holds every direction to the same feature set, information architecture,
 * and foundations: renders each of its sample pages, then checks them
 * against `./requirements.ts`, its stylesheet against `./foundations.ts`,
 * and its code against `./source.ts` (`./report.server.ts` runs them).
 * `npm run lab:check` runs it, and the style guide shows the same results
 * at `/lab/styleguide/conformance/`.
 *
 * A failure names the direction, the requirement, and what's missing on
 * which page. What a direction fell short of when the requirements were
 * written is listed in `./gaps.ts`, which only shrinks.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { getPage } from "../../lib/content/content.server";
import type { SectionModel } from "../../lib/types";
import { directions } from "../registry";
import { resolveView } from "../site/ia";

import { FOUNDATIONS } from "./foundations";
import { KNOWN_GAPS } from "./gaps";
import { CHECKED_PATHS } from "./pages";
import { checkDirection } from "./report.server";
import { ALL_KINDS, REQUIREMENTS } from "./requirements";

// Read from disk: Vitest serves CSS imports, even `?raw` ones, empty, and
// a glob is fixed when the test is first compiled, so it would miss a new
// direction
const directionsDir = new URL("../directions/", import.meta.url);

const stylesheetOf = (slug: string) => {
  const file = new URL(`${slug}/${slug}.css`, directionsDir);
  return existsSync(file) ? readFileSync(file, "utf8") : "";
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

describe.each(skins)("$name", ({ slug, skin }) => {
  const results = checkDirection({
    slug,
    skin,
    css: stylesheetOf(slug),
    sources: sourcesOf(slug)
  });

  it.each(results)("$id", ({ id, group, rule, status, problems }) => {
    if (status === "closed") {
      expect.fail(
        `${slug} now meets ${id}: delete it from app/lab/conformance/gaps.ts`
      );
    }
    if (status === "regression") {
      const label = group === "Source" ? "spells out" : "needs";
      expect(problems, `${rule}\n${slug} ${label}`).toEqual([]);
    }
  });
});

describe("checked pages", () => {
  const views = CHECKED_PATHS.map((path) => resolveView(path, getPage(path)));

  it("are all real pages", () => {
    expect(
      CHECKED_PATHS.filter((path, at) => views[at].kind === "notFound")
    ).toEqual(["/404/"]);
  });

  it("include every kind of page", () => {
    const kinds = new Set(views.map((view) => view.kind));
    expect(ALL_KINDS.filter((kind) => !kinds.has(kind))).toEqual([]);
  });

  // The sections the requirements read: each has to be on a checked page,
  // or a direction could drop it unnoticed
  const READ: SectionModel["type"][] = [
    "intro",
    "entries",
    "tagList",
    "typeList",
    "pageList",
    "newsletter",
    "newsletterStandalone",
    "testimonials",
    "testimonials-grid",
    "testimonial",
    "portfolioGrid"
  ];

  it("include every section the requirements read", () => {
    const sections = new Set(
      views.flatMap((view) =>
        "page" in view && "sections" in view.page
          ? view.page.sections.map((section) => section.type)
          : []
      )
    );
    expect(READ.filter((type) => !sections.has(type))).toEqual([]);
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
