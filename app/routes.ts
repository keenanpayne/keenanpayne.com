import { type RouteConfig, index, route } from "@react-router/dev/routes";

import { RESOURCE_ROUTES } from "./lib/resource-routes";

export default [
  ...Object.entries(RESOURCE_ROUTES).map(([path, file]) => route(path, file)),

  // Design lab: every direction's mockups of the site, and the style guide
  route("lab", "routes/lab.tsx"),
  route("lab/styleguide/*", "routes/lab.styleguide.tsx"),
  route("lab/:direction/*", "routes/lab.$direction.tsx"),

  // Every page (posts, portfolio, services, tags, …) by its URL, rendered by
  // the live direction (`app/lab/live.ts`), plus the legacy redirects and
  // the 404 page. The splat alone doesn't pre-render `/`, hence the index
  // route.
  index("routes/page.tsx", { id: "routes/home" }),
  route("*", "routes/page.tsx")
] satisfies RouteConfig;
