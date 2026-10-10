import type { Config } from "@react-router/dev/config";

const RESOURCE_PATHS = ["/sitemap.xml", "/feed.xml", "/feed.json"];

export default {
  // Server-side render every request, and pre-render every known page at
  // build time so it can be served as static HTML.
  ssr: true,
  async prerender() {
    const { getPrerenderPaths } =
      await import("./app/lib/content/content.server");
    return [...getPrerenderPaths(), ...RESOURCE_PATHS];
  },
  async buildEnd({ reactRouterConfig }) {
    const { rm, writeFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const { netlifyHeadersFile } = await import("./app/lib/security-headers");
    const client = join(reactRouterConfig.buildDirectory, "client");

    // Netlify serves pre-rendered pages without running the server, so their
    // security headers come from `_headers` instead of the root middleware
    await writeFile(join(client, "_headers"), netlifyHeadersFile());

    // Resource routes are pre-rendered with a `.data` file too, which nothing
    // requests (they aren't navigated to client-side)
    await Promise.all(
      RESOURCE_PATHS.map((path) => rm(join(client, `${path}.data`)))
    );
  }
} satisfies Config;
