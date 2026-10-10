/**
 * Where a legacy URL now lives (the old Netlify redirect rules), or
 * `undefined` when the path isn't a legacy one.
 */
export function resolveLegacyPath(pathname: string): string | undefined {
  if (/^\/work\/?$/.test(pathname)) return "/portfolio/";

  const blog = /^\/blog(?:\/(.*))?$/.exec(pathname);
  if (!blog) return undefined;

  // Strip leading slashes so `/blog//example.com` can't redirect off-site
  const rest = blog[1]?.replace(/^[/\\]+/, "");
  if (!rest) return "/archive/";

  // Old blog URLs ended in `.html`, e.g. `/blog/css-arrow-interaction.html`
  return `/${rest.replace(/\.html$/, "/")}`;
}
