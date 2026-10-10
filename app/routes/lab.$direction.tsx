import { use } from "react";
import { data } from "react-router";

import { loadDirection } from "../lab/directions";
import { LabBar } from "../lab/LabBar";
import labStyles from "../lab/lab.css?url";
import { rebaseLinks } from "../lab/links";
import { getDirection, labPath } from "../lab/registry";
import { DirectionPage, navigationFor, resolveView } from "../lab/site";
import { getLabContent, getPage } from "../lib/content/content.server";
import { metadata } from "../lib/site";
import type { Route } from "./+types/lab.$direction";

export const handle = { bare: true };

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: labStyles }
];

// Mocked up as the "page not found" screen, served with a 200 so it can be
// pre-rendered like the other mockups
const NOT_FOUND_PATH = "/404/";

export function loader({ params }: Route.LoaderArgs) {
  const direction = getDirection(params.direction);
  if (!direction) throw data(null, { status: 404 });

  // The site path this mockup mirrors, e.g. `/lab/monograph/about/` -> `/about/`
  const path = `/${params["*"] ?? ""}`;
  const view = resolveView(path, getPage(path));

  const result = rebaseLinks(
    {
      direction,
      path,
      view,
      navigation: navigationFor(view, path),
      content: getLabContent()
    },
    labPath(direction.slug).slice(0, -1)
  );

  return view.kind === "notFound" && path !== NOT_FOUND_PATH
    ? data(result, { status: 404 })
    : result;
}

export const meta = ({ loaderData }: Route.MetaArgs) => {
  const view = loaderData?.view;
  const pageTitle =
    !view || view.kind === "notFound"
      ? "Not found"
      : view.kind === "home"
        ? "Home"
        : view.page.meta.title.split(" | ")[0];

  return [
    {
      title: `${pageTitle} · ${loaderData?.direction.name} · Design Lab | ${metadata.title}`
    },
    { name: "robots", content: "noindex" }
  ];
};

export default function LabDirection({ loaderData }: Route.ComponentProps) {
  const { direction, path, view, navigation, content } = loaderData;
  // Suspends until the direction's chunk loads (navigations wait on it)
  const skin = use(loadDirection(direction.slug));

  return (
    <>
      <DirectionPage
        // Fresh state for every page, like a full page load
        key={`${direction.slug}${path}`}
        direction={skin}
        base={labPath(direction.slug).slice(0, -1)}
        path={path}
        view={view}
        navigation={navigation}
        content={content}
      />
      <LabBar current={direction.slug} path={path} />
    </>
  );
}
