import { useTo } from "../../../site";
import { Arrow, Band, Button, Eyebrow, Rays } from "../parts";

export function NotFound() {
  const to = useTo();

  return (
    <Band label="Page not found">
      <Rays className="gl-lost">
        <div>
          <span className="gl-lost__code" aria-hidden="true">
            404
          </span>
          <Eyebrow>Error 404</Eyebrow>
          <h1 className="gl-title">Page not found</h1>
          <p>This page may have moved, or never existed.</p>
          <div className="gl-actions">
            <Button href={to("/")}>
              Back home <Arrow />
            </Button>
            <Button variant="ghost" href={to("/archive/")}>
              Writing
            </Button>
            <Button variant="ghost" href={to("/portfolio/")}>
              Work
            </Button>
          </div>
        </div>
      </Rays>
    </Band>
  );
}
