import { HtmlContent } from "../../../../components/HtmlContent";
import { readingMinutes, useTo, type TemplateProps } from "../../../site";
import { Facts, Newsletter, PageHeader, PostNav } from "../parts";

export function Post({ page }: TemplateProps<"post">) {
  const to = useTo();

  return (
    <article>
      <PageHeader
        eyebrow={
          <>
            <a href={to("/archive/")}>Writing</a>
            {page.type && (
              <>
                {" / "}
                <a href={page.type.url}>{page.type.label}</a>
              </>
            )}
          </>
        }
        title={page.title ?? page.meta.title}
        lede={page.lede}
      >
        <Facts
          rows={[
            [
              "Published",
              <time dateTime={page.date.iso}>{page.date.long}</time>
            ],
            ["Reading time", `${readingMinutes(page.content)} min`],
            ...(page.tags?.length
              ? [
                  [
                    "Tags",
                    page.tags.map((tag, index) => (
                      <span key={tag.name}>
                        {index > 0 && ", "}
                        {tag.url ? <a href={tag.url}>{tag.name}</a> : tag.name}
                      </span>
                    ))
                  ] as [string, React.ReactNode]
                ]
              : [])
          ]}
        />
      </PageHeader>

      <HtmlContent className="wireframe-prose" html={page.content} />

      {page.type && (
        <p>
          <a href={page.type.url}>{`More ${page.type.label.toLowerCase()}s`}</a>
        </p>
      )}

      <PostNav nav={page.postNav} />

      {page.newsletter && <Newsletter />}
    </article>
  );
}
