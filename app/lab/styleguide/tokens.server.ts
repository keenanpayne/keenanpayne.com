/**
 * Design tokens
 * ==================================================
 * Reads each direction's custom properties straight from its stylesheet
 * (`./tokens.ts`), so the style guide's color and type sections never drift
 * from the CSS.
 */

import { directions } from "../registry";

import { parseTokens, type DirectionTokens } from "./tokens";

export * from "./tokens";

// Read through Vite, which keeps them current in development and bundles
// each as a chunk of its own, loaded only by the pages that read them
const stylesheets = import.meta.glob<string>("../directions/*/*.css", {
  query: "?raw",
  import: "default"
});

/** A direction's own stylesheet, `<slug>/<slug>.css`; empty when it has none */
export const readStylesheet = (slug: string) =>
  stylesheets[`../directions/${slug}/${slug}.css`]?.() ?? Promise.resolve("");

let cache: Promise<Record<string, DirectionTokens>> | undefined;

/** Tokens for every direction, by slug */
export function getDirectionTokens() {
  return (cache ??= Promise.all(
    directions.map(
      async ({ slug }) =>
        [slug, parseTokens(await readStylesheet(slug))] as const
    )
  ).then(Object.fromEntries));
}
