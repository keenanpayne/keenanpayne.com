import type { ReactNode } from "react";

import { HtmlContent } from "../../../../components/HtmlContent";
import {
  cx,
  galleryColumns,
  Html,
  ledeOf,
  titleOf,
  useTo,
  type TemplateProps
} from "../../../site";
import {
  Band,
  Cells,
  Discussion,
  Facts,
  PageHeader,
  Quote,
  Rays,
  SectionHead,
  Trail,
  Window
} from "../parts";

export function CaseStudy({ page }: TemplateProps<"caseStudy">) {
  const to = useTo();
  const name = page.client ?? page.meta.title;

  const glance: [string, ReactNode][] = [];
  if (page.industry) glance.push(["Industry", page.industry]);
  if (page.year) glance.push(["Years", page.year]);
  if (page.size) glance.push(["Company size", page.size]);

  const specs: [string, ReactNode][] = [];
  if (page.services?.length) {
    specs.push([
      "Services",
      <ul>
        {page.services.map((service) => (
          <li key={service}>{service}</li>
        ))}
      </ul>
    ]);
  }
  if (page.technologies?.length) {
    specs.push(["Technologies", page.technologies.join(", ")]);
  }
  if (page.people?.length) {
    specs.push([
      "Collaborators",
      <ul>
        {page.people.map((person) => (
          <li key={person.name}>
            {person.url ? <a href={person.url}>{person.name}</a> : person.name}
            {person.position && (
              <span className="gl-meta">{` · ${person.position}`}</span>
            )}
          </li>
        ))}
      </ul>
    ]);
  }
  if (page.awards?.length) {
    specs.push([
      "Awards",
      <ul>
        {page.awards.map((award) => (
          <li key={`${award.name}${award.year}${award.category}`}>
            <a href={award.link}>
              {award.name} {award.status}, {award.year}
            </a>
            <span className="gl-meta">
              {` · ${award.category} · ${award.details}`}
            </span>
          </li>
        ))}
      </ul>
    ]);
  }
  if (page.siteUrl) {
    specs.push([
      "Visit",
      <a href={page.siteUrl}>{page.siteTitle ?? page.siteUrl}</a>
    ]);
  }

  const address = page.siteUrl
    ? page.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : name;

  return (
    <article>
      <PageHeader
        eyebrow={
          <Trail
            links={[{ text: "Work", url: to("/portfolio/") }]}
            current="Case study"
          />
        }
        title={titleOf(page)}
        lede={ledeOf(page)}
        aside={glance.length > 0 && <Facts rows={glance} />}
      />

      {page.cover && (
        <Band label="Cover">
          <Rays tint={page.color} className="gl-case-cover">
            <Window
              address={
                page.siteUrl ? <a href={page.siteUrl}>{address}</a> : address
              }
            >
              <img className="gl-window__media" src={page.cover} alt="" />
            </Window>
          </Rays>
        </Band>
      )}

      {(page.overview || specs.length > 0) && (
        <Band>
          <div className="gl-split">
            <div className="gl-pad gl-pillar">
              <p className="gl-label">Overview</p>
              {page.overview && <Html as="p" html={page.overview} />}
            </div>
            {specs.length > 0 && (
              <div className="gl-pad">
                <p className="gl-label">Project</p>
                <Facts rows={specs} />
              </div>
            )}
          </div>
        </Band>
      )}

      {(page.pillars?.client ||
        page.pillars?.challenge ||
        page.pillars?.solution) && (
        <Band>
          <div
            className={cx(
              "gl-split",
              page.pillars.client &&
                page.pillars.challenge &&
                page.pillars.solution
                ? "gl-split--thirds"
                : "gl-split--half"
            )}
          >
            {page.pillars.client && (
              <div className="gl-pad gl-pillar">
                <p className="gl-label">The client</p>
                <p>{page.pillars.client}</p>
              </div>
            )}
            {page.pillars.challenge && (
              <div className="gl-pad gl-pillar">
                <p className="gl-label">The challenge</p>
                <Html as="p" html={page.pillars.challenge} />
              </div>
            )}
            {page.pillars.solution && (
              <div className="gl-pad gl-pillar">
                <p className="gl-label">The solution</p>
                <Html as="p" html={page.pillars.solution} />
              </div>
            )}
          </div>
        </Band>
      )}

      {page.sections.map((section, index) =>
        section.type === "portfolioGrid" && section.items?.length ? (
          <Band
            key={index}
            label={section.headline ?? section.eyebrow ?? "Gallery"}
          >
            {/* A gallery with no heading continues the one before it */}
            {(section.headline || section.eyebrow) && (
              <SectionHead
                eyebrow={section.eyebrow ?? "Gallery"}
                title={section.headline ?? section.eyebrow}
                description={
                  section.description && (
                    <Html as="span" html={section.description} />
                  )
                }
              />
            )}
            <Cells
              cols={Math.min(galleryColumns(section.modifier), 3) as 1 | 2 | 3}
              className={cx(
                "gl-gallery",
                galleryColumns(section.modifier) === 1 && "gl-gallery--1"
              )}
            >
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="gl-cell">
                  <figure>
                    <div className="gl-gallery__media">
                      {item.video ? (
                        <video
                          src={item.video}
                          muted
                          // Fetched when played, not with the page
                          preload={item.autoplay ? undefined : "none"}
                          controls={!item.autoplay}
                          loop={item.autoplay}
                          playsInline={item.autoplay}
                          autoPlay={item.autoplay}
                        />
                      ) : (
                        item.image &&
                        (section.enlarge ? (
                          <a href={item.enlargeHref}>
                            <img
                              src={item.image}
                              alt={item.title ?? ""}
                              loading={item.preventLazy ? undefined : "lazy"}
                            />
                          </a>
                        ) : (
                          <img
                            src={item.image}
                            alt={item.title ?? ""}
                            loading={item.preventLazy ? undefined : "lazy"}
                          />
                        ))
                      )}
                    </div>
                    {(item.title || item.caption) && (
                      <figcaption>
                        {item.title &&
                          (item.link ? (
                            <a href={item.link}>{item.title}</a>
                          ) : (
                            <span>{item.title}</span>
                          ))}
                        {item.caption && <Html as="span" html={item.caption} />}
                      </figcaption>
                    )}
                  </figure>
                </li>
              ))}
            </Cells>
          </Band>
        ) : section.type === "testimonial" && section.testimonial ? (
          <Band key={index} invert label="Testimonial">
            <div className="gl-pad">
              <Quote testimonial={section.testimonial} large />
            </div>
          </Band>
        ) : null
      )}

      {page.content && (
        <Band label="Story">
          <div className="gl-article">
            <div className="gl-article__rail" />
            <div className="gl-article__body">
              <HtmlContent className="gl-prose" html={page.content} />
            </div>
            <div className="gl-article__margin" />
          </div>
        </Band>
      )}

      {page.comments && <Discussion url={page.meta.canonical} />}
    </article>
  );
}
