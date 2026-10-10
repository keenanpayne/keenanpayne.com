import { HtmlContent } from "../../../../components/HtmlContent";
import {
  Html,
  introOf,
  samePath,
  useTo,
  type TemplateProps
} from "../../../site";
import { Entries, KindWords, PageHeader, Section, ServiceList } from "../parts";

export function Service({ page, content }: TemplateProps<"service">) {
  const to = useTo();
  const intro = introOf(page);

  return (
    <>
      <PageHeader
        eyebrow={<a href={to("/services/")}>Services</a>}
        title={intro?.heading ?? intro?.title ?? page.meta.title}
        lede={intro?.subheading}
      />

      {intro?.body && <Html className="wireframe-prose" html={intro.body} />}
      {page.content && (
        <HtmlContent className="wireframe-prose" html={page.content} />
      )}

      {page.sections.map((section, index) =>
        section.type === "entries" ? (
          <Entries key={index} section={section} />
        ) : null
      )}

      <Section title="Other services">
        <ServiceList
          services={content.services.filter(
            (service) => !samePath(service.url, page.url)
          )}
        />
      </Section>

      <KindWords testimonials={content.testimonials} />
    </>
  );
}
