import type { ReactNode } from "react";

import { HtmlContent } from "../../../../components/HtmlContent";
import {
  galleryColumns,
  Html,
  ledeOf,
  titleOf,
  useTo,
  type TemplateProps
} from "../../../site";
import { emblemFor } from "../emblems";
import {
  Chip,
  Discussion,
  Facts,
  KANA,
  PageHeader,
  Quote,
  Section,
  toneAt,
  toneFor
} from "../parts";

export function CaseStudy({ page }: TemplateProps<"caseStudy">) {
  const to = useTo();

  const chips = (items: string[]) => (
    <ul className="neon-chips">
      {items.map((item) => (
        <li key={item}>
          <Chip tone={toneFor(item)}>{item}</Chip>
        </li>
      ))}
    </ul>
  );

  const specs: [string, ReactNode][] = [];
  if (page.industry) specs.push(["Industry", page.industry]);
  if (page.size) specs.push(["Company size", page.size]);
  if (page.year) specs.push(["Years", page.year]);
  if (page.services?.length) specs.push(["Services", chips(page.services)]);
  if (page.technologies?.length) {
    specs.push(["Technologies", chips(page.technologies)]);
  }
  if (page.people?.length) {
    specs.push([
      "Collaborators",
      <ul className="neon-facts__list">
        {page.people.map((person) => (
          <li key={person.name}>
            {person.url ? <a href={person.url}>{person.name}</a> : person.name}
            {person.position && (
              <span className="neon-meta">{person.position}</span>
            )}
          </li>
        ))}
      </ul>
    ]);
  }
  if (page.awards?.length) {
    specs.push([
      "Awards",
      <ul className="neon-facts__list">
        {page.awards.map((award) => (
          <li key={`${award.name}${award.year}${award.category}`}>
            <a href={award.link}>
              {award.name} {award.status}, {award.year}
            </a>
            <span className="neon-meta">{`${award.category} · ${award.details}`}</span>
          </li>
        ))}
      </ul>
    ]);
  }
  if (page.siteUrl) {
    specs.push([
      "Visit",
      <a href={page.siteUrl}>{page.siteTitle ?? page.siteUrl} ↗</a>
    ]);
  }

  const pillars = [
    ["The client", KANA.client, page.pillars?.client],
    ["The challenge", KANA.challenge, page.pillars?.challenge],
    ["The solution", KANA.solution, page.pillars?.solution]
  ].filter((pillar): pillar is [string, string, string] => !!pillar[2]);

  return (
    <article>
      <PageHeader
        eyebrow={
          <>
            <a href={to("/portfolio/")}>Work</a> / Case study
            <span aria-hidden="true"> · {KANA.caseStudy}</span>
          </>
        }
        title={titleOf(page)}
        lede={ledeOf(page)}
        kana={KANA.caseStudy}
        emblem={emblemFor(page.url)}
      />

      {page.cover && (
        <div className="neon-cover">
          <img src={page.cover} alt="" />
        </div>
      )}

      <Section title="Overview" kana={KANA.glance} tone="cyan">
        {page.overview && (
          <Html as="p" className="neon-lede" html={page.overview} />
        )}
        <Facts rows={specs} />
      </Section>

      {pillars.length > 0 && (
        <div className="neon-pillars">
          {pillars.map(([title, kana, text], index) => (
            <section
              key={title}
              className={`neon-pillar neon-tone--${toneAt(index)}`}
            >
              <h2 className="neon-pillar__title">
                <span className="neon-pillar__kana" aria-hidden="true">
                  {kana}
                </span>
                {title}
              </h2>
              <Html as="p" html={text} />
            </section>
          ))}
        </div>
      )}

      {page.sections.map((section, index) =>
        section.type === "portfolioGrid" && section.items?.length ? (
          <Section
            key={index}
            title={section.headline ?? section.eyebrow ?? "Gallery"}
            kana={KANA.gallery}
            tone={toneAt(index + 1)}
          >
            {section.description && <Html as="p" html={section.description} />}
            <div
              className="neon-gallery"
              style={{
                ["--neon-columns" as string]: galleryColumns(section.modifier)
              }}
            >
              {section.items.map((item, itemIndex) => (
                <figure key={itemIndex} className="neon-gallery__item">
                  <div className="neon-gallery__screen">
                    {item.video ? (
                      <video
                        src={item.video}
                        muted
                        controls
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
                            loading="lazy"
                          />
                          <span className="neon-gallery__larger">
                            {item.title
                              ? " (view larger)"
                              : "View larger image"}
                          </span>
                        </a>
                      ) : (
                        <img
                          src={item.image}
                          alt={item.title ?? ""}
                          loading="lazy"
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
                          <strong>{item.title}</strong>
                        ))}
                      {item.caption && <Html as="span" html={item.caption} />}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </Section>
        ) : section.type === "testimonial" && section.testimonial ? (
          <div key={index} className="neon-pull">
            <Quote testimonial={section.testimonial} tone="pink" />
          </div>
        ) : null
      )}

      {page.content && (
        <HtmlContent className="neon-prose neon-article" html={page.content} />
      )}

      {page.comments && <Discussion url={page.meta.canonical} />}
    </article>
  );
}
