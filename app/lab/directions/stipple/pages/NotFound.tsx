import { useTo } from "../../../site";
import { Button, Terrain } from "../parts";

export function NotFound() {
  const to = useTo();

  return (
    <section className="st-lost" aria-labelledby="st-lost-title">
      <Terrain
        className="st-lost__terrain"
        seed="404"
        shape="isle"
        scale={240}
      />
      <div className="st-lost__copy">
        <p className="st-crumbs">Error 404</p>
        <h1 id="st-lost-title" className="st-lost__title">
          Uncharted ground
        </h1>
        <p className="st-lede">This page may have moved, or never existed.</p>
        <p className="st-actions">
          <Button href={to("/")}>Home</Button>
          <Button href={to("/archive/")} ghost>
            Writing
          </Button>
          <Button href={to("/portfolio/")} ghost>
            Work
          </Button>
        </p>
      </div>
    </section>
  );
}
