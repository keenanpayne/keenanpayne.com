import { canonicalPath } from "./site";

/**
 * Where a legacy URL now lives (the old Netlify redirect rules), or
 * `undefined` when the path isn't a legacy one.
 */
export function resolveLegacyPath(pathname: string): string | undefined {
  // Case-insensitive, like the route matching that sends requests here
  if (/^\/work\/?$/i.test(pathname)) return "/portfolio/";

  const blog = /^\/blog(?:\/(.*))?$/i.exec(pathname);
  if (!blog) return undefined;

  // Strip leading slashes so `/blog//example.com` can't redirect off-site;
  // the blog index was `/blog/index.html`
  const rest = blog[1]?.replace(/^[/\\]+/, "").replace(/^index\.html$/i, "");
  if (!rest) return "/archive/";

  // Old blog URLs ended in `.html`, e.g. `/blog/css-arrow-interaction.html`;
  // send them straight to the canonical, trailing-slash page URL
  return canonicalPath(`/${rest.replace(/\.html$/i, "")}`);
}
