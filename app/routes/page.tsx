import { data } from "react-router";

import { BasicPage } from "../components/layouts/BasicPage";
import { PortfolioPage } from "../components/layouts/PortfolioPage";
import { PostPage } from "../components/layouts/PostPage";
import { getNotFoundPage, getPage } from "../lib/content/content.server";
import { metaTags } from "../lib/meta";
import type { Route } from "./+types/page";

export function loader({ url }: Route.LoaderArgs) {
  const page = getPage(url.pathname);
  if (page) return page;

  return data(getNotFoundPage(), { status: 404 });
}

export function meta({ loaderData }: Route.MetaArgs) {
  return loaderData ? metaTags(loaderData.meta) : [];
}

export default function Page({ loaderData: page }: Route.ComponentProps) {
  // Keyed by URL so client-side navigations start each page with fresh state
  // (expanded testimonials, lazy-loaded media, embeds), like a full page load.
  switch (page.layout) {
    case "post":
      return <PostPage key={page.url} page={page} />;
    case "portfolio":
      return <PortfolioPage key={page.url} page={page} />;
    default:
      return <BasicPage key={page.url} page={page} />;
  }
}
