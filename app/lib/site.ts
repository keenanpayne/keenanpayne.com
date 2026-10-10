import metadata from "../data/metadata.json";

export { metadata };

/** Site origin without a trailing slash, e.g. `https://keenanpayne.com` */
export const SITE_ORIGIN = metadata.url.replace(/\/$/, "");

export const absoluteUrl = (path: string) => `${SITE_ORIGIN}${path}`;

// Links whose `href` starts with a protocol (`https:`, `mailto:`, …) or `//`
// open in a new tab — this mirrors the old `eleventy-plugin-external-links`.
const EXTERNAL_LINK = /^(([a-z]+:)|(\/\/))/i;

export const isExternalUrl = (href: string) => EXTERNAL_LINK.test(href);

export const externalLinkProps = (href: string) =>
  isExternalUrl(href)
    ? ({ target: "_blank", rel: "noopener" } as const)
    : ({} as const);

/**
 * Internal links rendered by React use the canonical, trailing-slash form of
 * a path (`/services` -> `/services/`) so client-side navigations hit the
 * pre-rendered page data instead of the server.
 */
export function canonicalPath(href: string) {
  if (isExternalUrl(href) || !href.startsWith("/")) return href;

  const match = /^([^?#]*)(.*)$/.exec(href)!;
  const [, path, suffix] = match;
  const lastSegment = path.slice(path.lastIndexOf("/") + 1);

  if (path.endsWith("/") || lastSegment.includes(".")) return href;
  return `${path}/${suffix}`;
}
