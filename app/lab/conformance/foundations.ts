/**
 * Foundations
 * ==================================================
 * The design foundations every direction's stylesheet defines, whatever
 * their values: the same roles for color and type, both color schemes, a
 * focus ring, a selection color, reduced motion, and its own prefix on
 * everything, so the lab can load every skin at once. A direction keeps any
 * other tokens it likes (its motifs); these are the ones each one has.
 */

import postcss, { type AtRule, type Root, type Rule } from "postcss";
import nested from "postcss-nested";

import type { DirectionTokens } from "../styleguide/tokens.server";

/**
 * Roles every direction names as `--<root>-<role>` on `:root`. An alias of
 * a token it already has is fine (`--mc-paper: var(--mc-void)`).
 */
export const ROLES = {
  paper: "The page’s background",
  ink: "Body text",
  muted: "Secondary text: dates, captions, metadata",
  line: "Rules and borders",
  surface: "Panels, cards, and other raised fills",
  accent: "The skin’s highlight (its ink, in a skin without one)",
  focus: "The focus ring",
  selection: "Selected text’s background",
  "selection-ink": "Selected text",
  "font-display": "Display type: titles and headings",
  "font-body": "Body type",
  "font-mono": "Monospace: code, and labels in skins that use it"
} as const;

/** Roles that must change between the light and dark schemes */
const FLIPS = ["paper", "ink"] as const;

export interface Stylesheet {
  /** The direction's `root` class, and the prefix of everything in it */
  root: string;
  css: string;
  /** As the style guide reads them (`../styleguide/tokens.server.ts`) */
  tokens: DirectionTokens;
}

export interface Foundation {
  id: string;
  rule: string;
  check: (sheet: Stylesheet, flat: Root) => string[];
}

/** The stylesheet with nesting resolved, so every selector reads in full */
export const flatten = (css: string) =>
  postcss([nested()]).process(css, { from: undefined }).root;

const rulesIn = (root: Root | AtRule) => {
  const rules: Rule[] = [];
  root.walkRules((rule) => {
    rules.push(rule);
  });
  return rules;
};

const insideKeyframes = (rule: Rule) =>
  rule.parent?.type === "atrule" && /keyframes$/i.test(rule.parent.name);

const declarationsOf = (rule: Rule) =>
  new Map(
    rule.nodes.flatMap((node) =>
      node.type === "decl"
        ? [[node.prop, node.value.replace(/\s+/g, " ")] as const]
        : []
    )
  );

