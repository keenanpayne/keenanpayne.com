import { data, useParams, type ShouldRevalidateFunction } from "react-router";

import { getConformanceReport } from "../lab/conformance/report.server";
import { LabBar } from "../lab/LabBar";
import labStyles from "../lab/lab.css?url";
import { directions, getDirection } from "../lab/registry";
import { resolveSitePage } from "../lab/site/page.server";
import { getProseSpecimen } from "../lab/styleguide/prose.server";
import {
  CONFORMANCE_PATH,
  getSection,
  resolveMode,
  STYLEGUIDE_PATH
} from "../lab/styleguide/sections";
import { StyleGuide } from "../lab/styleguide/StyleGuide";
import guideStyles from "../lab/styleguide/styleguide.css?url";
import { getDirectionTokens } from "../lab/styleguide/tokens.server";
import { metadata } from "../lib/site";
import type { Route } from "./+types/lab.styleguide";

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: labStyles },
  { rel: "stylesheet", href: guideStyles }
];

const SLUGS = directions.map((direction) => direction.slug);

/** What the path after `/lab/styleguide/` asks to see */
const modeOf = (params: { "*"?: string }) =>
  resolveMode(params["*"] ?? "", SLUGS);

// The Shell is shown around About, so the navigation marks a current page
const SHELL_PATH = "/about/";

export async function loader({ params }: Route.LoaderArgs) {
  const mode = modeOf(params);
  if (!mode) throw data(null, { status: 404 });

  const { path, view, navigation, content } = resolveSitePage(SHELL_PATH);
  return {
    content,
    prose: getProseSpecimen(),
    tokens: await getDirectionTokens(),
    shell: { path, view, navigation },
    // Rendering every direction's pages takes a moment, so only this page
    // runs the checks
    conformance:
      mode.kind === "conformance" ? await getConformanceReport() : undefined
  };
}

// Everything else here is the same on every style guide page, so moving
// between them only changes what's shown. The checks run afresh on the way
// into the Conformance page.
export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl
}) =>
  nextUrl.pathname === CONFORMANCE_PATH &&
  currentUrl.pathname !== CONFORMANCE_PATH;

export const meta = ({ params }: Route.MetaArgs) => {
  const mode = modeOf(params);
  const title =
    mode?.kind === "direction"
      ? [
          getDirection(mode.slug)?.name,
          mode.only && getSection(mode.only)?.label
        ]
          .filter(Boolean)
          .join(" · ")
      : mode?.kind === "conformance"
        ? "Conformance"
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
  const mode = modeOf(useParams());

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
