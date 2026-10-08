import { resolveLegacyPath } from "../lib/legacy-urls";

// Keys whose values are site paths (as opposed to image or asset URLs)
const PATH_KEYS = new Set(["url", "link", "typeUrl"]);

const isSitePath = (value: string) =>
  value.startsWith("/") &&
  !value.startsWith("//") &&
  !/^\/images\//.test(value);

// Follows the site's legacy redirects first (`/blog/x` -> `/x`), since the
// lab only mirrors current pages
function labLink(path: string, base: string) {
  const [, pathname, suffix] = /^([^?#]*)(.*)$/s.exec(path)!;
  return base + (resolveLegacyPath(pathname) ?? pathname) + suffix;
}

/**
 * Points every internal link in loader data at its lab mirror (e.g. `/about/`
 * becomes `/lab/monograph/about/`), so browsing a mockup stays in the lab.
 */
export function rebaseLinks<T>(value: T, base: string): T {
  const walk = (node: unknown, key?: string): unknown => {
    if (typeof node === "string") {
      if (key && PATH_KEYS.has(key) && isSitePath(node)) {
        return labLink(node, base);
      }
      return node.includes('href="/')
        ? node.replace(
            /href="(\/(?!\/|images\/)[^"]*)"/g,
            (_match, path: string) => `href="${labLink(path, base)}"`
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
