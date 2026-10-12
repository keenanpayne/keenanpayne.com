import { resolveLegacyPath } from "../lib/legacy-urls";
import { SITE_ORIGIN } from "../lib/site";

// Keys whose values are site paths (as opposed to image or asset URLs)
const PATH_KEYS = new Set(["url", "link", "typeUrl"]);

// The site's own origin in either scheme, with or without `www.`, so links
// written out in full (`https://keenanpayne.com/contact`) stay in the lab
const SITE_HOST = new URL(SITE_ORIGIN).host.replace(/\./g, "\\.");
const SITE_URL = new RegExp(
  `^https?://(?:www\\.)?${SITE_HOST}(?=[/?#]|$)`,
  "i"
);

/**
 * A link's site path when it points at this site (`/about/`, or the site's
 * own URL written out), and nothing for other hosts and image assets
 */
function sitePathOf(value: string) {
  let path: string;
  if (value.startsWith("/")) {
    if (value.startsWith("//")) return undefined;
    path = value;
  } else {
    const rest = value.replace(SITE_URL, "");
    if (rest === value) return undefined;
    path = rest.startsWith("/") ? rest : `/${rest}`;
  }
  return /^\/images\//.test(path) ? undefined : path;
}

// Follows the site's legacy redirects first (`/blog/x` -> `/x`), since the
// lab only mirrors current pages
function labLink(path: string, base: string) {
  const [, pathname, suffix] = /^([^?#]*)(.*)$/s.exec(path)!;
  return base + (resolveLegacyPath(pathname) ?? pathname) + suffix;
}

/**
 * Points every internal link in loader data at its lab mirror (e.g. `/about/`
 * becomes `/lab/monograph/about/`), so browsing a mockup stays in the lab.
 * The style guide runs it in the browser too, once for each direction.
 */
export function rebaseLinks<T>(value: T, base: string): T {
  const walk = (node: unknown, key?: string): unknown => {
    if (typeof node === "string") {
      if (key && PATH_KEYS.has(key)) {
        const path = sitePathOf(node);
        return path ? labLink(path, base) : node;
      }
      // Either quote style: some content writes `href='/practices'`
      return node.includes("href=")
        ? node.replace(
            /href=(["'])((?:(?!\1)[^])*)\1/g,
            (match, quote: string, href: string) => {
              const path = sitePathOf(href);
              return path
                ? `href=${quote}${labLink(path, base)}${quote}`
                : match;
            }
          )
        : node;
    }
    if (Array.isArray(node)) return node.map((item) => walk(item));
    if (node && typeof node === "object") {
      return Object.fromEntries(
        Object.entries(node).map(([k, v]) => [k, walk(v, k)])
      );
    }
    return node;
  };

  return walk(value) as T;
}
