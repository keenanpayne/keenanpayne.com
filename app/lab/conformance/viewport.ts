/**
 * A phone's view of a stylesheet
 * ==================================================
 * Reads a direction's flattened stylesheet the way a browser of one width
 * would, as far as width goes: which `@media` blocks apply there, and
 * whether the rules they leave hide an element with `display: none` or
 * `visibility: hidden`. The checks use it to keep the Shell's clock on
 * screen on phones.
 *
 * It reads width conditions only. Other media features count as matching,
 * apart from `print`, hover, and a fine pointer (a phone has none of
 * those). Rules under a state (`:hover`, `:popover-open`, `:has()`, an
 * open menu's class) say nothing about the default state, so they're
 * skipped, and specificity isn't weighed: a later rule wins.
 */

import type { AtRule, Container, Document, Root, Rule } from "postcss";

/** The width the checks read a stylesheet at: a phone, upright */
export const PHONE_WIDTH = 390;

const EM = 16;

/** A length in pixels, from `px`, `em`, or `rem` */
function pixels(value: string) {
  const match = /^([\d.]+)(px|r?em)?$/.exec(value.trim());
  if (!match) return undefined;
  return parseFloat(match[1]) * (match[2] && match[2] !== "px" ? EM : 1);
}

const compare = (a: number, operator: string, b: number) =>
  operator === "<"
    ? a < b
    : operator === "<="
      ? a <= b
      : operator === ">"
        ? a > b
        : operator === ">="
          ? a >= b
          : a === b;

const FLIPPED: Record<string, string> = {
  "<": ">",
  "<=": ">=",
  ">": "<",
  ">=": "<="
};

/**
 * Whether one condition (the inside of its parentheses) holds at `width`;
 * `undefined` when it isn't about width
 */
function conditionHolds(condition: string, width: number) {
  const text = condition.trim();
  let match: RegExpExecArray | null;

  if ((match = /^(min|max)-width\s*:\s*(\S+)$/.exec(text))) {
    const px = pixels(match[2]);
    if (px === undefined) return undefined;
    return match[1] === "min" ? width >= px : width <= px;
  }
  if ((match = /^width\s*(<=|>=|<|>|=)\s*(\S+)$/.exec(text))) {
    const px = pixels(match[2]);
    return px === undefined ? undefined : compare(width, match[1], px);
  }
  // `420px <= width < 960px`, or `420px <= width`, read from the width's side
  if (
    (match = /^(\S+)\s*(<=|>=|<|>)\s*width(?:\s*(<=|>=|<|>)\s*(\S+))?$/.exec(
      text
    ))
  ) {
    const low = pixels(match[1]);
    if (low === undefined) return undefined;
    let holds = compare(width, FLIPPED[match[2]], low);
    if (match[3]) {
      const high = pixels(match[4]);
      if (high === undefined) return undefined;
      holds &&= compare(width, match[3], high);
    }
    return holds;
  }
  return undefined;
}

