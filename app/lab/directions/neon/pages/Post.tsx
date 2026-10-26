import { HtmlContent } from "../../../../components/HtmlContent";
import {
  ledeOf,
  readingMinutes,
  titleOf,
  useTo,
  type TemplateProps
} from "../../../site";
import { emblemFor } from "../emblems";
import {
  Chip,
  Discussion,
  Facts,
  KANA,
  More,
  Newsletter,
  PageHeader,
  PostNav,
  toneFor
} from "../parts";

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
        kana={KANA.post}
        emblem={emblemFor(page.url)}
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
                    <ul className="neon-chips">
                      {page.tags.map((tag) => (
                        <li key={tag.name}>
                          <Chip tone={toneFor(tag.name)} href={tag.url}>
                            {tag.name}
                          </Chip>
                        </li>
                      ))}
                    </ul>
                  ] as [string, React.ReactNode]
                ]
              : [])
          ]}
        />
      </PageHeader>

      <HtmlContent className="neon-prose neon-article" html={page.content} />

      {page.type && (
        <More href={page.type.url}>
          {`More ${page.type.label.toLowerCase()}s`}
        </More>
      )}

      <PostNav nav={page.postNav} />

      {page.comments && <Discussion url={page.meta.canonical} />}

      {page.newsletter && <Newsletter />}
    </article>
  );
}
