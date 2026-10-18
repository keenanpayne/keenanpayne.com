import { data, redirect } from "react-router";

import { useLabContent } from "../lab/content";
import { live } from "../lab/live";
import { DirectionPage } from "../lab/site/direction";
import { resolveSitePage } from "../lab/site/page.server";
import { resolveLegacyPath } from "../lib/legacy-urls";
import { metaTags } from "../lib/meta";
import type { Route } from "./+types/page";

/**
 * Every page of the site, rendered by the live direction (`app/lab/live.ts`)
 * at the site root: the same shared content, information architecture, and
 * templates the lab mocks up at `/lab/<slug>/`, with nothing rebased.
 */
export function loader({ url }: Route.LoaderArgs) {
  // The content is the same on every page, so it ships once, as a module
  // (`../lab/content`), rather than in each page's loader data
  const { path, view, navigation, meta } = resolveSitePage(url.pathname);
  const site = { path, view, navigation, meta };
  if (view.kind !== "notFound") return site;

  // Previously Netlify redirect rules; the SSR handler now answers every
  // path, so they live with the app. Like Netlify's, they keep the query.
  const legacyPath = resolveLegacyPath(url.pathname);
  if (legacyPath) throw redirect(`${legacyPath}${url.search}`, 301);

  return data(site, { status: 404 });
}

export function meta({ loaderData }: Route.MetaArgs) {
  return loaderData ? metaTags(loaderData.meta) : [];
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { path, view, navigation } = loaderData;
  const content = useLabContent("");

  return (
    <DirectionPage
      // Fresh state for every page, like a full page load
      key={path}
      direction={live}
      base=""
      path={path}
      view={view}
      navigation={navigation}
      content={content}
    />
  );
}
