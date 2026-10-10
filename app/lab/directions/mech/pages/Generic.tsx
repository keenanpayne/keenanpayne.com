import { HtmlContent } from "../../../../components/HtmlContent";
import type {
  BasicPageModel,
  EntriesSection,
  LabContent
} from "../../../../lib/types";
import { Html, introOf, pad, samePath } from "../../../site";
import {
  Alert,
  KindWords,
  Newsletter,
  PageHeader,
  Panel,
  Section,
  ServicesList,
  Tri
} from "../parts";

function Entries({ section }: { section: EntriesSection }) {
  if (section.entries.length === 0) return null;

  return (
    <Section
      label={section.heading ?? "Entries"}
      code={`${pad(section.entries.length)} on file`}
    >
      <ol className="mc-log__rows mc-log__rows--entries">
        {section.entries.map((entry, index) => (
          <li key={entry.url}>
            <a href={entry.url}>
              <span className="mc-log__code">{pad(index + 1, 3)}</span>
              <span className="mc-log__title">{entry.heading}</span>
              {entry.lede && (
                <Html as="span" className="mc-log__type" html={entry.lede} />
              )}
              <Tri />
            </a>
          </li>
        ))}
      </ol>
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
  const serviceIndex = content.services.findIndex((service) =>
    samePath(service.url, page.url)
  );
  const title = intro?.heading ?? intro?.title ?? page.meta.title;

  return (
    <>
      <PageHeader
        episode={serviceIndex >= 0 ? `Sys-${pad(serviceIndex + 1)}` : undefined}
        eyebrow={isService ? "Service" : page.meta.title.split(" | ")[0]}
        jp={isService ? "業務" : "記録"}
        title={title}
        lede={intro?.subheading}
        morphTitle={serviceIndex >= 0}
      />

      {(intro?.body || page.content) && (
        <section className="mc-section mc-split mc-split--reverse">
          <div>
            {intro?.body && (
              <>
                <p className="mc-kicker">Briefing</p>
                <Html className="mc-prose" html={intro.body} />
              </>
            )}
            {page.content && (
              <>
                <p className="mc-kicker">Details</p>
                <HtmlContent className="mc-prose" html={page.content} />
              </>
            )}
          </div>
          {isService && (
            <Panel as="aside" label="System status" code="Online">
              <ServicesList
                services={content.services.filter(
                  (service) => !samePath(service.url, page.url)
                )}
                numbered={false}
              />
            </Panel>
          )}
        </section>
      )}

      {page.sections.map((section, index) => {
        switch (section.type) {
          case "entries":
            return <Entries key={index} section={section} />;
          case "newsletter":
          case "newsletterStandalone":
            return <Newsletter key={index} />;
          default:
            return null;
        }
      })}

      {isService && (
        <>
          <Alert heading="Need a hand with this?" />
          <KindWords testimonials={content.testimonials} />
        </>
      )}
    </>
  );
}
