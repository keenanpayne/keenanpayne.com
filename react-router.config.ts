import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render every request, and pre-render every known page at
  // build time so it can be served as static HTML.
  ssr: true,
  async prerender() {
    const { getPrerenderPaths } =
      await import("./app/lib/content/content.server");
    return [...getPrerenderPaths(), "/sitemap.xml", "/feed.xml", "/feed.json"];
  }
} satisfies Config;
