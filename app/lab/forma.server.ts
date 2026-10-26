/**
 * Forma UI on disk
 * ==================================================
 * The directions' stylesheets live in `@keenanpayne/forma-ui`
 * (github.com/keenanpayne/forma-ui), installed from npm; each direction's
 * `index.tsx` links the built one. The checks and the style guide read the
 * source stylesheet from the installed package, so they measure the same
 * CSS the page loads. Free of Vite, so the scripts can read it too.
 */

import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

/** The installed package's folder */
export const FORMA_DIR = dirname(
  createRequire(import.meta.url).resolve("@keenanpayne/forma-ui/package.json")
);

/** A direction's source stylesheet in the package, `src/directions/<slug>/<slug>.css` */
export const formaStylesheetPath = (slug: string) =>
  join(FORMA_DIR, "src", "directions", slug, `${slug}.css`);

/** The stylesheet's source; empty when the package has no such direction */
export function readFormaStylesheet(slug: string) {
  const path = formaStylesheetPath(slug);
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}
