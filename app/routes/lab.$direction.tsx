import { use } from "react";
import { data } from "react-router";

import { loadDirection } from "../lab/directions";
import { LabBar } from "../lab/LabBar";
import labStyles from "../lab/lab.css?url";
import { rebaseLinks } from "../lab/links";
import { getDirection, labBase } from "../lab/registry";
import { DirectionPage } from "../lab/site/direction";
import { labelOf } from "../lab/site/helpers";
import { navigationFor, resolveView } from "../lab/site/ia";
import { getLabContent, getPage } from "../lib/content/content.server";
import { metadata } from "../lib/site";
import type { LabContent } from "../lib/types";
import type { Route } from "./+types/lab.$direction";

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: labStyles }
];

// Mocked up as the "page not found" screen, served with a 200 so it can be
// pre-rendered like the other mockups
const NOT_FOUND_PATH = "/404/";

// The content is the same on every page of a direction, so its links are
// rebased once for each
const contentByDirection = new Map<string, LabContent>();

export function loader({ params }: Route.LoaderArgs) {
  const direction = getDirection(params.direction);
  if (!direction) throw data(null, { status: 404 });
  const { slug, name } = direction;
  const base = labBase(slug);

  // The site path this mockup mirrors, e.g. `/lab/monograph/about/` -> `/about/`
  // (as the page spells it, so `/about` is the same mockup as `/about/`)
  const requested = `/${params["*"] ?? ""}`;
  const page = getPage(requested);
  const path = page?.url ?? requested;
  const view = resolveView(path, page);

  let content = contentByDirection.get(slug);
  if (!content) {
    content = rebaseLinks(getLabContent(), base);
    contentByDirection.set(slug, content);
  }

  const result = {
    direction: { slug, name },
    path,
    ...rebaseLinks({ view, navigation: navigationFor(view, path) }, base),
    content
  };

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
        : labelOf(view.page);

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
