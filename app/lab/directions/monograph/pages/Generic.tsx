import type {
  BasicPageModel,
  EntriesSection,
  IntroSection,
  LabContent,
  SectionModel
} from "../../../../lib/types";
import {
  ArrowCircle,
  Banner,
  Html,
  Icon,
  KindWords,
  PageHeader,
  Section,
  ServicesLedger
} from "../parts";

export const introOf = (page: { sections: SectionModel[] }) =>
  page.sections.find(
    (section): section is IntroSection => section.type === "intro"
  );

export const sectionOf = <T extends SectionModel["type"]>(
  page: { sections: SectionModel[] },
  type: T
) =>
  page.sections.find(
    (section): section is Extract<SectionModel, { type: T }> =>
      section.type === type
  );

function Entries({ section }: { section: EntriesSection }) {
  if (section.entries.length === 0) return null;

  return (
    <Section icon="list" label={section.heading ?? "Entries"}>
      <ol className="mg-index">
        {section.entries.map((entry) => (
          <li key={entry.url}>
            <a href={entry.url}>
              <span className="mg-index__title">{entry.heading}</span>
              {entry.lede && (
                <Html as="span" className="mg-index__type" html={entry.lede} />
              )}
              <ArrowCircle />
            </a>
          </li>
        ))}
      </ol>
    </Section>
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
  const intro = introOf(page);
  const isService = page.url.includes("/services/");
  const title = intro?.heading ?? intro?.title ?? page.meta.title;

  return (
    <>
      <PageHeader
        icon={isService ? "list" : "file"}
        eyebrow={isService ? "Service" : page.meta.title.split(" | ")[0]}
        title={title}
        lede={intro?.subheading}
      />

      {intro?.body && (
        <section className="mg-section">
          <Html className="mg-prose mg-prose--solo" html={intro.body} />
        </section>
      )}

      {page.content && (
        <section className="mg-section">
          <p className="mg-label">
            <Icon name="file" />
            Details
          </p>
          <Html className="mg-prose mg-prose--solo" html={page.content} />
        </section>
      )}

      {page.sections.map((section, index) =>
        section.type === "entries" ? (
          <Entries key={index} section={section} />
        ) : null
      )}

      {isService && (
        <>
          <Section icon="list" label="Other services">
            <ServicesLedger
              services={content.services.filter(
                (service) => !service.url.endsWith(page.url)
              )}
            />
          </Section>
          <Banner heading="Need a hand with this?" />
          <KindWords testimonials={content.testimonials} />
        </>
      )}
    </>
  );
}
