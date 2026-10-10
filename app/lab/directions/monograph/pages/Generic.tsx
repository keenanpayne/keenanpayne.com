import { HtmlContent } from "../../../../components/HtmlContent";
import type {
  BasicPageModel,
  EntriesSection,
  LabContent,
  LinkModel,
  PageListSection
} from "../../../../lib/types";
import { Html, introOf } from "../../../site";
import {
  ArrowCircle,
  Banner,
  Icon,
  KindWords,
  Newsletter,
  PageHeader,
  Section,
  ServicesLedger
} from "../parts";

function Entries({
  section
}: {
  section: Pick<EntriesSection, "heading" | "entries">;
}) {
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

const pageEntries = (section: PageListSection) => ({
  heading: section.title ?? "Pages",
  entries: section.pages.map((page) => ({
    url: page.url,
    heading: page.title ?? page.url
  }))
});

/** Tags and post types, as a run of tags */
function Tags({ label, links }: { label: string; links: LinkModel[] }) {
  if (links.length === 0) return null;

  return (
    <Section icon="grid" label={label}>
      <ul className="mg-tags">
        {links.map((link) => (
          <li key={link.url}>
            <a href={link.url}>{link.text}</a>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** A service, or any other page (type and tag archives, …) */
export function Generic({
  page,
  content,
  isService = false
}: {
  page: BasicPageModel;
  content: LabContent;
  isService?: boolean;
}) {
  const intro = introOf(page);
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
          <HtmlContent
            className="mg-prose mg-prose--solo"
            html={page.content}
          />
        </section>
      )}

      {page.sections.map((section, index) => {
        switch (section.type) {
          case "entries":
            return <Entries key={index} section={section} />;
          case "tagList":
            return <Tags key={index} label="Tags" links={section.tags} />;
          case "typeList":
            return (
              <Tags
                key={index}
                label={section.title ?? "Post types"}
                links={section.types}
              />
            );
          case "pageList":
            return <Entries key={index} section={pageEntries(section)} />;
          case "newsletter":
          case "newsletterStandalone":
            return <Newsletter key={index} />;
          default:
            return null;
        }
      })}

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
