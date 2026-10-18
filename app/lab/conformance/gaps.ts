/**
 * Known gaps
 * ==================================================
 * Where each direction fell short of the requirements when they were first
 * written down (2026-10-18), by requirement id. This list only ever
 * shrinks: the checks fail when a direction falls short of anything not
 * listed here, and when it meets something that is (so it comes off).
 * Never add to it to make a check pass; meet the requirement instead.
 *
 * To close one, delete its line and run `npm run lab:check`: the failure
 * lists what's missing, page by page.
 */

import type { DirectionSlug } from "../registry";

export const KNOWN_GAPS: Partial<Record<DirectionSlug, readonly string[]>> = {
  monograph: [
    "shell.main",
    "shell.skipLink",
    "page.h1",
    "page.newsletter",
    "home.intro",
    "home.work",
    "writing.posts",
    "service.page",
    "css.reducedMotion"
  ],
  mech: [
    "shell.main",
    "shell.skipLink",
    "shell.landmarks",
    "page.newsletter",
    "home.intro",
    "home.services",
    "work.caseStudies",
    "writing.posts",
    "service.page",
    "form.copy",
    "css.prefix",
    "source.facts:Shell.tsx",
    "source.facts:pages/About.tsx",
    "source.facts:pages/NotFound.tsx",
    "source.facts:specimens.tsx"
  ],
  portal: [
    "shell.main",
    "shell.skipLink",
    "shell.landmarks",
    "shell.links",
    "shell.forms",
    "page.h1",
    "page.newsletter",
    "home.intro",
    "home.work",
    "home.services",
    "home.testimonials",
    "work.caseStudies",
    "page.testimonials",
    "writing.posts",
    "listing.sections",
    "service.page",
    "form.copy",
    "css.prefix",
    "css.reducedMotion",
    "source.facts:Shell.tsx",
    "source.facts:pages/Archive.tsx",
    "source.facts:pages/NotFound.tsx",
    "source.facts:parts.tsx",
    "source.facts:specimens.tsx"
  ],
  stipple: [
    "shell.forms",
    "home.intro",
    "home.work",
    "work.caseStudies",
    "css.prefix",
    "css.reducedMotion",
    "source.facts:specimens.tsx"
  ],
  gridline: [
    "shell.links",
    "home.work",
    "css.reducedMotion",
    "source.facts:parts.tsx",
    "source.facts:specimens.tsx"
  ]
};
