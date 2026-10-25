/**
 * Known accessibility gaps, checked
 * ==================================================
 * Every line in `./gaps.ts` names a real direction and a check the audit
 * runs, so a typo can't hide a gap (the audit itself, `npm run a11y`, says
 * when one closes).
 */

import axe from "axe-core";
import { describe, expect, it } from "vitest";

import { directions } from "../registry";

import { AXE_TAGS, CUSTOM_CHECKS, SUPERSEDED } from "./checks";
import { KNOWN_A11Y_GAPS } from "./gaps";

const CHECKS = new Set([
  ...axe
    .getRules(AXE_TAGS)
    .map((rule) => rule.ruleId)
    .filter((id) => !SUPERSEDED.includes(id)),
  ...Object.keys(CUSTOM_CHECKS)
]);

describe("accessibility gaps", () => {
  it.each(Object.entries(KNOWN_A11Y_GAPS))(
    "%s lists checks the audit runs",
    (slug, gaps) => {
      expect(directions.map((direction) => direction.slug)).toContain(slug);
      expect(gaps.filter((id) => !CHECKS.has(id))).toEqual([]);
    }
  );
});
