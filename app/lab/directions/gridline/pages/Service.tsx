import { HtmlContent } from "../../../../components/HtmlContent";
import {
  introOf,
  quotesOf,
  samePath,
  titleOf,
  useTo,
  type TemplateProps
} from "../../../site";
import {
  Band,
  Copy,
  EntryRows,
  KindWords,
  PageHeader,
  ProcessSteps,
  ServiceArt,
  ServiceRows,
  Trail
} from "../parts";

export function Service({ page, content }: TemplateProps<"service">) {
  const to = useTo();
  const intro = introOf(page);
  const title = titleOf(page);
  // A page that describes its own process doesn't need the general one
  const ownProcess = page.content.includes("services-process");

  return (
    <>
      <PageHeader
        eyebrow={
          <Trail links={[{ text: "Services", url: to("/services/") }]} />
        }
        title={title}
        lede={intro?.subheading}
        aside={<ServiceArt url={page.url} className="gl-service__cover" />}
      />

      <Band label="About this service">
        <div className="gl-ledger">
          {intro?.body && (
            <div className="gl-ledger__row">
              <h2 className="gl-ledger__label">Overview</h2>
              <div className="gl-ledger__body">
                <Copy html={intro.body} className="gl-service__intro" />
              </div>
            </div>
          )}

          {page.content && (
            <HtmlContent
              className="gl-prose gl-ledger__prose"
              html={page.content}
            />
          )}

          {!ownProcess && (
            <div className="gl-ledger__row">
              <h2 className="gl-ledger__label">How we’ll work together</h2>
              <div className="gl-ledger__body gl-ledger__body--flush">
                <ProcessSteps steps={content.profile.process} cols={2} />
              </div>
            </div>
          )}

          <div className="gl-ledger__row">
            <h2 className="gl-ledger__label">Other services</h2>
            <div className="gl-ledger__body gl-ledger__body--flush">
              <ServiceRows
                services={content.services.filter(
                  (service) => !samePath(service.url, page.url)
                )}
              />
            </div>
          </div>
        </div>
      </Band>

      {page.sections.map((section, index) =>
        section.type === "entries" ? (
          <EntryRows key={index} section={section} />
        ) : null
      )}

      <KindWords testimonials={quotesOf(page, content)} />
    </>
  );
}
