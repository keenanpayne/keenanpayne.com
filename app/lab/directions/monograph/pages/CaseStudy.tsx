import type {
  PortfolioGridSection,
  PortfolioPageModel
} from "../../../../lib/types";
import {
  ArrowCircle,
  Banner,
  Html,
  Icon,
  MoreLink,
  PostNav,
  useTo
} from "../parts";

const COLUMNS: Record<string, number> = {
  "-one-col": 1,
  "-two-col": 2,
  "-three-col": 3
};

function Gallery({ section }: { section: PortfolioGridSection }) {
  if (!section.items?.length) return null;
  const columns = COLUMNS[section.modifier ?? ""] ?? 3;
  const hasHeader = section.headline || section.description;

  return (
    <section className={hasHeader ? "mg-section" : "mg-gallery__continued"}>
      {hasHeader && (
        <>
          <p className="mg-label">
            <Icon name="grid" />
            {section.eyebrow ?? "Selected work"}
          </p>
          <div className="mg-gallery__header">
            {section.headline && (
              <h2 className="mg-card__title mg-card__title--large">
                {section.headline}
              </h2>
            )}
            {section.description && (
              <Html as="p" className="mg-copy" html={section.description} />
            )}
          </div>
        </>
      )}

      <div className={`mg-gallery mg-gallery--${columns}`}>
        {section.items.map((item, index) => (
          <figure className="mg-gallery__item" key={index}>
            <a
              className="mg-gallery__media"
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
                    <a className="mg-more" href={item.link}>
                      <ArrowCircle />
                      <span>{item.title}</span>
                    </a>
                  ) : (
                    <span>{item.title}</span>
                  ))}
                {item.caption && (
                  <Html as="span" className="mg-meta" html={item.caption} />
                )}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}

export function CaseStudy({ page }: { page: PortfolioPageModel }) {
  const to = useTo();

  const specs: [string, React.ReactNode][] = [];
  if (page.industry) specs.push(["Industry", page.industry]);
  if (page.size) specs.push(["Company size", page.size]);
  if (page.year) specs.push(["Years", page.year]);
  if (page.services?.length) {
    specs.push(["Services", page.services.join(", ")]);
  }

  return (
    <article className="mg-case">
      <header className="mg-pageHeader mg-case__header">
        <p className="mg-label">
          <Icon name="grid" />
          <a href={to("/portfolio/")}>Work</a>
          <span aria-hidden="true">/</span>
          Case study
        </p>
        {page.client && <h1 className="mg-case__title">{page.client}</h1>}
        {page.lede && <p className="mg-pageHeader__lede">{page.lede}</p>}
      </header>

      {specs.length > 0 && (
        <dl className="mg-specs">
          {specs.map(([term, detail]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
      )}

      {page.cover && (
        <div className="mg-figure mg-case__cover">
          <img src={page.cover} alt="" />
        </div>
      )}

      <section className="mg-section mg-case__intro">
        <div>
          <p className="mg-label">
            <Icon name="file" />
            Overview
          </p>
          {page.overview && (
            <Html as="p" className="mg-case__overview" html={page.overview} />
          )}
        </div>

        <dl className="mg-facts mg-facts--stacked">
          {page.technologies && (
            <div>
              <dt>Technologies</dt>
              <dd>
                <ul className="mg-tags">
                  {page.technologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          {page.people && (
            <div>
              <dt>Collaborators</dt>
              <dd>
                <ul className="mg-people">
                  {page.people.map((person) => (
                    <li key={person.name}>
                      {person.url ? (
                        <a href={person.url}>{person.name}</a>
                      ) : (
                        person.name
                      )}
                      {person.position && (
                        <span className="mg-meta">{person.position}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          {page.awards && (
            <div>
              <dt>Awards</dt>
              <dd>
                <ul className="mg-people">
                  {page.awards.map((award) => (
                    <li key={`${award.name}${award.year}${award.category}`}>
                      <a href={award.link}>
                        {award.name} {award.status}, {award.year}
                      </a>
                      <span className="mg-meta">
                        {award.category} · {award.details}
                      </span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          {page.siteUrl && (
            <div>
              <dt>Visit</dt>
              <dd>
                <MoreLink href={page.siteUrl}>
                  {page.siteTitle ?? page.siteUrl}
                </MoreLink>
              </dd>
            </div>
          )}
        </dl>
      </section>

      {page.pillars && (page.pillars.challenge || page.pillars.solution) && (
        <section className="mg-section">
          <div className="mg-row mg-row--halves">
            {page.pillars.challenge && (
              <div className="mg-card">
                <p className="mg-label">The challenge</p>
                <Html
                  as="p"
                  className="mg-case__pillar"
                  html={page.pillars.challenge}
                />
              </div>
            )}
            {page.pillars.solution && (
              <div className="mg-card">
                <p className="mg-label">The solution</p>
                <Html
                  as="p"
                  className="mg-case__pillar"
                  html={page.pillars.solution}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {page.sections.map((section, index) =>
        section.type === "portfolioGrid" ? (
          <Gallery key={index} section={section} />
        ) : null
      )}

      {page.content && (
        <section className="mg-section">
          <Html className="mg-prose mg-prose--solo" html={page.content} />
        </section>
      )}

      <PostNav nav={page.postNav} />

      <Banner />
    </article>
  );
}
