import { HtmlContent } from "../../../../components/HtmlContent";
import { introOf, useTo, type TemplateProps } from "../../../site";
import {
  Band,
  Chips,
  Copy,
  EntryRows,
  Newsletter,
  PageHeader,
  PageTable,
  SectionHead,
  Trail
} from "../parts";

/** Type and tag archives, and any other page: subscribe, … */
export function Page({ kind, page }: TemplateProps<"page" | "archive">) {
  const to = useTo();
  const intro = introOf(page);
  const label = page.meta.title.split(" | ")[0];
  const hasEntries = page.sections.some(
    (section) => section.type === "entries" && section.entries.length > 0
  );

  return (
    <>
      <PageHeader
        eyebrow={
          kind === "archive" ? (
            <Trail
              links={[{ text: "Writing", url: to("/archive/") }]}
              current={label}
            />
          ) : (
            label
          )
        }
        title={intro?.heading ?? intro?.title ?? label}
        lede={intro?.subheading}
      />

      {(intro?.body || page.content) && (
        <Band label="Body">
          <div className="gl-pad">
            {intro?.body && <Copy html={intro.body} />}
            {page.content && (
              <HtmlContent className="gl-prose" html={page.content} />
            )}
          </div>
        </Band>
      )}

      {page.sections.map((section, index) => {
        switch (section.type) {
          case "entries":
            return section.entries.length > 0 ? (
              <EntryRows key={index} section={section} />
            ) : (
              !hasEntries && (
                <Band key={index} label="Nothing yet">
                  <p className="gl-pad gl-meta">
                    No content is published here yet.
                  </p>
                </Band>
              )
            );
          case "tagList":
            return (
              <Band key={index}>
                <SectionHead eyebrow="Tags" title="Browse by tag" />
                <div className="gl-pad">
                  <Chips links={section.tags} label="Tags" />
                </div>
              </Band>
            );
          case "typeList":
            return (
              <Band key={index}>
                <SectionHead
                  eyebrow="Types"
                  title={section.title ?? "Browse by type"}
                />
                <div className="gl-pad">
                  <Chips links={section.types} label="Post types" />
                </div>
              </Band>
            );
          case "pageList":
            return (
              <Band key={index}>
                <SectionHead
                  eyebrow="Sitemap"
                  title={section.title ?? "Pages"}
                />
                <PageTable pages={section.pages} />
              </Band>
            );
          case "newsletter":
          case "newsletterStandalone":
            return <Newsletter key={index} />;
          default:
            return null;
        }
      })}
    </>
  );
}
