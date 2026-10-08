import { HtmlContent } from "../../../../components/HtmlContent";
import type {
  LabContent,
  PortfolioGridSection,
  PortfolioPageModel
} from "../../../../lib/types";
import {
  Alert,
  Html,
  MoreLink,
  Panel,
  PostNav,
  Readout,
  samePath,
  Section,
  unitCode,
  useTo
} from "../parts";

const COLUMNS: Record<string, number> = {
  "-one-col": 1,
  "-two-col": 2,
  "-three-col": 3
};

function Gallery({
  section,
  index
}: {
  section: PortfolioGridSection;
  index: number;
}) {
  if (!section.items?.length) return null;
  const columns = COLUMNS[section.modifier ?? ""] ?? 3;
  const hasHeader = section.headline || section.description;

  const grid = (
    <div className={`mc-gallery mc-gallery--${columns}`}>
      {section.items.map((item, itemIndex) => (
        <figure className="mc-gallery__item" key={itemIndex}>
          <a
            className="mc-gallery__media"
            href={item.imageRaw ?? item.link ?? item.image}
            tabIndex={-1}
          >
            {item.video ? (
              <video src={item.video} muted loop playsInline autoPlay />
            ) : (
              item.image && (
                <img src={item.image} alt={item.title ?? ""} loading="lazy" />
              )
            )}
          </a>
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
      code={`Feed ${String(index + 1).padStart(2, "0")}`}
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
  let gallery = 0;

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

      {page.sections.map((section, index) =>
        section.type === "portfolioGrid" ? (
          <Gallery key={index} section={section} index={gallery++} />
        ) : null
      )}

      {page.content && (
        <section className="mc-section">
          <HtmlContent
            className="mc-prose mc-prose--solo"
            html={page.content}
          />
        </section>
      )}

      <PostNav nav={page.postNav} noun="unit" />

      <Alert />
    </article>
  );
}
