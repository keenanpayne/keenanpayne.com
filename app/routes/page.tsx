import { data, redirect } from "react-router";

import { live } from "../lab/live";
import { DirectionPage } from "../lab/site/direction";
import { navigationFor, resolveView } from "../lab/site/ia";
import {
  getLabContent,
  getNotFoundPage,
  getPage
} from "../lib/content/content.server";
import { resolveLegacyPath } from "../lib/legacy-urls";
import { metaTags } from "../lib/meta";
import type { Route } from "./+types/page";

/**
 * Every page of the site, rendered by the live direction (`app/lab/live.ts`)
 * at the site root: the same shared content, information architecture, and
 * templates the lab mocks up at `/lab/<slug>/`, with nothing rebased.
 */
export function loader({ url }: Route.LoaderArgs) {
  const page = getPage(url.pathname);

  if (!page && url.pathname !== "/") {
    // Previously Netlify redirect rules; the SSR handler now answers every
    // path, so they live with the app. Like Netlify's, they keep the query.
    const legacyPath = resolveLegacyPath(url.pathname);
    if (legacyPath) throw redirect(`${legacyPath}${url.search}`, 301);
  }

  const path = page?.url ?? url.pathname;
  const view = resolveView(path, page);
  const result = {
    path,
    view,
    navigation: navigationFor(view, path),
    content: getLabContent(),
    meta: (page ?? getNotFoundPage()).meta
  };

  return view.kind === "notFound" ? data(result, { status: 404 }) : result;
}

export function meta({ loaderData }: Route.MetaArgs) {
  return loaderData ? metaTags(loaderData.meta) : [];
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { path, view, navigation, content } = loaderData;

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
