import { Fragment, type CSSProperties, type ReactNode } from "react";

import { absoluteUrl, externalLinkProps } from "../../lib/site";
import type { PortfolioPageModel } from "../../lib/types";
import { Comments } from "../Comments";
import { HtmlContent } from "../HtmlContent";
import { Label } from "../Label";
import { PostNav } from "../PostNav";
import { Cta } from "../sections/Cta";
import { Sections } from "../sections/Sections";

const WEBBY_LOGO =
  "https://res.cloudinary.com/keenan-payne/image/upload/v1664670539/portfolio/awards/webby_s9jarp.png";

function Detail({
  label,
  fullWidth,
  children
}: {
  label: string;
  fullWidth?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={
        fullWidth ? "portfolio-detail -full-width" : "portfolio-detail"
      }
    >
      <Label text={label} className="portfolio-label" />
      {children}
    </div>
  );
}

// Inline list items are separated by whitespace (and a comma via CSS)
function InlineList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item, index) => (
        <Fragment key={index}>
          {" "}
          <li className="-inline">{item}</li>
        </Fragment>
      ))}
    </ul>
  );
}

export function PortfolioPage({ page }: { page: PortfolioPageModel }) {
  return (
    <main>
      <section
        className="portfolio _container _page-spacing-top"
        style={{ "--portfolio-color": page.color } as CSSProperties}
      >
        <header className="portfolio-header">
          {page.client && (
            <h1 className="portfolio-title _text-larger">{page.client}</h1>
          )}

          {page.lede && (
            <p className="portfolio-lede _type-my-voice">{page.lede}</p>
          )}
        </header>

        <div className="portfolio-content">
          <div className="portfolio-details">
            {page.overview && (
              <div className="portfolio-detail -full-width">
                <p
                  className="portfolio-stat"
                  dangerouslySetInnerHTML={{ __html: page.overview }}
                />
              </div>
            )}

            {page.size && (
              <Detail label="Company Size">
                <p className="portfolio-stat">{page.size}</p>
              </Detail>
            )}

            {page.industry && (
              <Detail label="Industry">
                <p className="portfolio-stat">{page.industry}</p>
              </Detail>
            )}

            {page.services && (
              <Detail label="Services Offered">
                <InlineList items={page.services} />
              </Detail>
            )}

            {page.year && (
              <Detail label="Year">
                <p className="portfolio-stat">{page.year}</p>
              </Detail>
            )}

            {page.technologies && (
              <Detail label="Technologies" fullWidth>
                <InlineList items={page.technologies} />
              </Detail>
            )}

            {page.people && (
              <Detail label="Collaborators" fullWidth>
                <ul className="portfolio-detail-people">
                  {page.people.map((person, index) => (
                    <li className="portfolio-detail-person" key={index}>
                      {person.url ? (
                        <a href={person.url} target="_blank" rel="noopener">
                          {person.name}
                        </a>
                      ) : (
                        person.name
                      )}

                      {person.position && (
                        <span className="portfolio-detail-position">
                          {person.position}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </Detail>
            )}

            {page.awards && (
              <Detail label="Awards" fullWidth>
                <div className="awards">
                  {page.awards.map((award, index) => (
                    <a
                      key={index}
                      className="awards-item"
                      href={award.link}
                      title={`${award.name} ${award.status} for ${award.category} and ${award.details} in ${award.year}`}
                      {...externalLinkProps(award.link)}
                    >
                      {award.name === "Webby" && (
                        <img src={WEBBY_LOGO} alt={award.name} />
                      )}

                      <div className="awards-name _text-small">
                        <span>{`${award.name} ${award.status}, ${award.year}`}</span>
                      </div>

                      <p className="awards-details _text-smaller">
                        <span>{award.category}</span>
                        <span>{award.details}</span>
                      </p>
                    </a>
                  ))}
                </div>
              </Detail>
            )}

            {page.siteUrl && (
              <div className="portfolio-detail -full-width -cta">
                <p className="portfolio-stat">
                  <a
                    className="button -ghost"
                    href={page.siteUrl}
                    title={page.siteTitle}
                    target="_blank"
                    rel="noopener"
                  >
                    Visit Site
                  </a>
                </p>
              </div>
            )}
          </div>

          {page.cover && (
            <div className="portfolio-cover">
              <img
                className="portfolio-cover-img"
                src={page.cover}
                alt={`${page.client ?? ""} project cover`}
              />
            </div>
          )}

          {page.pillars && (
            <div className="portfolio-intro">
              {page.pillars.client && (
                <div className="portfolio-intro-content">
                  <p className="_text-h3">The client</p>
                  <p className="_text-h5">{page.pillars.client}</p>
                </div>
              )}

              {page.pillars.challenge && (
                <div className="portfolio-intro-content">
                  <p className="_text-h3">The challenge</p>
                  <p
                    className="_text-h5"
                    dangerouslySetInnerHTML={{ __html: page.pillars.challenge }}
                  />
                </div>
              )}

              {page.pillars.solution && (
                <div className="portfolio-intro-content">
                  <p className="_text-h3">The solution</p>
                  <p
                    className="_text-h5"
                    dangerouslySetInnerHTML={{ __html: page.pillars.solution }}
                  />
                </div>
              )}
            </div>
          )}

          <Sections sections={page.sections} />

          {page.content && (
            <HtmlContent
              className="portfolio-subcontent _container -fluid"
              html={page.content}
            />
          )}
        </div>

        <PostNav nav={page.postNav} />
      </section>

      <Cta />

      {page.comments && <Comments url={absoluteUrl(page.url)} />}
    </main>
  );
}
