import type { PortfolioGridSection } from "../../lib/types";
import { Label } from "../Label";
import { LazyImageTile, LazyVideo } from "../Lazy";

const ENLARGE_ICON =
  "M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM184 296c0 13.3 10.7 24 24 24s24-10.7 24-24V232h64c13.3 0 24-10.7 24-24s-10.7-24-24-24H232V120c0-13.3-10.7-24-24-24s-24 10.7-24 24v64H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h64v64z";

export function PortfolioGrid({ section }: { section: PortfolioGridSection }) {
  const { contained, enlarge, items } = section;
  if (!items) return null;

  const className = [
    "portfolioGrid",
    section.modifier,
    contained && "-contained"
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      {(section.headline || section.description) && (
        <header className="portfolioGrid-header">
          <Label text={section.eyebrow} />

          <div className="portfolioGrid-header-contents">
            {section.headline && (
              <h2 className="portfolioGrid-headline">{section.headline}</h2>
            )}

            {section.description && (
              <p
                className="_text-h5"
                dangerouslySetInnerHTML={{ __html: section.description }}
              />
            )}
          </div>
        </header>
      )}

      <div className="portfolioGrid-items">
        {items.map((item, index) => (
          <div
            key={index}
            className={[
              "portfolioGrid-item",
              item.video && "-video",
              item.image && "-image"
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {item.video && (
              <LazyVideo src={item.video} autoplay={item.autoplay} />
            )}

            {item.image &&
              (contained ? (
                <LazyImageTile
                  href={item.imageRaw}
                  title={`Enlarge image for ${item.title ?? ""}`}
                  image={item.image}
                  eager={item.preventLazy}
                />
              ) : (
                <img src={item.image} alt={item.title ?? ""} loading="lazy" />
              ))}

            {item.title && (
              <h3
                className={`portfolioGrid-title ${contained ? "_text-h6" : "_text-h5"}`}
              >
                {item.link ? (
                  <a
                    className={
                      contained
                        ? "portfolioGrid-link -no-invert"
                        : "portfolioGrid-link"
                    }
                    href={item.link}
                    target="_blank"
                    rel="noopener"
                  >
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}

                {enlarge && (
                  <>
                    {" "}
                    <a
                      title={`Enlarge image for ${item.title}`}
                      href={item.enlargeHref}
                      className="portfolioGrid-enlarge"
                      target="_blank"
                      rel="noopener"
                    >
                      <span className="_hidden">
                        {`Enlarge image for ${item.title}`}
                      </span>{" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path d={ENLARGE_ICON} />
                      </svg>
                    </a>
                  </>
                )}
              </h3>
            )}

            {item.caption && (
              <p
                className="portfolioGrid-caption _text-small"
                dangerouslySetInnerHTML={{ __html: item.caption }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
