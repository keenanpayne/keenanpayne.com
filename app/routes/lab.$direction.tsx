import { data } from "react-router";

import { directionComponents } from "../lab/directions";
import { LabBar } from "../lab/LabBar";
import labStyles from "../lab/lab.css?url";
import { rebaseLinks } from "../lab/links.server";
import { getDirection, labPath } from "../lab/registry";
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
  const page = path === "/" ? null : getPage(path);
  const notFound = path !== "/" && !page;

  const result = rebaseLinks(
    {
      direction,
      path,
      page: page ?? null,
      notFound,
      content: getLabContent()
    },
    labPath(direction.slug).slice(0, -1)
  );

  return notFound && path !== NOT_FOUND_PATH
    ? data(result, { status: 404 })
    : result;
}

export const meta = ({ loaderData }: Route.MetaArgs) => {
  const pageTitle = loaderData?.notFound
    ? "Not found"
    : (loaderData?.page?.meta.title.split(" | ")[0] ?? "Home");

  return [
    {
      title: `${pageTitle} · ${loaderData?.direction.name} · Design Lab | ${metadata.title}`
    },
    { name: "robots", content: "noindex" }
  ];
};

export default function LabDirection({ loaderData }: Route.ComponentProps) {
  const { direction, path, page, notFound, content } = loaderData;
  const Direction = directionComponents[direction.slug];

  return (
    <>
      <Direction
        key={`${direction.slug}${path}`}
        base={labPath(direction.slug).slice(0, -1)}
        path={path}
        page={page}
        notFound={notFound}
        content={content}
      />
      <LabBar current={direction.slug} path={path} />
    </>
  );
}
