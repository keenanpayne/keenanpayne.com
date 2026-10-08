import type { LabContent } from "../../../../lib/types";
import { BubbleCard, Mascot, Sprite, TitleBar, useTo } from "../parts";
import { DIE, ITEMS, pixelNumber } from "../sprites";

export function NotFound({ content }: { content: LabContent }) {
  const to = useTo();

  return (
    <>
      <TitleBar
        title="Error 404"
        images={content.work.slice(0, 4).map((item) => item.coverSquare)}
      />

      <section className="pt-404">
        <div className="pt-404__stage" aria-hidden="true">
          <Sprite
            art={pixelNumber("404")}
            gap={0.12}
            className="pt-404__digits"
          />
          <p className="pt-404__word">
            Error
            <span>Page not found</span>
          </p>
          <Mascot item="question" className="pt-404__mascot" />
          <Sprite
            art={ITEMS.star}
            scale={4}
            className="pt-404__float pt-404__float--1"
          />
          <Sprite
            art={ITEMS.heart}
            scale={4}
            className="pt-404__float pt-404__float--2"
          />
          <Sprite
            art={ITEMS.question}
            scale={4}
            className="pt-404__float pt-404__float--3"
          />
        </div>

        <BubbleCard label="Page not found" art={DIE} className="pt-404__bubble">
          <p>
            Sorry, the page you requested is either invalid or no longer exists
            on this site. Try finding what you need at the{" "}
            <a href={to("/")}>keenanpayne.com Home Page</a>.
          </p>
          <ul className="pt-404__links">
            <li>
              <a className="pt-tri" href={to("/archive/")}>
                Writing archive
              </a>
            </li>
            <li>
              <a className="pt-tri" href={to("/portfolio/")}>
                Case studies
              </a>
            </li>
            <li>
              <a className="pt-tri" href={to("/contact/")}>
                Contact
              </a>
            </li>
          </ul>
        </BubbleCard>
      </section>
    </>
  );
}
