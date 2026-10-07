import { Fragment } from "react";

import type { IntroSection } from "../../lib/types";
import { Entry } from "../Entry";
import { Label } from "../Label";
import { LazyImage } from "../Lazy";

const maxWidth = (value?: string) => (value ? { maxWidth: value } : undefined);

const PHOTOS_OF_ME = [
  {
    src: "https://res.cloudinary.com/keenan-payne/image/upload/f_auto,q_auto,w_800/v1666204078/people/me/jun-27-2021_o8sd0l.jpg",
    alt: "Me in grayscale"
  },
  {
    src: "https://res.cloudinary.com/keenan-payne/image/upload/f_auto,q_auto,w_800/v1666204077/people/me/dec-26-2021_iuhh3w.jpg",
    alt: "Me being cold"
  },
  {
    src: "https://res.cloudinary.com/keenan-payne/image/upload/f_auto,q_auto,w_800/v1666204078/people/me/jul-5-2020_lwglyk.jpg",
    alt: "Hanging out with my high school buddies"
  }
];

export function Intro({ section }: { section: IntroSection }) {
  const { right } = section;

  return (
    <section className="intro _container _page-spacing-top">
      <header className={right ? "intro-left" : "intro-left -full-width"}>
        {section.heading ? (
          <h2
            className="intro-heading _text-large"
            style={maxWidth(section.headerMaxWidth)}
            dangerouslySetInnerHTML={{ __html: section.heading }}
          />
        ) : (
          <h2
            className="intro-heading _text-large"
            style={maxWidth(section.headerMaxWidth)}
          >
            {section.title}
          </h2>
        )}

        {section.subheading && (
          <p
            className="intro-subheading _type-my-voice"
            style={maxWidth(section.subheadingMaxWidth)}
            dangerouslySetInnerHTML={{ __html: section.subheading }}
          />
        )}

        {section.body && (
          <div
            className="intro-body"
            style={maxWidth(section.bodyMaxWidth)}
            dangerouslySetInnerHTML={{ __html: section.body }}
          />
        )}

        {section.leftPhotos && (
          <div className="intro-photos">
            {section.leftPhotos.map((photo) => (
              // Photos are inline, so keep the whitespace between them
              <Fragment key={photo.src}>
                {" "}
                {photo.lazy ? (
                  <LazyImage
                    className="intro-photo"
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                  />
                ) : (
                  <img
                    className="intro-photo"
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                  />
                )}
              </Fragment>
            ))}
          </div>
        )}
      </header>

      {right && (
        <div className="intro-right collections">
          <Label
            text={right.heading}
            className="collections-label"
            readMore={right.readMore}
          />

          {right.items && (
            <div className="collections-items -homepage-services">
              {right.items.from === "services" &&
                right.items.entries.map((entry, index) => (
                  <Entry key={index} entry={entry} />
                ))}

              {right.items.from === "photosOfMe" && (
                <div className="about-photos">
                  {PHOTOS_OF_ME.map((photo) => (
                    <LazyImage
                      key={photo.src}
                      className="about-photo"
                      src={photo.src}
                      alt={photo.alt}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
