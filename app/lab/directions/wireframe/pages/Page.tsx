import { HtmlContent } from "../../../../components/HtmlContent";
import {
  Html,
  introOf,
  labelOf,
  titleOf,
  type TemplateProps
} from "../../../site";
import { Entries, LinkList, Newsletter, PageHeader, PageTable } from "../parts";

/** Type and tag archives, and any other page: subscribe, … */
export function Page({ page }: TemplateProps<"page" | "archive">) {
  const intro = introOf(page);

  return (
    <>
      <PageHeader
        eyebrow={labelOf(page)}
        title={titleOf(page)}
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
