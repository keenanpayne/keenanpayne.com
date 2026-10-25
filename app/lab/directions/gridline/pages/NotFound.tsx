import { useTo } from "../../../site";
import { lettering } from "../blueprint";
import { Arrow, Band, Blueprint, Button, Eyebrow } from "../parts";

/** The 404, written in the grid's squares above the copy */
const LOST = lettering("404", "violet");

export function NotFound() {
  const to = useTo();

  return (
    <Band label="Page not found">
      <Blueprint className="gl-lost" drawing={LOST}>
        <div className="gl-lost__room" />
        <div className="gl-lost__copy">
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
      </Blueprint>
    </Band>
  );
}
