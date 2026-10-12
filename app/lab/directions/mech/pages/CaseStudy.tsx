import { HtmlContent } from "../../../../components/HtmlContent";
import type {
  LabContent,
  PortfolioGridSection,
  PortfolioPageModel,
  SectionModel,
  TestimonialModel
} from "../../../../lib/types";
import { galleryColumns, Html, pad, samePath, useTo } from "../../../site";
import {
  Alert,
  MoreLink,
  Panel,
  Readout,
  Section,
  Transmission,
  unitCode
} from "../parts";

function Gallery({
  section,
  index
}: {
  section: PortfolioGridSection;
  index: number;
}) {
  if (!section.items?.length) return null;
  const columns = galleryColumns(section.modifier);
  const hasHeader = section.headline || section.description;

  const grid = (
    <div className={`mc-gallery mc-gallery--${columns}`}>
      {section.items.map((item, itemIndex) => (
        <figure className="mc-gallery__item" key={itemIndex}>
          {item.video ? (
            // Not inside a link, so clicks reach the video's controls
            <div className="mc-gallery__media">
              <video
                src={item.video}
                muted
                controls
                loop={item.autoplay}
                playsInline={item.autoplay}
                autoPlay={item.autoplay}
              />
            </div>
          ) : (
            <a
              className="mc-gallery__media"
              href={item.imageRaw ?? item.link ?? item.image}
              tabIndex={-1}
            >
              {item.image && (
                <img src={item.image} alt={item.title ?? ""} loading="lazy" />
              )}
            </a>
          )}
          {(item.title || item.caption) && (
            <figcaption>
              {item.title &&
                (item.link ? (
                  <MoreLink href={item.link}>{item.title}</MoreLink>
                ) : (
                  <span className="mc-gallery__title">{item.title}</span>
                ))}
              {item.caption && <Html as="span" html={item.caption} />}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );

  if (!hasHeader) return <div className="mc-gallery__continued">{grid}</div>;

  return (
    <Section
      label={section.eyebrow ?? "Visual feed"}
      code={`Feed ${pad(index + 1)}`}
      as="p"
    >
      <div className="mc-gallery__header">
        {section.headline && (
          <h2 className="mc-gallery__headline">{section.headline}</h2>
        )}
        {section.description && (
          <Html as="p" className="mc-body" html={section.description} />
        )}
      </div>
      {grid}
    </Section>
  );
}

type Block =
  | { kind: "gallery"; section: PortfolioGridSection; index: number }
  | { kind: "quote"; testimonial: TestimonialModel; index: number };

/** The galleries and quotes among a page's sections, numbered by kind */
function blocksOf(sections: SectionModel[]): Block[] {
  let galleries = 0;
  let quotes = 0;
  return sections.flatMap((section): Block | [] => {
    if (section.type === "portfolioGrid") {
      return { kind: "gallery", section, index: galleries++ };
    }
    if (section.type === "testimonial" && section.testimonial) {
      return {
        kind: "quote",
        testimonial: section.testimonial,
        index: quotes++
      };
    }
    return [];
  });
}

export function CaseStudy({
  page,
  content
}: {
  page: PortfolioPageModel;
  content: LabContent;
}) {
  const to = useTo();
  const code = unitCode(
    content.work.findIndex((item) => samePath(item.url, page.url))
  );
  const blocks = blocksOf(page.sections);

  return (
    <article className="mc-case">
      <header className="mc-pageHeader">
        <div className="mc-pageHeader__main">
          <p className="mc-pageHeader__eyebrow">
            <span className="mc-pageHeader__episode">{code}</span>
            <a href={to("/portfolio/")}>Work</a>
            <span aria-hidden="true">/</span>
            Case study
          </p>
          <div className="mc-titlecard">
            {page.client && (
              <h1 className="mc-titlecard__title">{page.client}</h1>
            )}
            <p className="mc-titlecard__jp" lang="ja">
              機体記録
            </p>
          </div>
          {page.lede && <p className="mc-pageHeader__lede">{page.lede}</p>}
        </div>
      </header>

      <dl className="mc-readouts mc-readouts--strip">
        {page.industry && <Readout label="Sector" value={page.industry} />}
        {page.size && <Readout label="Company size" value={page.size} />}
        {page.year && <Readout label="Active" value={page.year} tone="green" />}
        {page.services?.length ? (
          <Readout label="Services" value={page.services.join(", ")} />
        ) : null}
      </dl>

      {page.cover && (
        <Panel
          as="figure"
          className="mc-case__cover"
          label="Visual feed · Primary"
          code={code}
        >
          <img src={page.cover} alt="" />
        </Panel>
      )}

      <section className="mc-section mc-split">
        <div>
          <p className="mc-kicker">Overview</p>
          {page.overview && (
            <Html as="p" className="mc-case__overview" html={page.overview} />
          )}
        </div>

        <Panel as="aside" label="Unit specifications" code={code}>
          <dl className="mc-spec">
            {page.technologies && (
              <div>
                <dt>Technologies</dt>
                <dd>
                  <ul className="mc-chips">
                    {page.technologies.map((technology) => (
                      <li key={technology}>{technology}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {page.people && (
              <div>
                <dt>Crew</dt>
                <dd>
                  <ul className="mc-people">
                    {page.people.map((person) => (
                      <li key={person.name}>
                        {person.url ? (
                          <a href={person.url}>{person.name}</a>
                        ) : (
                          person.name
                        )}
                        {person.position && <small>{person.position}</small>}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {page.awards && (
              <div>
                <dt>Commendations</dt>
                <dd>
                  <ul className="mc-people">
                    {page.awards.map((award) => (
                      <li key={`${award.name}${award.year}${award.category}`}>
                        <a href={award.link}>
                          {award.name} {award.status}, {award.year}
                        </a>
                        <small>
                          {award.category} · {award.details}
                        </small>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {page.siteUrl && (
              <div>
                <dt>Uplink</dt>
                <dd>
                  <MoreLink href={page.siteUrl}>
                    {page.siteTitle ?? page.siteUrl}
                  </MoreLink>
                </dd>
              </div>
            )}
          </dl>
        </Panel>
      </section>

      {page.pillars && (page.pillars.challenge || page.pillars.solution) && (
        <section className="mc-section">
          <div className="mc-grid mc-grid--2">
            {page.pillars.challenge && (
              <Panel label="Objective" code="Challenge" className="mc-pillar">
                <Html
                  as="p"
                  className="mc-pillar__text"
                  html={page.pillars.challenge}
                />
              </Panel>
            )}
            {page.pillars.solution && (
              <Panel
                label="Resolution"
                code="Solution"
                className="mc-pillar mc-pillar--green"
              >
                <Html
                  as="p"
                  className="mc-pillar__text"
                  html={page.pillars.solution}
                />
              </Panel>
            )}
          </div>
        </section>
      )}

      {blocks.map((block, index) =>
        block.kind === "gallery" ? (
          <Gallery key={index} section={block.section} index={block.index} />
        ) : (
          <div key={index} className="mc-gallery__continued">
            <Transmission testimonial={block.testimonial} index={block.index} />
          </div>
        )
      )}

      {page.content && (
        <section className="mc-section">
          <HtmlContent
            className="mc-prose mc-prose--solo"
            html={page.content}
          />
        </section>
      )}

      <Alert />
    </article>
  );
}
