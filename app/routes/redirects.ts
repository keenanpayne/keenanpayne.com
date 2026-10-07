import { redirect } from "react-router";

import type { Route } from "./+types/redirects";

// Previously Netlify redirect rules; the SSR handler now answers every path,
// so they live with the app.
export function loader({ params, url }: Route.LoaderArgs) {
  const { pathname } = url;
  // Strip leading slashes so `/blog//example.com` can't redirect off-site
  const splat = (params as { "*"?: string })["*"]?.replace(/^[/\\]+/, "");

  if (pathname.startsWith("/work")) return redirect("/portfolio/", 301);
  if (splat) return redirect(`/${splat}`, 301);
  return redirect("/archive/", 301);
}
