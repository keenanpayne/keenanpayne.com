/**
 * Accessibility audit
 * ==================================================
 * Holds every direction to WCAG 2.2 AAA in a real browser: each of its
 * checked pages (`../conformance/pages.ts`), light and dark, on a desktop
 * and on a 320px-wide phone, through axe (every WCAG 2.0–2.2 rule at A, AA,
 * and AAA) and the checks in `./checks.ts` for what axe doesn't measure
 * (target size, visual presentation, reflow, and focus, tabbing through
 * every page). Each is audited at `/lab/<slug>/`, without the lab bar: the
 * live direction renders the same pages there, without the third-party
 * comment threads the live site loads (Disqus), which are Disqus's to
 * keep.
 *
 * A failure names every element that falls short, what it measured, and
 * where. What a direction fell short of when the audit was first run is
 * listed in `./gaps.ts`, which only shrinks.
 *
 *   npm run a11y                 # every direction
 *   npm run a11y -- -g Gridline  # one
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

import AxeBuilder from "@axe-core/playwright";
import { test, type Browser } from "@playwright/test";

import { CHECKED_PATHS } from "../conformance/pages";
import { directions, labPath } from "../registry";

import {
  AXE_TAGS,
  checkFocus,
  checkPage,
  CUSTOM_CHECKS,
  SUPERSEDED,
  type CustomCheckId
} from "./checks";
import { KNOWN_A11Y_GAPS } from "./gaps";

/** The lab's own chrome, which isn't the direction's */
const EXCLUDE = ".labBar";

const SCHEMES = ["light", "dark"] as const;

const WIDTHS = [
  { name: "desktop", viewport: { width: 1280, height: 800 } },
  // WCAG's reflow width: 1280px at 400% zoom
  { name: "phone", viewport: { width: 320, height: 640 } }
] as const;

/**
 * Whether axe found it inside a frame: an embed from another site (a
 * CodePen), which is theirs to keep. The frame itself, and its title, are
 * still checked.
 */
const embedded = (target: readonly unknown[]) => target.length > 1;

/** Tab presses before giving up on reaching the end of a page */
const MAX_TABS = 250;

/** Elements listed per check before the rest are summed up */
const MAX_LISTED = 40;

/** The live direction's slug, read from `live.ts` without loading the skin */
const LIVE = /directions\/([\w-]+)/.exec(
  readFileSync(new URL("../live.ts", import.meta.url), "utf8")
)?.[1];

/** Where the audit writes every direction's findings */
const FINDINGS_DIR = new URL(
  "../../../test-results/a11y-findings/",
  import.meta.url
);

/** Where each element fell short, by check, by `target: message` */
type Findings = Map<string, Map<string, Set<string>>>;

interface Audit {
  findings: Findings;
  /** Elements axe couldn't decide on (contrast over an image, say), by rule */
  review: Map<string, Set<string>>;
  /** What each axe rule asks, for the report */
  help: Map<string, string>;
}

const record = (
  findings: Findings,
  id: string,
  finding: string,
  where: string
) => {
  const byFinding = findings.get(id) ?? new Map<string, Set<string>>();
  const places = byFinding.get(finding) ?? new Set<string>();
  places.add(where);
  byFinding.set(finding, places);
  findings.set(id, byFinding);
};

async function auditDirection(browser: Browser, slug: string) {
  const audit: Audit = {
    findings: new Map(),
    review: new Map(),
    help: new Map()
  };
  const urlOf = (path: string) => labPath(slug, path);

  for (const width of WIDTHS) {
    for (const scheme of SCHEMES) {
      const context = await browser.newContext({
        viewport: width.viewport,
        colorScheme: scheme,
        // Animations hold still, so contrast is measured on what settles
        reducedMotion: "reduce"
      });
      const page = await context.newPage();

      for (const path of CHECKED_PATHS) {
        const where = `${scheme} ${width.name} ${path}`;
        await page.goto(urlOf(path), { waitUntil: "networkidle" });
        // Every image in, so nothing shifts as focus scrolls down the page
        await page.evaluate(async () => {
          await document.fonts.ready;
          const images = [...document.images];
          for (const image of images) image.loading = "eager";
          await Promise.all(
            images.map((image) => image.decode().catch(() => {}))
          );
        });
        await page.waitForLoadState("networkidle");

        const axe = await new AxeBuilder({ page })
          .withTags(AXE_TAGS)
          .disableRules(SUPERSEDED)
          .exclude(EXCLUDE)
          .analyze();
        for (const violation of axe.violations) {
          audit.help.set(
            violation.id,
            `${violation.help} (${violation.helpUrl.replace(/\?.*$/, "")})`
          );
          for (const node of violation.nodes) {
            if (embedded(node.target)) continue;
            const check = [...node.any, ...node.all, ...node.none][0];
            const message = (check?.message ?? node.failureSummary ?? "")
              .replace(/\s+/g, " ")
              .trim();
            record(
              audit.findings,
              violation.id,
              `${node.target.join(" ")}: ${message}`,
              where
            );
          }
        }
        for (const incomplete of axe.incomplete) {
          const places = audit.review.get(incomplete.id) ?? new Set<string>();
          for (const node of incomplete.nodes) {
            if (embedded(node.target)) continue;
            places.add(`${node.target.join(" ")} (${where})`);
          }
          audit.review.set(incomplete.id, places);
        }

        const outcomes = await page.evaluate(checkPage, {
          exclude: EXCLUDE,
          reflow: width.name === "phone"
        });
        for (const { id, findings } of outcomes) {
          for (const { target, message } of findings) {
            record(audit.findings, id, `${target}: ${message}`, where);
          }
        }

        // Focus: Tab through the page, checking each stop
        await page.evaluate(() => {
          (document.activeElement as HTMLElement | null)?.blur();
          window.scrollTo(0, 0);
        });
        for (let presses = 0; presses < MAX_TABS; presses++) {
          await page.keyboard.press("Tab");
          const stop = await page.evaluate(checkFocus, { exclude: EXCLUDE });
          if (!stop || stop.repeat) break;
          for (const { id, message } of stop.problems) {
            record(audit.findings, id, `${stop.target}: ${message}`, where);
          }
        }
      }
      await context.close();
    }
  }
  return audit;
}

