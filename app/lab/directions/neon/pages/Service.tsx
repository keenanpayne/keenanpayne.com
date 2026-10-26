import { HtmlContent } from "../../../../components/HtmlContent";
import {
  Html,
  introOf,
  quotesOf,
  samePath,
  titleOf,
  useTo,
  type TemplateProps
} from "../../../site";
import { emblemAt } from "../emblems";
import {
  Entries,
  KANA,
  KindWords,
  PageHeader,
  Section,
  ServiceList
} from "../parts";

export function Service({ page, content }: TemplateProps<"service">) {
  const to = useTo();
  const intro = introOf(page);
  const index = content.services.findIndex((service) =>
    samePath(service.url, page.url)
  );

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <a href={to("/services/")}>Services</a>
            <span aria-hidden="true"> / {KANA.services}</span>
          </>
        }
        title={titleOf(page)}
        lede={intro?.subheading}
        kana={KANA.services}
        emblem={emblemAt(Math.max(0, index))}
      />

      {intro?.body && <Html className="neon-prose" html={intro.body} />}
      {page.content && (
        <HtmlContent className="neon-prose" html={page.content} />
      )}

      {page.sections.map((section, sectionIndex) =>
        section.type === "entries" ? (
          <Entries key={sectionIndex} section={section} />
        ) : null
      )}

      <Section title="Other services" kana={KANA.other} tone="amber">
        <ServiceList
          services={content.services.filter(
            (service) => !samePath(service.url, page.url)
          )}
          offset={index + 1}
        />
      </Section>

      <KindWords testimonials={quotesOf(page, content)} />
    </>
  );
}
