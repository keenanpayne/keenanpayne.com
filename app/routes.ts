import { type RouteConfig, index, route } from "@react-router/dev/routes";

import { RESOURCE_ROUTES } from "./lib/resource-routes";

export default [
  ...Object.entries(RESOURCE_ROUTES).map(([path, file]) => route(path, file)),

  // Every Markdown page (posts, portfolio, services, tags, …) by its URL,
  // plus the legacy redirects and the 404 page. The splat alone doesn't
  // pre-render `/`, hence the index route.
  index("routes/page.tsx", { id: "routes/home" }),
  route("*", "routes/page.tsx")
] satisfies RouteConfig;
