import { HtmlContent } from "../../../../components/HtmlContent";
import type {
  BasicPageModel,
  EntriesSection,
  LabContent
} from "../../../../lib/types";
import {
  BackLink,
  Banner,
  ContentKey,
  Heading,
  Html,
  Intro,
  introOf,
  KeySection,
  LinkCard,
  NewsList,
  QuotePromo,
  ratingOf,
  samePath,
  SideGroup,
  SideList,
  Sprite,
  TitleBar,
  useTo,
  WorkCard
} from "../parts";
import { FACE, ITEMS } from "../sprites";
import { splitTopics } from "./Post";
import { serviceItem, Worlds } from "./Services";

function Entries({
  section,
  title
}: {
  section: EntriesSection;
  title: string;
}) {
  if (section.entries.length === 0) return null;
  // Type archives list one kind of post, so they share its icon
  const item = ratingOf(title.replace(/s$/, "")).item;

  return (
    <section className="pt-section">
      <Heading>{section.heading ?? "Entries"}</Heading>
      <NewsList
        items={section.entries.map((entry) => ({
          href: entry.url ?? "#",
          title: entry.heading ?? "Untitled",
          item
        }))}
      />
    </section>
  );
}

/** A service, laid out like a system page with a content key */
function Service({
  page,
  content
}: {
  page: BasicPageModel;
  content: LabContent;
}) {
  const to = useTo();
  const intro = introOf(page);
  const index = content.services.findIndex((service) =>
    samePath(service.url, page.url)
  );
  const title = intro?.heading ?? intro?.title ?? page.meta.title;
  const topics = [
    ...(intro?.body
      ? [{ id: "overview", title: "Overview", html: intro.body }]
      : []),
    ...(page.content ? splitTopics(page.content, "Details") : [])
  ];
  // Sections every service shares, after its own copy
  const extras = [
    { id: "how-it-works", title: "How it works" },
    { id: "case-studies", title: "Case studies" },
    { id: "kind-words", title: "Kind words" }
  ];

  return (
    <>
      <Banner
        color="#4f5fb5"
        logo={<Html as="span" html={title} />}
        logoIsTitle
        lede={intro?.subheading && <Html as="p" html={intro.subheading} />}
        image={
          <span
            className="pt-banner__art"
            style={{ "--hue": Math.max(0, index) * 37 } as React.CSSProperties}
          >
            <Sprite art={ITEMS[serviceItem(index)]} scale={9} />
          </span>
        }
        tab="Service overview"
      />

      <ContentKey
        topics={[
          ...topics.flatMap((topic) =>
            topic.title ? [{ id: topic.id, title: topic.title }] : []
          ),
          ...extras
        ]}
      />

      <div className="pt-columns">
        <div className="pt-columns__main">
          {topics.map((topic) => (
            <KeySection key={topic.id} id={topic.id} title={topic.title}>
              <HtmlContent className="pt-prose" html={topic.html} />
            </KeySection>
          ))}
          <section className="pt-section pt-anchor" id={extras[0].id}>
            <Heading>{extras[0].title}</Heading>
            <Worlds />
          </section>
          <section className="pt-section pt-anchor" id={extras[1].id}>
            <Heading more={{ href: to("/portfolio/"), text: "All work" }}>
              {extras[1].title}
            </Heading>
            <ul className="pt-games">
              {content.work.slice(0, 3).map((item, workIndex) => (
                <li key={item.url}>
                  <WorkCard item={item} index={workIndex} />
                </li>
              ))}
            </ul>
          </section>
          <section className="pt-section pt-anchor" id={extras[2].id}>
            <Heading>{extras[2].title}</Heading>
            <QuotePromo testimonial={content.testimonials[2]} />
          </section>
        </div>

        <aside className="pt-columns__side" aria-label="More services">
          <BackLink href={to("/services/")}>Back to Services</BackLink>
          <SideList
            title="Other services"
            items={content.services
              .filter((service) => !samePath(service.url, page.url))
              .map((service) => ({ text: service.title, href: service.url }))}
          />
          <SideGroup title="Links">
            <LinkCard
              href={to("/project-inquiry/")}
              label="Get started"
              art={FACE}
            >
              Tell me about your project
            </LinkCard>
            <LinkCard
              href={to("/portfolio/")}
              label="Case studies"
              art={ITEMS.case}
            >
              See this work in action
            </LinkCard>
          </SideGroup>
        </aside>
      </div>
    </>
  );
}

/** Any other page (service detail, type and tag archives, …) */
export function Generic({
  page,
  content
}: {
  page: BasicPageModel;
  content: LabContent;
}) {
  if (page.url.includes("/services/")) {
    return <Service page={page} content={content} />;
  }

  const intro = introOf(page);
  const title = page.meta.title.split(" | ")[0];

  return (
    <>
      <TitleBar
        title={title}
        images={content.posts.slice(0, 8).map((post) => post.image)}
      />
      <Intro
        heading={intro?.heading ?? intro?.title}
        lede={intro?.subheading}
      />
      {(intro?.body || page.content) && (
        <KeySection toKey={false} title="Details">
          {intro?.body && <Html className="pt-prose" html={intro.body} />}
          {page.content && (
            <HtmlContent className="pt-prose" html={page.content} />
          )}
        </KeySection>
      )}
      {page.sections.map((section, index) =>
        section.type === "entries" ? (
          <Entries key={index} section={section} title={title} />
        ) : null
      )}
    </>
  );
}