export const FOUNDATIONS: Foundation[] = [
  {
    id: "css.roles",
    rule: `\`:root\` names every role: ${Object.keys(ROLES)
      .map((role) => `\`--<root>-${role}\``)
      .join(", ")}.`,
    check: ({ root, tokens }) =>
      Object.keys(ROLES)
        .map((role) => `--${root}-${role}`)
        .filter((name) => !tokens.tokens.some((token) => token.name === name))
        .map((name) => `${name} on :root`)
  },
  {
    id: "css.schemes",
    rule: 'Tokens are set on `:root`, then the other scheme overrides them twice, identically: under `@media (prefers-color-scheme: …)` with `:root:not([data-theme="…"])`, and under `:root[data-theme="…"]` (the lab bar’s switch). The page and its text change between them.',
    check: ({ root, tokens }, flat) => {
      const problems: string[] = [];
      const problem = (message: string) => problems.push(message);
      const other = tokens.scheme === "light" ? "dark" : "light";
      const forced = rulesIn(flat).find(
        (rule) => rule.selector === `:root[data-theme="${other}"]`
      );
      const preferred = rulesIn(flat).find(
        (rule) =>
          rule.selector === `:root:not([data-theme="${tokens.scheme}"])` &&
          rule.parent?.type === "atrule" &&
          (rule.parent as AtRule).params.includes(
            `prefers-color-scheme: ${other}`
          )
      );
      if (!forced) problem(`a :root[data-theme="${other}"] block`);
      if (!preferred) {
        problem(
          `a :root:not([data-theme="${tokens.scheme}"]) block under prefers-color-scheme: ${other}`
        );
      }
      if (forced && preferred) {
        const a = declarationsOf(forced);
        const b = declarationsOf(preferred);
        const differ = [...new Set([...a.keys(), ...b.keys()])].filter(
          (prop) => a.get(prop) !== b.get(prop)
        );
        if (differ.length) {
          problem(`the two ${other} blocks to match (${differ.join(", ")})`);
        }
      }
      for (const role of FLIPS) {
        const token = tokens.tokens.find(
          (candidate) => candidate.name === `--${root}-${role}`
        );
        if (token && !token.alt)
          problem(`--${root}-${role} to change in ${other}`);
      }
      return problems;
    }
  },
  {
    id: "css.paper",
    rule: "`body:has(.<root>)` paints the page in `var(--<root>-paper)`, which the style guide reads as the page color.",
    check: ({ root, tokens }) =>
      tokens.paper?.name === `--${root}-paper`
        ? []
        : [`body:has(.${root}) { background: var(--${root}-paper) }`]
  },
  {
    id: "css.prefix",
    rule: "Everything is prefixed with the root class, so skins never collide: every custom property (`--<root>-…`), every `@keyframes` name (`<root>-…`), and every selector (scoped by `.<root>` or a `.<root>-…` class, or on `:root`).",
    check: ({ root }, flat) => {
      const problems = new Set<string>();
      const scoped = new RegExp(
        `(^|[^\\w-])\\.${root}(?![\\w])|\\.${root}-|^:root\\b|^html\\b`
      );
      flat.walkDecls((decl) => {
        if (decl.prop.startsWith("--") && !decl.prop.startsWith(`--${root}-`)) {
          problems.add(`${decl.prop} named --${root}-…`);
        }
      });
      flat.walkAtRules((rule) => {
        if (
          /keyframes$/i.test(rule.name) &&
          !rule.params.startsWith(`${root}-`)
        ) {
          problems.add(`@keyframes ${rule.params} named ${root}-…`);
        }
        if (rule.name === "property" && !rule.params.startsWith(`--${root}-`)) {
          problems.add(`@property ${rule.params} named --${root}-…`);
        }
      });
      for (const rule of rulesIn(flat)) {
        if (insideKeyframes(rule)) continue;
        for (const selector of rule.selectors) {
          if (!scoped.test(selector.trim())) {
            problems.add(`${selector.trim()} scoped to .${root}`);
          }
        }
      }
      return [...problems];
    }
  },
  {
    id: "css.focus",
    rule: "A `:focus-visible` style draws the focus ring in `var(--<root>-focus)`.",
    check: ({ root }, flat) =>
      rulesIn(flat).some(
        (rule) =>
          rule.selector.includes(":focus-visible") &&
          rule.some(
            (node) =>
              node.type === "decl" &&
              /^outline/.test(node.prop) &&
              node.value.includes(`var(--${root}-focus)`)
          )
      )
        ? []
        : [`a :focus-visible outline in var(--${root}-focus)`]
  },
  {
    id: "css.selection",
    rule: "A `::selection` style colors selected text with `var(--<root>-selection)` and `var(--<root>-selection-ink)`.",
    check: ({ root }, flat) => {
      const rules = rulesIn(flat).filter((rule) =>
        rule.selector.includes("::selection")
      );
      const uses = (token: string) =>
        rules.some((rule) =>
          rule.some(
            (node) =>
              node.type === "decl" && node.value.includes(`var(${token})`)
          )
        );
      return [`--${root}-selection`, `--${root}-selection-ink`]
        .filter((token) => !uses(token))
        .map((token) => `a ::selection using var(${token})`);
    }
  },
  {
    id: "css.reducedMotion",
    rule: "Under `prefers-reduced-motion: reduce`, one rule on `.<root> *` (and its `::before` and `::after`) stops every animation and transition. Script-driven motion checks `useReducedMotion()`.",
    check: ({ root }, flat) => {
      let found = false;
      flat.walkAtRules("media", (media) => {
        if (!media.params.includes("prefers-reduced-motion: reduce")) return;
        for (const rule of rulesIn(media)) {
          const everything = rule.selectors.some(
            (selector) => selector.trim() === `.${root} *`
          );
          const props = [...declarationsOf(rule).keys()];
          if (
            everything &&
            props.some((prop) => prop.startsWith("animation")) &&
            props.some((prop) => prop.startsWith("transition"))
          ) {
            found = true;
          }
        }
      });
      return found ? [] : [`a reduced-motion rule on .${root} *`];
    }
  }
];

export const getFoundation = (id: string) =>
  FOUNDATIONS.find((foundation) => foundation.id === id);