/** Splits at a separator wherever it sits outside parentheses */
function splitOutside(text: string, separator: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let at = 0; at < text.length; at++) {
    const char = text[at];
    if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (depth === 0 && text.startsWith(separator, at)) {
      parts.push(text.slice(start, at));
      at += separator.length - 1;
      start = at + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

function termHolds(term: string, width: number): boolean {
  const text = term.trim().replace(/^only\s+/, "");
  if (text.startsWith("not ")) return !termHolds(text.slice(4), width);
  if (/^(all|screen)$/.test(text)) return true;
  if (text === "print") return false;
  const inner = /^\((.*)\)$/s.exec(text)?.[1];
  if (inner === undefined) return true;
  // A group: `((width >= 420px) and (hover: hover))`
  if (/^\s*\(/.test(inner)) return mediaMatches(inner, width);
  const byWidth = conditionHolds(inner, width);
  if (byWidth !== undefined) return byWidth;
  if (/^(any-)?hover\s*:\s*hover$/.test(inner.trim())) return false;
  if (/^(any-)?pointer\s*:\s*fine$/.test(inner.trim())) return false;
  return true;
}

/** Whether a media query list applies at a viewport `width` */
export const mediaMatches = (params: string, width: number) =>
  splitOutside(params, ",").some((query) =>
    splitOutside(query, " and ").every((term) => termHolds(term, width))
  );

/** Whether a rule applies at `width`, given the at-rules around it */
function applies(rule: Rule, width: number) {
  for (
    let node: Container | Document | undefined = rule.parent;
    node;
    node = node.parent
  ) {
    if (node.type !== "atrule") continue;
    const { name, params } = node as AtRule;
    if (name === "media" && !mediaMatches(params, width)) return false;
    if (/keyframes$/i.test(name)) return false;
  }
  return true;
}

/** An element as the check sees it: its tag, classes, and attributes */
export interface Target {
  tag: string;
  classes: string[];
  attributes: Record<string, string>;
}

/** Pseudo-classes for a state the element is only sometimes in */
const STATEFUL =
  /:(hover|focus|focus-visible|focus-within|active|checked|open|popover-open|target|has\()/;

/** A selector's compounds, split at its combinators */
function compoundsOf(selector: string) {
  const compounds: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of selector.trim()) {
    if (char === "(" || char === "[") depth++;
    else if (char === ")" || char === "]") depth--;
    if (depth === 0 && /[\s>+~]/.test(char)) {
      if (current) compounds.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  if (current) compounds.push(current);
  return compounds;
}

/** A compound without its pseudo-classes and pseudo-elements */
function plainOf(compound: string) {
  let plain = "";
  let at = 0;
  while (at < compound.length) {
    const char = compound[at];
    if (char === "[") {
      const end = compound.indexOf("]", at);
      plain += compound.slice(at, end + 1);
      at = end + 1;
    } else if (char === ":") {
      at++;
      if (compound[at] === ":") at++;
      while (at < compound.length && /[\w-]/.test(compound[at])) at++;
      if (compound[at] === "(") {
        let depth = 0;
        do {
          if (compound[at] === "(") depth++;
          else if (compound[at] === ")") depth--;
          at++;
        } while (at < compound.length && depth > 0);
      }
    } else {
      plain += char;
      at++;
    }
  }
  return plain;
}

const CLASS = /\.(-?[_a-zA-Z][\w-]*)/g;
const ATTRIBUTE = /\[([\w-]+)(?:([~|^$*]?=)"?([^"\]]*)"?)?\]/g;

const tagOf = (plain: string) =>
  /^[a-zA-Z][\w-]*/.exec(plain)?.[0].toLowerCase();

/** Whether a compound selects the target */
function selects(compound: string, target: Target) {
  const plain = plainOf(compound);
  const simple = plain.replace(/\[[^\]]*\]/g, "");
  const tag = tagOf(simple);
  if (tag && tag !== target.tag) return false;
  for (const [, name] of simple.matchAll(CLASS)) {
    if (!target.classes.includes(name)) return false;
  }
  for (const [, id] of simple.matchAll(/#([\w-]+)/g)) {
    if (target.attributes.id !== id) return false;
  }
  for (const [, name, operator, value] of plain.matchAll(ATTRIBUTE)) {
    const actual = target.attributes[name];
    if (actual === undefined) return false;
    if (!operator) continue;
    const holds =
      operator === "="
        ? actual === value
        : operator === "~="
          ? actual.split(/\s+/).includes(value)
          : operator === "^="
            ? actual.startsWith(value)
            : operator === "$="
              ? actual.endsWith(value)
              : operator === "*="
                ? actual.includes(value)
                : actual === value || actual.startsWith(`${value}-`);
    if (!holds) return false;
  }
  return true;
}

/**
 * Whether a compound could select something above the target: its classes
 * and tag are among the ancestors' (the order isn't checked)
 */
function couldBeAbove(
  compound: string,
  classes: Set<string>,
  tags: Set<string>
) {
  const simple = plainOf(compound).replace(/\[[^\]]*\]/g, "");
  const tag = tagOf(simple);
  if (tag && !tags.has(tag)) return false;
  return [...simple.matchAll(CLASS)].every(([, name]) => classes.has(name));
}

/**
 * The selector that hides the first of `chain` (an element, then its
 * ancestors outward) at `width`, with `display: none` or `visibility:
 * hidden`; nothing when it stays on screen
 */
export function hiddenAt(flat: Root, width: number, chain: Target[]) {
  const classes = new Set(chain.flatMap((target) => target.classes));
  const tags = new Set(chain.map((target) => target.tag));
  const shown = chain.map(() => ({
    display: undefined as string | undefined,
    displayBy: "",
    visibility: undefined as string | undefined,
    visibilityBy: ""
  }));

  flat.walkRules((rule) => {
    if (!applies(rule, width)) return;
    let display: string | undefined;
    let visibility: string | undefined;
    rule.walkDecls((decl) => {
      if (decl.parent !== rule) return;
      if (decl.prop === "display") display = decl.value.trim();
      if (decl.prop === "visibility") visibility = decl.value.trim();
    });
    if (!display && !visibility) return;

    for (const selector of rule.selectors) {
      if (STATEFUL.test(selector)) continue;
      const compounds = compoundsOf(selector);
      const last = compounds[compounds.length - 1];
      const above = compounds.slice(0, -1);
      if (!last) continue;
      if (!above.every((compound) => couldBeAbove(compound, classes, tags))) {
        continue;
      }
      chain.forEach((target, at) => {
        if (!selects(last, target)) return;
        if (display) {
          shown[at].display = display;
          shown[at].displayBy = selector.trim();
        }
        if (visibility) {
          shown[at].visibility = visibility;
          shown[at].visibilityBy = selector.trim();
        }
      });
    }
  });

  for (const state of shown) {
    if (state.display === "none") return state.displayBy;
    if (state.visibility === "hidden") return state.visibilityBy;
  }
  return undefined;
}
