/**
 * Design tokens
 * ==================================================
 * Reads each direction's custom properties straight from its stylesheet
 * (`./tokens.ts`), so the style guide's color and type sections never drift
 * from the CSS. The stylesheets live in `@keenanpayne/forma-ui`
 * (`app/lab/forma.server.ts`); the source ones are read, nested as written.
 */

import { directions } from "../registry";

import { parseTokens, type DirectionTokens } from "./tokens";

export * from "./tokens";

// Read through Vite, which bundles each as a chunk of its own, loaded only
// by the pages that read them
const PACKAGE = "/node_modules/@keenanpayne/forma-ui/src/directions";
const stylesheets = import.meta.glob<string>(
  "/node_modules/@keenanpayne/forma-ui/src/directions/*/*.css",
  { query: "?raw", import: "default" }
);

/** A direction's stylesheet in the package; empty when it has none */
export const readStylesheet = (slug: string) =>
  stylesheets[`${PACKAGE}/${slug}/${slug}.css`]?.() ?? Promise.resolve("");

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
