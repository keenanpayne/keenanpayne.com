import { Link } from "react-router";

import { LabBar } from "../lab/LabBar";
import labStyles from "../lab/lab.css?url";
import { directions, labPath, SAMPLE_PAGES } from "../lab/registry";
import { metadata } from "../lib/site";
import type { Route } from "./+types/lab";

export const handle = { bare: true };

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: labStyles }
];

export const meta: Route.MetaFunction = () => [
  { title: `Design Lab | ${metadata.title}` },
  { name: "robots", content: "noindex" }
];

export default function LabIndex() {
  return (
    <main className="lab">
      <header className="lab__header">
        <p className="lab__eyebrow">keenanpayne.com / lab</p>
        <h1 className="lab__title">Design Lab</h1>
        <p className="lab__intro">
          A testing ground for new aesthetic directions. Each direction reskins
          the same real content and pages in its own visual language, isolated
          from the production styles.
        </p>
      </header>

      <ol className="lab__list">
        {directions.map((direction, index) => (
          <li key={direction.slug} className="lab__card">
            <span className="lab__number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <Link className="lab__name" to={labPath(direction.slug)}>
              {direction.name}
            </Link>
            <span className="lab__summary">{direction.summary}</span>
            <ul className="lab__pages" aria-label={`${direction.name} pages`}>
              {SAMPLE_PAGES.map((page) => (
                <li key={page.path}>
                  <Link to={labPath(direction.slug, page.path)}>
                    {page.label}
                  </Link>
                </li>
              ))}
            </ul>
            <span className="lab__meta">
              Ref. {direction.reference} · Started {direction.date}
            </span>
          </li>
        ))}
      </ol>

      <p className="lab__footnote">
        Add a direction with <code>npm run lab:new &lt;slug&gt;</code>, which
        starts it as a copy of Wireframe. See <code>app/lab/README.md</code>.
      </p>

      <LabBar />
    </main>
  );
}
