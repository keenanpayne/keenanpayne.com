import { HtmlContent } from "../../../../components/HtmlContent";
import {
  Html,
  introOf,
  labelOf,
  titleOf,
  type TemplateProps
} from "../../../site";
import { emblemFor } from "../emblems";
import {
  Entries,
  KANA,
  LinkList,
  Newsletter,
  PageHeader,
  PageTable,
  Section
} from "../parts";

/** Type and tag archives, and any other page: subscribe, … */
export function Page({ page }: TemplateProps<"page" | "archive">) {
  const intro = introOf(page);

  return (
    <>
      <PageHeader
        eyebrow={labelOf(page)}
        title={titleOf(page)}
        lede={intro?.subheading}
        emblem={emblemFor(page.url)}
      />

      {intro?.body && <Html className="neon-prose" html={intro.body} />}
      {page.content && (
        <HtmlContent className="neon-prose neon-article" html={page.content} />
      )}

      {page.sections.map((section, index) => {
        switch (section.type) {
          case "entries":
            return <Entries key={index} section={section} />;
          case "tagList":
            return (
              <Section key={index} title="Tags" kana={KANA.tags} tone="pink">
                <LinkList links={section.tags} label="Tags" />
              </Section>
            );
          case "typeList":
            return (
              <Section
                key={index}
                title="Post types"
                kana={KANA.types}
                tone="violet"
              >
                <LinkList links={section.types} label="Post types" />
              </Section>
            );
          case "pageList":
            return (
              <Section key={index} title="Pages" kana={KANA.pages} tone="cyan">
                <PageTable pages={section.pages} />
              </Section>
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
