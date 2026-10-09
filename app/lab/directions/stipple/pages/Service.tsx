import { HtmlContent } from "../../../../components/HtmlContent";
import {
  Html,
  introOf,
  samePath,
  useTo,
  type TemplateProps
} from "../../../site";
import {
  Button,
  Contents,
  Entries,
  Layout,
  PageHeader,
  Quotes,
  Section,
  ServiceArt,
  type Chapter
} from "../parts";

export function Service({ page, content }: TemplateProps<"service">) {
  const to = useTo();
  const intro = introOf(page);
  const others = content.services.filter(
    (service) => !samePath(service.url, page.url)
  );
  const lists = page.sections.flatMap((section, index) =>
    section.type === "entries" && section.entries.length
      ? [{ id: `list-${index + 1}`, section }]
      : []
  );

  const chapters: Chapter[] = [{ id: "overview", label: "Overview" }];
  for (const { id, section } of lists) {
    chapters.push({ id, label: section.heading ?? "Examples" });
  }
  chapters.push(
    { id: "other-services", label: "Other services" },
    { id: "kind-words", label: "Kind words" }
  );

  return (
    <Layout rail={<Contents chapters={chapters} />}>
      <PageHeader
        crumbs={
          <>
            <a href={to("/services/")}>Services</a>
            <span aria-hidden="true">/</span>
            <span>Service</span>
          </>
        }
        title={intro?.heading ?? intro?.title ?? page.meta.title}
        lede={intro?.subheading}
      >
        <p className="st-actions">
          <Button href={to("/project-inquiry/")} arrow>
            Start a project
          </Button>
        </p>
      </PageHeader>

      <ServiceArt className="st-cover" url={page.url} />

      <Section id="overview" title="Overview">
        {intro?.body && <Html className="st-prose" html={intro.body} />}
        {page.content && (
          <HtmlContent className="st-prose" html={page.content} />
        )}
      </Section>

      {lists.map(({ id, section }) => (
        <Section key={id} id={id} title={section.heading ?? "Examples"}>
          <Entries
            size="medium"
            items={section.entries.flatMap((entry) =>
              entry.url
                ? [
                    {
                      url: entry.url,
                      title: entry.heading ?? entry.url,
                      sub: entry.lede && <Html html={entry.lede} />
                    }
                  ]
                : []
            )}
          />
        </Section>
      ))}

      <Section id="other-services" title="Other services">
        <Entries
          size="medium"
          items={others.map((service) => ({
            url: service.url,
            title: service.title,
            sub: service.lede
          }))}
        />
      </Section>

      <Section id="kind-words" title="Kind words">
        <Quotes testimonials={content.testimonials} />
      </Section>
    </Layout>
  );
}
