import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render every request, and pre-render every known page at
  // build time so it can be served as static HTML.
  ssr: true,
  async prerender() {
    const { getPrerenderPaths } =
      await import("./app/lib/content/content.server");
    const { directions } = await import("./app/lab/registry");
    return [
      ...getPrerenderPaths(),
      "/lab/",
      ...directions.flatMap(({ slug, pages }) =>
        pages.map(({ path }) => `/lab/${slug}${path}`)
      ),
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
