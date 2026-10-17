/**
 * Non-HTML routes (feeds, sitemap): URL path -> route module. `routes.ts`
 * registers them and the build config pre-renders them without the `.data`
 * twin that page routes get.
 */
export const RESOURCE_ROUTES: Record<string, string> = {
  "sitemap.xml": "routes/sitemap.ts",
  "feed.xml": "routes/feed.xml.ts",
  "feed.json": "routes/feed.json.ts"
};
