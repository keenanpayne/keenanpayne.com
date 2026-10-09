import { HtmlContent } from "../../../../components/HtmlContent";
import { Html, introOf, type TemplateProps } from "../../../site";
import { Entries, PageHeader } from "../parts";

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

      {page.sections.map((section, index) =>
        section.type === "entries" ? (
          <Entries key={index} section={section} />
        ) : null
      )}
    </>
  );
}
