import { MoreLink, useTo } from "../parts";

export function NotFound() {
  const to = useTo();

  return (
    <section className="mg-notFound">
      <p className="mg-notFound__code" aria-hidden="true">
        404
      </p>
      <div>
        <h1 className="mg-pageHeader__title">Page not found</h1>
        <p className="mg-copy">
          This page may have moved, or never existed. Try the archive, or head
          back to the front page.
        </p>
        <div className="mg-notFound__links">
          <MoreLink href={to("/")}>Front page</MoreLink>
          <MoreLink href={to("/archive/")}>Writing archive</MoreLink>
          <MoreLink href={to("/portfolio/")}>Case studies</MoreLink>
        </div>
      </div>
    </section>
  );
}
