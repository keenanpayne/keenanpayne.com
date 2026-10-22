import { use } from "react";
import { data } from "react-router";

import { useLabContent } from "../lab/content";
import { loadDirection } from "../lab/directions";
import { LabBar } from "../lab/LabBar";
import labStyles from "../lab/lab.css?url";
import { getDirection, labBase, SAMPLE_PAGES } from "../lab/registry";
import { DirectionPage } from "../lab/site/direction";
import { labelOf } from "../lab/site/helpers";
import { resolveSitePage } from "../lab/site/page.server";
import { metadata } from "../lib/site";
import type { Route } from "./+types/lab.$direction";

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: labStyles }
];

export function loader({ params }: Route.LoaderArgs) {
  const direction = getDirection(params.direction);
  if (!direction) throw data(null, { status: 404 });
  const { slug, name } = direction;

  // The site path this mockup mirrors, e.g. `/lab/monograph/about/` -> `/about/`
  // (the content ships once, as a module, rather than with every mockup)
  const { path, view, navigation } = resolveSitePage(
    `/${params["*"] ?? ""}`,
    labBase(slug)
  );
  const result = { direction: { slug, name }, path, view, navigation };

  // A listed sample (the "page not found" mockup among them) is served with
  // a 200, so it can be pre-rendered like the other mockups
  const listed = SAMPLE_PAGES.some((sample) => sample.path === path);
  return view.kind === "notFound" && !listed
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
        : labelOf(view.page);

  return [
    {
      title: `${pageTitle} · ${loaderData?.direction.name} · Design Lab | ${metadata.title}`
    },
    { name: "robots", content: "noindex" }
  ];
};

export default function LabDirection({ loaderData }: Route.ComponentProps) {
  const { direction, path, view, navigation } = loaderData;
  const content = useLabContent(labBase(direction.slug));
  // Suspends until the direction's chunk loads (navigations wait on it)
  const skin = use(loadDirection(direction.slug));

  return (
    <>
      <DirectionPage
        // Fresh state for every page, like a full page load
        key={`${direction.slug}${path}`}
        direction={skin}
        base={labBase(direction.slug)}
        path={path}
        view={view}
        navigation={navigation}
        content={content}
      />
      <LabBar current={direction.slug} path={path} />
    </>
  );
}
