import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render every request, and pre-render every known page at
  // build time so it can be served as static HTML.
  ssr: true,
  async prerender() {
    const { getPrerenderPaths } =
      await import("./app/lib/content/content.server");
    const { directions, SAMPLE_PAGES } = await import("./app/lab/registry");
    const { comparePath, STYLE_SECTIONS, styleguidePath } =
      await import("./app/lab/styleguide/sections");
    return [
      ...getPrerenderPaths(),
      "/lab/",
      ...directions.flatMap(({ slug }) =>
        SAMPLE_PAGES.map(({ path }) => `/lab/${slug}${path}`)
      ),
      ...STYLE_SECTIONS.map(({ id }) => comparePath(id)),
      ...directions.map(({ slug }) => styleguidePath(slug)),
      "/sitemap.xml",
      "/feed.xml",
      "/feed.json"
    ];
  },
  // Netlify serves pre-rendered pages without running the server, so their
  // security headers come from `_headers` instead of the root middleware
  async buildEnd({ reactRouterConfig }) {
    const { writeFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const { netlifyHeadersFile } = await import("./app/lib/security-headers");
    await writeFile(
      join(reactRouterConfig.buildDirectory, "client", "_headers"),
      netlifyHeadersFile()
    );
  }
} satisfies Config;
