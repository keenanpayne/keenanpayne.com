import type { ReactNode } from "react";

import { HtmlContent } from "../../../../components/HtmlContent";
import type {
  PortfolioGridItem,
  TestimonialModel
} from "../../../../lib/types";
import { Html, useTo, type TemplateProps } from "../../../site";
import {
  Contents,
  Facts,
  Layout,
  PageHeader,
  PostNav,
  Quote,
  Section,
  Stipple,
  type Chapter
} from "../parts";

type Block =
  | {
      kind: "gallery";
      id: string;
      title?: string;
      description?: string;
      items: PortfolioGridItem[];
    }
  | { kind: "quote"; id: string; testimonial: TestimonialModel };

export function CaseStudy({ page }: TemplateProps<"caseStudy">) {
  const to = useTo();
  const title = page.client ?? page.meta.title;

  // Galleries and client quotes, in page order. Galleries with a title open a
  // section; untitled ones and quotes carry on the last.
  const blocks = page.sections.flatMap<Block>((section, index) => {
    if (section.type === "portfolioGrid" && section.items?.length) {
      return [
        {
          kind: "gallery",
          id: `gallery-${index + 1}`,
          title: section.headline ?? section.eyebrow,
          description: section.description,
          items: section.items
        }
      ];
    }
    if (section.type === "testimonial" && section.testimonial) {
      return [
        {
          kind: "quote",
          id: `quote-${index + 1}`,
          testimonial: section.testimonial
        }
      ];
    }
    return [];
  });

  const details: [string, ReactNode][] = [];
  if (page.industry) details.push(["Industry", page.industry]);
  if (page.size) details.push(["Company size", page.size]);
  if (page.year) details.push(["Years", page.year]);
  if (page.services?.length) {
    details.push(["Services", page.services.join(", ")]);
  }
  if (page.technologies?.length) {
    details.push(["Technologies", page.technologies.join(", ")]);
  }
  if (page.people?.length) {
    details.push([
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
    details.push([
      "Awards",
      <ul>
        {page.awards.map((award) => (
          <li key={`${award.name}${award.year}${award.category}`}>
            <a
              href={award.link}
            >{`${award.name} ${award.status}, ${award.year}`}</a>
            {` · ${award.category} · ${award.details}`}
          </li>
        ))}
      </ul>
    ]);
  }
  if (page.siteUrl) {
    details.push([
      "Visit",
      <a href={page.siteUrl}>{page.siteTitle ?? page.siteUrl}</a>
    ]);
  }

  const chapters: Chapter[] = [{ id: "overview", label: "Overview" }];
  if (page.pillars?.challenge) {
    chapters.push({ id: "challenge", label: "The challenge" });
  }
  if (page.pillars?.solution) {
    chapters.push({ id: "solution", label: "The solution" });
  }
  for (const block of blocks) {
    if (block.kind === "gallery" && block.title) {
      chapters.push({ id: block.id, label: block.title });
    }
  }
  if (page.content) chapters.push({ id: "notes", label: "Notes" });
  if (details.length) chapters.push({ id: "details", label: "Details" });

  return (
    <Layout rail={<Contents chapters={chapters} />}>
      <article className="st-caseStudy">
        <PageHeader
          crumbs={
            <>
              <a href={to("/portfolio/")}>Work</a>
              <span aria-hidden="true">/</span>
              <span>Case study</span>
            </>
          }
          title={title}
          lede={page.lede}
        >
          <p className="st-pageMeta">
            <span>{page.industry}</span>
            <span>{page.year}</span>
          </p>
        </PageHeader>

        {page.cover && (
          <Stipple className="st-cover" src={page.cover} alt="" eager toggle />
        )}

        <Section id="overview" title="Overview">
          {page.overview && <Html className="st-copy" html={page.overview} />}
          {page.siteUrl && (
            <p className="st-actions">
              <a className="st-button st-button--small" href={page.siteUrl}>
                {`Visit ${page.siteTitle ?? "the site"}`}
              </a>
            </p>
          )}
        </Section>

        {page.pillars?.challenge && (
          <Section id="challenge" title="The challenge">
            <Html className="st-copy" html={page.pillars.challenge} />
          </Section>
        )}
        {page.pillars?.solution && (
          <Section id="solution" title="The solution">
            <Html className="st-copy" html={page.pillars.solution} />
          </Section>
        )}

        {blocks.map((block) => {
          if (block.kind === "quote") {
            return (
              <div key={block.id} className="st-galleryMore">
                <Quote testimonial={block.testimonial} />
              </div>
            );
          }

          const { id, title, description, items } = block;
          const gallery = (
            <>
              {description && <Html className="st-copy" html={description} />}
              <div className="st-gallery">
                {items.map((item, index) => (
                  <figure key={index}>
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
                      item.image && (
                        <Stipple
                          src={item.image}
                          alt={item.title ?? ""}
                          toggle
                        />
                      )
                    )}
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
                ))}
              </div>
            </>
          );

          return title ? (
            <Section key={id} id={id} title={title}>
              {gallery}
            </Section>
          ) : (
            <div key={id} className="st-galleryMore">
              {gallery}
            </div>
          );
        })}

        {page.content && (
          <Section id="notes" title="Notes">
            <HtmlContent className="st-prose" html={page.content} />
          </Section>
        )}

        {details.length > 0 && (
          <Section id="details" title="Details">
            <Facts rows={details} />
          </Section>
        )}

        <PostNav nav={page.postNav} />
      </article>
    </Layout>
  );
}
