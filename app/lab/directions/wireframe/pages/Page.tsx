import { HtmlContent } from "../../../../components/HtmlContent";
import { Html, introOf, type TemplateProps } from "../../../site";
import { Entries, LinkList, Newsletter, PageHeader, PageTable } from "../parts";

/** Any other page: type and tag archives, subscribe, … */
export function Page({ page }: TemplateProps<"page">) {
  const intro = introOf(page);
  const label = page.meta.title.split(" | ")[0];

  return (
    <>
      <PageHeader
        eyebrow={label}
        title={intro?.heading ?? intro?.title ?? label}
        lede={intro?.subheading}
      />

      {intro?.body && <Html className="wireframe-prose" html={intro.body} />}
      {page.content && (
        <HtmlContent className="wireframe-prose" html={page.content} />
      )}

      {page.sections.map((section, index) => {
        switch (section.type) {
          case "entries":
            return <Entries key={index} section={section} />;
          case "tagList":
            return <LinkList key={index} links={section.tags} label="Tags" />;
          case "typeList":
            return (
              <LinkList key={index} links={section.types} label="Post types" />
            );
          case "pageList":
            return <PageTable key={index} pages={section.pages} />;
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
