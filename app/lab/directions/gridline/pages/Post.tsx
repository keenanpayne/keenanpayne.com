import { HtmlContent } from "../../../../components/HtmlContent";
import {
  contentsOf,
  Html,
  ledeOf,
  readingMinutes,
  type TemplateProps,
  titleOf,
  useActiveSection,
  useTo
} from "../../../site";
import {
  Band,
  Discussion,
  Facts,
  More,
  Newsletter,
  PageHeader,
  PostNav,
  Trail
} from "../parts";

/** Contents in the left rail, marking the section being read */
function Contents({ html, ids }: { html: string; ids: string[] }) {
  const active = useActiveSection(ids);
  const marked = active
    ? html.replace(`href="#${active}"`, `href="#${active}" aria-current="true"`)
    : html;

  return (
    <nav className="gl-contents" aria-label="On this page">
      <h2 className="gl-label">On this page</h2>
      <Html html={marked} />
    </nav>
  );
}

export function Post({ page }: TemplateProps<"post">) {
  const to = useTo();
  const contents = contentsOf(page.content);
  const minutes = readingMinutes(page.content);

  return (
    <article>
      <PageHeader
        eyebrow={
          <Trail
            links={[
              { text: "Writing", url: to("/archive/") },
              ...(page.type
                ? [{ text: page.type.label, url: page.type.url }]
                : [])
            ]}
          />
        }
        title={titleOf(page)}
        lede={ledeOf(page)}
        aside={
          <Facts
            rows={[
              [
                "Published",
                <time dateTime={page.date.iso}>{page.date.long}</time>
              ],
              ["Reading", `${minutes} min`],
              ...(page.tags?.length
                ? [
                    [
                      "Filed under",
                      page.tags.map((tag, index) => (
                        <span key={tag.name}>
                          {index > 0 && ", "}
                          {tag.url ? (
                            <a href={tag.url}>{tag.name}</a>
                          ) : (
                            tag.name
                          )}
                        </span>
                      ))
                    ] as [string, React.ReactNode]
                  ]
                : [])
            ]}
          />
        }
      />

      <Band>
        <div className="gl-article">
          <aside className="gl-article__rail">
            {contents && <Contents {...contents} />}
          </aside>
          <div className="gl-article__body">
            <HtmlContent className="gl-prose" html={page.content} />
            {page.type && (
              <p className="gl-article__more">
                <More href={page.type.url}>
                  {`More ${page.type.label.toLowerCase()}s`}
                </More>
              </p>
            )}
          </div>
          <div className="gl-article__margin" />
        </div>
      </Band>

      <PostNav nav={page.postNav} />

      {page.comments && <Discussion url={page.meta.canonical} />}

      {page.newsletter && <Newsletter />}
    </article>
  );
}