/** Where a finding was seen, compactly: every page, or which */
function placesOf(places: Set<string>) {
  const list = [...places];
  return list.length > 3
    ? `${list.slice(0, 3).join(", ")}, and ${list.length - 3} more`
    : list.join(", ");
}

const describeCheck = (id: string, audit: Audit) =>
  id in CUSTOM_CHECKS
    ? `${CUSTOM_CHECKS[id as CustomCheckId].help} (WCAG ${CUSTOM_CHECKS[id as CustomCheckId].criterion})`
    : (audit.help.get(id) ?? "");

function reportOf(ids: string[], audit: Audit) {
  return ids
    .map((id) => {
      const findings = [...(audit.findings.get(id) ?? new Map())];
      const listed = findings
        .slice(0, MAX_LISTED)
        .map(
          ([finding, places]) => `    ${finding}\n      on ${placesOf(places)}`
        );
      if (findings.length > MAX_LISTED) {
        listed.push(`    …and ${findings.length - MAX_LISTED} more elements`);
      }
      return `  ${id}: ${describeCheck(id, audit)}\n${listed.join("\n")}`;
    })
    .join("\n\n");
}

for (const { slug, name } of directions) {
  test(`${name}${slug === LIVE ? " (live)" : ""}`, async ({
    browser
  }, testInfo) => {
    const audit = await auditDirection(browser, slug);
    const known = KNOWN_A11Y_GAPS[slug] ?? [];
    const failing = [...audit.findings.keys()].sort();

    const regressions = failing.filter((id) => !known.includes(id));
    const closed = known.filter((id) => !audit.findings.has(id));
    const gaps = failing.filter((id) => known.includes(id));

    // Everything, gaps included, for reading back: `<slug>.json`
    mkdirSync(FINDINGS_DIR, { recursive: true });
    writeFileSync(
      new URL(`${slug}.json`, FINDINGS_DIR),
      JSON.stringify(
        {
          regressions,
          gaps,
          closed,
          /** By check, then `target: what's wrong`, then where */
          findings: Object.fromEntries(
            [...audit.findings].map(([id, findings]) => [
              id,
              Object.fromEntries(
                [...findings].map(([finding, places]) => [finding, [...places]])
              )
            ])
          ),
          /** What axe couldn't decide on, to check by hand */
          review: Object.fromEntries(
            [...audit.review]
              .filter(([, places]) => places.size)
              .map(([id, places]) => [id, [...places]])
          )
        },
        null,
        2
      )
    );

    if (gaps.length) {
      testInfo.annotations.push({
        type: "known gaps",
        description: `${gaps.join(", ")} (app/lab/accessibility/gaps.ts)`
      });
    }
    const review = [...audit.review].filter(([, places]) => places.size);
    if (review.length) {
      testInfo.annotations.push({
        type: "check by hand",
        description: review
          .map(
            ([id, places]) =>
              `${id}: ${places.size} elements axe couldn't decide on`
          )
          .join("; ")
      });
    }

    const problems: string[] = [];
    if (regressions.length) {
      problems.push(
        `${name} falls short of WCAG 2.2 AAA:\n\n${reportOf(regressions, audit)}\n\nEvery finding, known gaps included: test-results/a11y-findings/${slug}.json`
      );
    }
    if (closed.length) {
      problems.push(
        `${name} now meets ${closed.join(", ")}: delete ${closed.length > 1 ? "them" : "it"} from app/lab/accessibility/gaps.ts`
      );
    }
    if (problems.length) throw new Error(problems.join("\n\n"));
  });
}
