import { redirect } from "react-router";

import { resolveLegacyPath } from "../lib/legacy-urls";
import type { Route } from "./+types/redirects";

// Previously Netlify redirect rules; the SSR handler now answers every path,
// so they live with the app. Like Netlify's, they keep the query string.
export function loader({ url }: Route.LoaderArgs) {
  const path = resolveLegacyPath(url.pathname) ?? "/archive/";
  return redirect(`${path}${url.search}`, 301);
}
