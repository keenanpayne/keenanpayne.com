import { data, useParams } from "react-router";

import { LabBar } from "../lab/LabBar";
import labStyles from "../lab/lab.css?url";
import { directions, getDirection } from "../lab/registry";
import { navigationFor, resolveView } from "../lab/site";
import { getProseSpecimen } from "../lab/styleguide/prose.server";
import {
  getSection,
  resolveMode,
  STYLEGUIDE_PATH
} from "../lab/styleguide/sections";
import { StyleGuide } from "../lab/styleguide/StyleGuide";
import guideStyles from "../lab/styleguide/styleguide.css?url";
import { getDirectionTokens } from "../lab/styleguide/tokens.server";
import { getLabContent, getPage } from "../lib/content/content.server";
import { metadata } from "../lib/site";
import type { Route } from "./+types/lab.styleguide";

export const handle = { bare: true };

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: labStyles },
  { rel: "stylesheet", href: guideStyles }
];

const SLUGS = directions.map((direction) => direction.slug);

// The Shell is shown around About, so the navigation marks a current page
const SHELL_PATH = "/about/";

export function loader({ params }: Route.LoaderArgs) {
  if (!resolveMode(params["*"] ?? "", SLUGS)) throw data(null, { status: 404 });

  const view = resolveView(SHELL_PATH, getPage(SHELL_PATH));
  return {
    content: getLabContent(),
    prose: getProseSpecimen(),
    tokens: getDirectionTokens(),
    shell: {
      path: SHELL_PATH,
      view,
      navigation: navigationFor(view, SHELL_PATH)
    }
  };
}

// Everything here is the same on every style guide page, so moving between
// them only changes what's shown
export const shouldRevalidate = () => false;

export const meta = ({ params }: Route.MetaArgs) => {
  const mode = resolveMode(params["*"] ?? "", SLUGS);
  const title =
    mode?.kind === "direction"
      ? [
          getDirection(mode.slug)?.name,
          mode.only && getSection(mode.only)?.label
        ]
          .filter(Boolean)
          .join(" · ")
      : mode && mode.section !== "overview"
        ? getSection(mode.section)?.label
        : undefined;

  return [
    {
      title: `${title ? `${title} · ` : ""}Style guide · Design Lab | ${metadata.title}`
    },
    { name: "robots", content: "noindex" }
  ];
};

export default function LabStyleGuide({ loaderData }: Route.ComponentProps) {
  const params = useParams();
  const mode = resolveMode(params["*"] ?? "", SLUGS);

  return (
    <>
      {mode ? (
        <StyleGuide mode={mode} data={loaderData} />
      ) : (
        <main className="lab">
          <h1 className="lab__title">Not in the style guide</h1>
          <p className="lab__intro">
            <a href={STYLEGUIDE_PATH}>Back to the style guide</a>
          </p>
        </main>
      )}
      <LabBar guide />
    </>
  );
}
