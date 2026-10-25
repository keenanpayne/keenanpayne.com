/**
 * Design tokens
 * ==================================================
 * Reads a direction's custom properties from its stylesheet, as the style
 * guide shows them and the checks measure them. Every direction declares
 * its tokens the way `app/lab/README.md` asks: on `:root`, then again under
 * `:root[data-theme="…"]` for the other scheme. Free of Vite, so the
 * scripts can read it too (`npm run a11y:contrast`); `./tokens.server.ts`
 * reads every direction's stylesheet with it.
 */

export type TokenKind = "color" | "font" | "other";

export interface Token {
  name: string;
  kind: TokenKind;
  /** In the direction's default scheme, with `var()`s resolved */
  value: string;
  /** In its other scheme, when it changes there */
  alt?: string;
}

export interface DirectionTokens {
  /** The scheme `:root` declares; the other one overrides it */
  scheme: "light" | "dark";
  /** The page color, which stages are filled and swatches composited with */
  paper?: { name: string; value: string; alt?: string };
  tokens: Token[];
}

/** The body of the first top-level rule whose selector matches */
function ruleBody(css: string, selector: RegExp) {
  const match = selector.exec(css);
  if (!match) return undefined;

  const start = match.index + match[0].length;
  let depth = 1;
  for (let at = start; at < css.length; at++) {
    if (css[at] === "{") depth++;
    if (css[at] === "}" && --depth === 0) return css.slice(start, at);
  }
  return undefined;
}

/** Custom properties declared directly in a rule body (not in nested rules) */
function declarations(body: string) {
  const found = new Map<string, string>();
  let parens = 0;
  let braces = 0;
  let quote = "";
  let current = "";

  const flush = () => {
    const declaration = /^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/.exec(current);
    if (declaration) {
      found.set(declaration[1], declaration[2].replace(/\s+/g, " "));
    }
    current = "";
  };

  for (const char of body.replace(/\/\*[\s\S]*?\*\//g, "")) {
    if (braces > 0) {
      // Inside a nested rule (`@media …`): skip it, and what led up to it
      if (char === "{") braces++;
      if (char === "}" && --braces === 0) current = "";
      continue;
    }
    if (quote) {
      if (char === quote) quote = "";
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "(") {
      parens++;
    } else if (char === ")") {
      parens--;
    } else if (char === "{") {
      braces++;
      continue;
    } else if (char === ";" && parens === 0) {
      flush();
      continue;
    }
    current += char;
  }
  flush();

  return found;
}

/** Replaces `var(--name)` (and `var(--name, fallback)`) with its value */
function resolve(value: string, scope: Map<string, string>, seen = 0): string {
  if (seen > 8 || !value.includes("var(")) return value;
  const resolved = value.replace(
    /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g,
    (match, name: string, fallback?: string) =>
      scope.get(name) ?? fallback ?? match
  );
  return resolve(resolved, scope, seen + 1);
}

const COLOR =
  /^(#[\da-f]{3,8}|(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(.*\)|transparent|currentcolor|white|black)$/i;
const FONT = /(serif|sans-serif|monospace|system-ui|cursive|fantasy)\s*$/i;

const kindOf = (value: string): TokenKind =>
  COLOR.test(value) ? "color" : FONT.test(value) ? "font" : "other";

/** A stylesheet's tokens, read the way the style guide shows them */
export function parseTokens(css: string): DirectionTokens {
  const base = declarations(ruleBody(css, /^:root\s*\{/m) ?? "");
  const altMatch = /^:root\[data-theme="(light|dark)"\]\s*\{/m.exec(css);
  const alt = altMatch
    ? declarations(
        ruleBody(css, /^:root\[data-theme="(?:light|dark)"\]\s*\{/m) ?? ""
      )
    : new Map<string, string>();
  const altScope = new Map([...base, ...alt]);

  const tokens = [...base].map(([name, raw]): Token => {
    const value = resolve(raw, base);
    // A token that isn't overridden can still change, by aliasing one that is
    const other = resolve(alt.get(name) ?? raw, altScope);
    return {
      name,
      kind: kindOf(value),
      value,
      alt: altMatch && other !== value ? other : undefined
    };
  });

  // `body:has(.root) { background: var(--paper) }` names the page color
  const paperName =
    /body:has\(\.[\w-]+\)\s*\{\s*background(?:-color)?:\s*var\((--[\w-]+)\)/.exec(
      css
    )?.[1];
  const paper = tokens.find((token) => token.name === paperName);

  return {
    scheme: altMatch?.[1] === "light" ? "dark" : "light",
    paper: paper && { name: paper.name, value: paper.value, alt: paper.alt },
    tokens
  };
}
