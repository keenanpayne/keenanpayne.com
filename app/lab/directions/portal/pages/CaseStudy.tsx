import { HtmlContent } from "../../../../components/HtmlContent";
import type {
  LabContent,
  PortfolioGridSection,
  PortfolioPageModel,
  TestimonialSection
} from "../../../../lib/types";
import { Html, samePath, useTo } from "../../../site";
import {
  BackLink,
  Banner,
  ContentKey,
  Features,
  KeySection,
  LinkCard,
  PostNav,
  Quote,
  SideGroup,
  SideList
} from "../parts";
import { FACE, ITEMS, MONITOR } from "../sprites";

const COLUMNS: Record<string, number> = {
  "-one-col": 1,
  "-two-col": 2,
  "-three-col": 3
};

/**
 * A gallery with a headline, plus the headless galleries and client quotes
 * that follow it, in page order
 */
interface Group {
  /** The first gallery; absent while a group holds only quotes */
  head?: PortfolioGridSection;
  blocks: (PortfolioGridSection | TestimonialSection)[];
}

function groupGalleries(sections: PortfolioPageModel["sections"]) {
  const groups: Group[] = [];
  for (const section of sections) {
    const last = groups[groups.length - 1];
    if (section.type === "testimonial" && section.testimonial) {
      if (last) last.blocks.push(section);
      else groups.push({ blocks: [section] });
    } else if (section.type === "portfolioGrid" && section.items?.length) {
      if (last && !section.headline && !section.description) {
        last.head ??= section;
        last.blocks.push(section);
      } else {
        groups.push({ head: section, blocks: [section] });
      }
    }
  }
  return groups;
}

function Gallery({ section }: { section: PortfolioGridSection }) {
  const columns = COLUMNS[section.modifier ?? ""] ?? 3;

  return (
    <ul className={`pt-gallery pt-gallery--${columns}`}>
      {section.items?.map((item, index) => (
        <li key={index}>
          <figure>
            {item.video ? (
              // Not inside a link, so clicks reach the video's controls
              <div className="pt-gallery__media">
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
                className="pt-gallery__media"
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
                    <a href={item.link}>{item.title}</a>
                  ) : (
                    <strong>{item.title}</strong>
                  ))}
                {item.caption && <Html as="span" html={item.caption} />}
              </figcaption>
            )}
          </figure>
        </li>
      ))}
    </ul>
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
  const work = content.work.find((item) => samePath(item.url, page.url));
  const groups = groupGalleries(page.sections);
  const galleryId = (index: number) => `gallery-${index + 1}`;
  let quote = 0;

  const topics = [
    page.overview && { id: "overview", title: "Overview" },
    page.pillars?.challenge && { id: "challenge", title: "The challenge" },
    page.pillars?.solution && { id: "solution", title: "The solution" },
    ...groups.map((group, index) => ({
      id: galleryId(index),
      title: group.head?.headline ?? `Gallery ${index + 1}`
    })),
    page.content && { id: "details", title: "Details" }
  ].filter(Boolean) as { id: string; title: string }[];

  return (
    <article className="pt-case">
      <Banner
        color={page.color}
        logo={page.client ?? "Case study"}
        logoIsTitle
        lede={page.lede && <p>{page.lede}</p>}
        image={page.cover && <img src={page.cover} alt="" />}
        tab="Case overview"
      />

      <ContentKey topics={topics} />

      <div className="pt-columns">
        <div className="pt-columns__main">
          {page.overview && (
            <KeySection id="overview" title="Overview">
              <div className="pt-spec">
                {work && (
                  <img
                    className="pt-spec__img"
                    src={work.coverSquare}
                    alt=""
                    loading="lazy"
                  />
                )}
                <div>
                  {page.services && page.services.length > 0 && (
                    <>
                      <h3 className="pt-spec__label">Features</h3>
                      <Features items={page.services} />
                    </>
                  )}
                  <h3 className="pt-spec__label">Description</h3>
                  <Html as="p" className="pt-spec__text" html={page.overview} />
                </div>
              </div>
            </KeySection>
          )}

          {page.pillars?.challenge && (
            <KeySection id="challenge" title="The challenge">
              <Html
                as="p"
                className="pt-spec__text"
                html={page.pillars.challenge}
              />
            </KeySection>
          )}
          {page.pillars?.solution && (
            <KeySection id="solution" title="The solution">
              <Html
                as="p"
                className="pt-spec__text"
                html={page.pillars.solution}
              />
            </KeySection>
          )}

          {groups.map((group, index) => (
            <KeySection
              key={galleryId(index)}
              id={galleryId(index)}
              title={
                <>
                  {group.head?.headline ?? `Gallery ${index + 1}`}
                  {group.head?.eyebrow && (
                    <span className="pt-keysec__tag">{group.head.eyebrow}</span>
                  )}
                </>
              }
            >
              {group.head?.description && (
                <Html
                  as="p"
                  className="pt-spec__text pt-gallery__intro"
                  html={group.head.description}
                />
              )}
              {group.blocks.map((block, blockIndex) =>
                block.type === "portfolioGrid" ? (
                  <Gallery key={blockIndex} section={block} />
                ) : (
                  block.testimonial && (
                    <Quote
                      key={blockIndex}
                      testimonial={block.testimonial}
                      index={quote++}
                    />
                  )
                )
              )}
            </KeySection>
          ))}

          {page.content && (
            <KeySection id="details" title="Details">
              <HtmlContent className="pt-prose" html={page.content} />
            </KeySection>
          )}

          <PostNav nav={page.postNav} noun="case study" />
        </div>

        <aside className="pt-columns__side" aria-label="Project details">
          <BackLink href={to("/portfolio/")}>Back to Work</BackLink>
          <SideList
            title="Specs"
            items={
              [
                page.industry && { text: "Sector", small: page.industry },
                page.size && { text: "Company size", small: page.size },
                page.year && { text: "Years", small: page.year },
                work?.role && { text: "Role", small: work.role }
              ].filter(Boolean) as { text: string; small: string }[]
            }
          />
          {page.technologies && page.technologies.length > 0 && (
            <SideGroup title="Accessories">
              <ul className="pt-chips">
                {page.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </SideGroup>
          )}
          {page.people && page.people.length > 0 && (
            <SideList
              title="Crew"
              items={page.people.map((person) => ({
                text: person.name,
                small: person.position,
                href: person.url
              }))}
            />
          )}
          {page.awards && page.awards.length > 0 && (
            <SideList
              title="Awards"
              items={page.awards.map((award) => ({
                text: `${award.name} ${award.status}`,
                small: `${award.year} · ${award.category}`,
                href: award.link
              }))}
            />
          )}
          <SideGroup title="Links">
            {page.siteUrl && (
              <LinkCard href={page.siteUrl} label="Visit site" art={MONITOR}>
                {page.siteTitle ?? "See it live"}
              </LinkCard>
            )}
            {page.postNav?.next && (
              <LinkCard
                href={page.postNav.next.url}
                label="Next case"
                art={ITEMS.case}
              >
                {page.postNav.next.text}
              </LinkCard>
            )}
            <LinkCard
              href={to("/project-inquiry/")}
              label="Start a project"
              art={FACE}
            >
              Tell me about your goals
            </LinkCard>
          </SideGroup>
        </aside>
      </div>
    </article>
  );
}
