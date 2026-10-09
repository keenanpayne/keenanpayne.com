import type { ReactNode } from "react";

import { HtmlContent } from "../../../../components/HtmlContent";
import { Html, useTo, type TemplateProps } from "../../../site";
import { Facts, PageHeader, PostNav, Section } from "../parts";

export function CaseStudy({ page }: TemplateProps<"caseStudy">) {
  const to = useTo();

  const specs: [string, ReactNode][] = [];
  if (page.industry) specs.push(["Industry", page.industry]);
  if (page.size) specs.push(["Company size", page.size]);
  if (page.year) specs.push(["Years", page.year]);
  if (page.services?.length) {
    specs.push(["Services", page.services.join(", ")]);
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
            {person.position && `, ${person.position}`}
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
            {` · ${award.category} · ${award.details}`}
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

  return (
    <article>
      <PageHeader
        eyebrow={
          <>
            <a href={to("/portfolio/")}>Work</a> / Case study
          </>
        }
        title={page.client ?? page.meta.title}
        lede={page.lede}
      />

      {page.cover && (
        <img className="wireframe-cover" src={page.cover} alt="" />
      )}

      <Section title="Overview">
        {page.overview && <Html as="p" html={page.overview} />}
        <Facts rows={specs} />
      </Section>

      {page.pillars?.challenge && (
        <Section title="The challenge">
          <Html as="p" html={page.pillars.challenge} />
        </Section>
      )}
      {page.pillars?.solution && (
        <Section title="The solution">
          <Html as="p" html={page.pillars.solution} />
        </Section>
      )}

      {page.sections.map((section, index) =>
        section.type === "portfolioGrid" && section.items?.length ? (
          <Section
            key={index}
            title={section.headline ?? section.eyebrow ?? "Gallery"}
          >
            {section.description && <Html as="p" html={section.description} />}
            <div className="wireframe-grid">
              {section.items.map((item, itemIndex) => (
                <figure key={itemIndex}>
                  {item.video ? (
                    <video src={item.video} muted loop playsInline autoPlay />
                  ) : (
                    item.image && (
                      <img
                        src={item.image}
                        alt={item.title ?? ""}
                        loading="lazy"
                      />
                    )
                  )}
                  {(item.title || item.caption) && (
                    <figcaption>
                      {item.title &&
                        (item.link ? (
                          <a href={item.link}>{item.title}</a>
                        ) : (
                          item.title
                        ))}
                      {item.caption && <Html as="span" html={item.caption} />}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </Section>
        ) : null
      )}

      {page.content && (
        <HtmlContent className="wireframe-prose" html={page.content} />
      )}

      <PostNav nav={page.postNav} />
    </article>
  );
}
