import { HtmlContent } from "../../../../components/HtmlContent";
import type {
  PortfolioGridSection,
  PortfolioPageModel,
  TestimonialModel
} from "../../../../lib/types";
import { galleryColumns, Html, useTo } from "../../../site";
import {
  ArrowCircle,
  Banner,
  Discussion,
  Facts,
  Icon,
  MoreLink,
  Quote
} from "../parts";

/** What a case study runs between its pillars and its body, in order */
type Block =
  | { kind: "gallery"; section: PortfolioGridSection }
  | { kind: "quote"; testimonial: TestimonialModel };

const blocksOf = (sections: PortfolioPageModel["sections"]) =>
  sections.flatMap((section): Block[] => {
    if (section.type === "portfolioGrid") return [{ kind: "gallery", section }];
    if (section.type === "testimonial" && section.testimonial) {
      return [{ kind: "quote", testimonial: section.testimonial }];
    }
    return [];
  });

export function Gallery({ section }: { section: PortfolioGridSection }) {
  if (!section.items?.length) return null;
  const columns = galleryColumns(section.modifier);
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
            {item.video ? (
              // Not inside a link, so clicks reach the video's controls
              <div className="mg-gallery__media">
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
                className="mg-gallery__media"
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

  const details: [string, React.ReactNode][] = [];
  if (page.technologies) {
    details.push([
      "Technologies",
      <ul className="mg-tags">
        {page.technologies.map((technology) => (
          <li key={technology}>{technology}</li>
        ))}
      </ul>
    ]);
  }
  if (page.people) {
    details.push([
      "Collaborators",
      <ul className="mg-people">
        {page.people.map((person) => (
          <li key={person.name}>
            {person.url ? <a href={person.url}>{person.name}</a> : person.name}
            {person.position && (
              <span className="mg-meta">{person.position}</span>
            )}
          </li>
        ))}
      </ul>
    ]);
  }
  if (page.awards) {
    details.push([
      "Awards",
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
    ]);
  }
  if (page.siteUrl) {
    details.push([
      "Visit",
      <MoreLink href={page.siteUrl}>{page.siteTitle ?? page.siteUrl}</MoreLink>
    ]);
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

        <Facts stacked rows={details} />
      </section>

      {page.pillars &&
        (page.pillars.client ||
          page.pillars.challenge ||
          page.pillars.solution) && (
          <section className="mg-section">
            <div
              className={
                page.pillars.client &&
                page.pillars.challenge &&
                page.pillars.solution
                  ? "mg-row mg-row--thirds"
                  : "mg-row mg-row--halves"
              }
            >
              {page.pillars.client && (
                <div className="mg-card">
                  <p className="mg-label">The client</p>
                  <p className="mg-case__pillar">{page.pillars.client}</p>
                </div>
              )}
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

      {blocksOf(page.sections).map((block, index) =>
        block.kind === "gallery" ? (
          <Gallery key={index} section={block.section} />
        ) : (
          <div key={index} className="mg-gallery__continued">
            <Quote testimonial={block.testimonial} />
          </div>
        )
      )}

      {page.content && (
        <section className="mg-section">
          <HtmlContent
            className="mg-prose mg-prose--solo"
            html={page.content}
          />
        </section>
      )}

      {page.comments && <Discussion url={page.meta.canonical} />}

      <Banner />
    </article>
  );
}
