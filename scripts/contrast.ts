/**
 * Contrast
 * ==================================================
 * Measures colors against WCAG 2.2 AAA before they go in a stylesheet:
 *
 *   npm run a11y:contrast -- "#6b6b6b" "#fff"   # any two CSS colors
 *   npm run a11y:contrast -- gridline           # a direction's role pairs
 *   npm run a11y:contrast -- gridline --all     # and every color token on
 *                                               # its paper and surface
 *   npm run a11y:contrast                       # every direction
 *
 * The stylesheets are read from the installed `@keenanpayne/forma-ui`.
 * The role pairs are the ones the `css.contrast` foundation checks
 * (`CONTRAST_PAIRS` in `app/lab/accessibility/contrast.ts`), in both
 * schemes. What a color is painted on in practice, the browser audit
 * (`npm run a11y`) measures.
 */

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  FORMA_DIR,
  formaStylesheetPath,
  readFormaStylesheet
} from "../app/lab/forma.server.ts";
import {
  contrast,
  CONTRAST_PAIRS,
  formatRatio,
  MINIMUM,
  parseColor
} from "../app/lab/accessibility/contrast.ts";
import {
  parseTokens,
  type DirectionTokens
} from "../app/lab/styleguide/tokens.ts";

// The stylesheets live in @keenanpayne/forma-ui; this reads the installed
// package's source ones (`npm run contrast` there does the same)
const DIRECTIONS = join(FORMA_DIR, "src", "directions");

const args = process.argv.slice(2);
const all = args.includes("--all");
const [first, second] = args.filter((arg) => !arg.startsWith("--"));

const pass = (ratio: number, minimum: number) =>
  ratio >= minimum ? "pass" : "FAIL";

/** Two colors: the ratio, and what it's enough for */
function pair(foreground: string, background: string) {
  const ratio = contrast(foreground, background);
  if (ratio === undefined) {
    console.error(
      `Can't read ${parseColor(foreground) ? background : foreground} as a color`
    );
    process.exit(1);
  }
  console.log(`${foreground} on ${background}: ${formatRatio(ratio)}\n`);
  console.log(`  ${pass(ratio, MINIMUM.text)}  body text, AAA (7:1, 1.4.6)`);
  console.log(
    `  ${pass(ratio, MINIMUM.largeText)}  large text (24px, or 18.66px bold), AAA (4.5:1, 1.4.6)`
  );
  console.log(
    `  ${pass(ratio, MINIMUM.nonText)}  borders, icons, and focus rings (3:1, 1.4.11, 2.4.13)`
  );
}

/** A direction's tokens, in its default scheme or its other one */
const schemesOf = (tokens: DirectionTokens) => {
  const other = tokens.scheme === "light" ? "dark" : "light";
  return [
    { name: tokens.scheme, valueOf: (token: { value: string }) => token.value },
    {
      name: other,
      valueOf: (token: { value: string; alt?: string }) =>
        token.alt ?? token.value
    }
  ];
};

function direction(slug: string) {
  if (!existsSync(formaStylesheetPath(slug))) {
    console.error(
      `No direction "${slug}" in @keenanpayne/forma-ui (src/directions/${slug}/${slug}.css)`
    );
    process.exit(1);
  }
  const tokens = parseTokens(readFormaStylesheet(slug));
  const root = tokens.paper?.name.replace(/^--|-paper$/g, "");
  if (!root) {
    console.error(`${slug}.css doesn't paint the page in --<root>-paper`);
    process.exit(1);
  }
  const find = (role: string) =>
    tokens.tokens.find((token) => token.name === `--${root}-${role}`);

  const rows: string[][] = [];
  let failures = 0;
  const measure = (
    fg: string,
    bg: string,
    minimum: number,
    read: (
      role: string,
      scheme: ReturnType<typeof schemesOf>[number]
    ) => string | undefined
  ) => {
    const cells = schemesOf(tokens).map((scheme) => {
      const [foreground, background, paper] = [fg, bg, "paper"].map((role) =>
        read(role, scheme)
      );
      if (!foreground || !background) return "–";
      const ratio = contrast(foreground, background, paper);
      if (ratio === undefined) return "system";
      if (ratio < minimum) failures++;
      return `${formatRatio(ratio)} ${pass(ratio, minimum)}`;
    });
    rows.push([fg, bg, `${minimum}:1`, ...cells]);
  };

  const roleValue = (
    role: string,
    scheme: ReturnType<typeof schemesOf>[number]
  ) => {
    const token = find(role);
    return token && scheme.valueOf(token);
  };
  for (const [fg, bg, minimum] of CONTRAST_PAIRS) {
    measure(`-${fg}`, `-${bg}`, minimum, (role, scheme) =>
      roleValue(role.replace(/^-/, ""), scheme)
    );
  }

  if (all) {
    // Every other color, as text, on the paper and the surface
    const roles = new Set(
      CONTRAST_PAIRS.flatMap(([fg, bg]) => [fg, bg]).map(
        (role) => `--${root}-${role}`
      )
    );
    for (const token of tokens.tokens) {
      if (token.kind !== "color" || roles.has(token.name)) continue;
      const name = token.name.replace(`--${root}`, "");
      for (const bg of ["paper", "surface"]) {
        measure(name, `-${bg}`, MINIMUM.text, (role, scheme) =>
          role === name
            ? scheme.valueOf(token)
            : roleValue(role.replace(/^-/, ""), scheme)
        );
      }
    }
  }

  const schemes = schemesOf(tokens).map((scheme) => scheme.name);
  const header = ["on", "", "needs", ...schemes];
  const table = [header, ...rows].map(([fg, bg, ...rest]) => [
    bg ? `${fg} on ${bg}` : fg,
    ...rest
  ]);
  const widths = table[0].map((_, at) =>
    Math.max(...table.map((row) => row[at].length))
  );
  console.log(`\n${slug} (--${root}-…)\n`);
  for (const row of table) {
    console.log(
      `  ${row.map((cell, at) => cell.padEnd(widths[at])).join("   ")}`
    );
  }
  if (failures) {
    console.log(
      `\n  ${failures} below AAA${all ? " (other tokens are measured as text: a token that's only ever a border or fill needs just 3:1)" : ""}`
    );
  }
}

if (first && second) {
  pair(first, second);
} else if (first) {
  direction(first);
} else {
  for (const slug of readdirSync(DIRECTIONS).sort()) {
    if (existsSync(formaStylesheetPath(slug))) direction(slug);
  }
}
