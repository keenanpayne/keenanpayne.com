/**
 * Known accessibility gaps
 * ==================================================
 * Where each direction fell short of WCAG 2.2 AAA when the audit
 * (`./audit.spec.ts`) was first run (2026-10-24), by check: an axe rule
 * id, or one of `CUSTOM_CHECKS` in `./checks.ts`. Like
 * `../conformance/gaps.ts`, it only ever shrinks: the audit fails when a
 * direction falls short of anything not listed here, and when it meets
 * something that is (so it comes off). Never add to it to make the audit
 * pass; fix the page instead.
 *
 * To close one, delete its line and run `npm run a11y -- -g <Name>`: the
 * failure lists every element that falls short, page by page.
 */

import type { DirectionSlug } from "../registry";

export const KNOWN_A11Y_GAPS: Partial<
  Record<DirectionSlug, readonly string[]>
> = {
  wireframe: [
    "color-contrast-enhanced",
    "label-content-name-mismatch",
    "line-length",
    "link-name",
    "reflow",
    "scrollable-region-focusable",
    "target-size-enhanced"
  ],
  monograph: [
    "color-contrast-enhanced",
    "focus-appearance",
    "label-content-name-mismatch",
    "line-length",
    "line-spacing",
    "link-name",
    "scrollable-region-focusable",
    "target-size",
    "target-size-enhanced"
  ],
  mech: [
    "color-contrast-enhanced",
    "focus-appearance",
    "focus-not-obscured-enhanced",
    "label-content-name-mismatch",
    "line-length",
    "line-spacing",
    "link-name",
    "nested-interactive",
    "scrollable-region-focusable",
    "target-size-enhanced"
  ],
  portal: [
    "color-contrast-enhanced",
    "focus-appearance",
    "label-content-name-mismatch",
    "line-length",
    "line-spacing",
    "link-name",
    "scrollable-region-focusable",
    "target-size",
    "target-size-enhanced"
  ],
  stipple: [
    "color-contrast-enhanced",
    "focus-appearance",
    "focus-not-obscured-enhanced",
    "label-content-name-mismatch",
    "line-length",
    "line-spacing",
    "link-name",
    "scrollable-region-focusable",
    "target-size-enhanced"
  ],
  gridline: [
    "focus-appearance",
    "label-content-name-mismatch",
    "line-length",
    "reflow",
    "scrollable-region-focusable",
    "target-size-enhanced"
  ],
  neon: [
    "color-contrast-enhanced",
    "label-content-name-mismatch",
    "line-length",
    "line-spacing",
    "link-name",
    "scrollable-region-focusable",
    "target-size-enhanced"
  ]
};
