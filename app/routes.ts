import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("sitemap.xml", "routes/sitemap.ts"),
  route("feed.xml", "routes/feed.xml.ts"),
  route("feed.json", "routes/feed.json.ts"),

  // Legacy URLs
  route("blog", "routes/redirects.ts", { id: "redirects/blog" }),
  route("blog/*", "routes/redirects.ts", { id: "redirects/blog-posts" }),
  route("work", "routes/redirects.ts", { id: "redirects/work" }),

  // Every Markdown page (posts, portfolio, services, tags, …) by its URL
  index("routes/page.tsx", { id: "routes/home" }),
  route("*", "routes/page.tsx")
] satisfies RouteConfig;
