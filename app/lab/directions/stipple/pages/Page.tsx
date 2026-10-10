import { HtmlContent } from "../../../../components/HtmlContent";
import { Html, introOf, type TemplateProps } from "../../../site";
import {
  Chips,
  Entries,
  Layout,
  PageHeader,
  PageTable,
  Section,
  Signup
} from "../parts";

/** Any other page: type and tag archives, subscribe, … */
export function Page({ page }: TemplateProps<"page">) {
  const intro = introOf(page);
  const label = page.meta.title.split(" | ")[0];

  return (
    <Layout>
      <PageHeader
        title={intro?.heading ?? intro?.title ?? label}
        lede={intro?.subheading}
      />

      {intro?.body && <Html className="st-prose" html={intro.body} />}
      {page.content && <HtmlContent className="st-prose" html={page.content} />}

      {page.sections.map((section, index) => {
        const id = `section-${index + 1}`;
        switch (section.type) {
          case "entries":
            return section.entries.length > 0 ? (
              <Section key={id} id={id} title={section.heading ?? "Entries"}>
                <Entries
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
            ) : null;
          case "tagList":
            return (
              <Section key={id} id={id} title="Tags">
                <Chips label="Tags" links={section.tags} />
              </Section>
            );
          case "typeList":
            return (
              <Section key={id} id={id} title={section.title ?? "Types"}>
                <Chips label="Post types" links={section.types} />
              </Section>
            );
          case "pageList":
            return (
              <Section key={id} id={id} title={section.title ?? "Pages"}>
                <PageTable pages={section.pages} />
              </Section>
            );
          case "newsletter":
          case "newsletterStandalone":
            return (
              <Section key={id} id={id} title="New writing, by email">
                <p className="st-copy">
                  Articles and tutorials, sent when they’re published.
                </p>
                <Signup />
              </Section>
            );
          default:
            return null;
        }
      })}
    </Layout>
  );
}
