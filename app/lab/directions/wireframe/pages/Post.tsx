import { HtmlContent } from "../../../../components/HtmlContent";
import {
  ledeOf,
  readingMinutes,
  titleOf,
  useTo,
  type TemplateProps
} from "../../../site";
import { Discussion, Facts, Newsletter, PageHeader, PostNav } from "../parts";

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
        title={titleOf(page)}
        lede={ledeOf(page)}
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
        <p className="wireframe-more">
          <a href={page.type.url}>{`More ${page.type.label.toLowerCase()}s`}</a>
        </p>
      )}

      <PostNav nav={page.postNav} />

      {page.comments && <Discussion url={page.meta.canonical} />}

      {page.newsletter && <Newsletter />}
    </article>
  );
}
