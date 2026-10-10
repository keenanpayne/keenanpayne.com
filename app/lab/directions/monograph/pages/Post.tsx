import { HtmlContent } from "../../../../components/HtmlContent";
import type { PostPageModel } from "../../../../lib/types";
import { readingMinutes, useTo } from "../../../site";
import { Icon, MoreLink, Newsletter, PostNav } from "../parts";

export function Post({ page }: { page: PostPageModel }) {
  const to = useTo();
  const minutes = readingMinutes(page.content);

  return (
    <article className="mg-post">
      <header className="mg-post__header">
        <p className="mg-label">
          <Icon name="pen" />
          <a href={to("/archive/")}>Writing</a>
          {page.type && (
            <>
              <span aria-hidden="true">/</span>
              <a href={page.type.url}>{page.type.label}</a>
            </>
          )}
        </p>
        {page.title && <h1 className="mg-post__title">{page.title}</h1>}
        {page.lede && <p className="mg-post__lede">{page.lede}</p>}
      </header>

      <div className="mg-post__layout">
        <aside className="mg-post__rail">
          <dl className="mg-facts mg-facts--stacked">
            <div>
              <dt>Published</dt>
              <dd>
                <time dateTime={page.date.iso}>{page.date.long}</time>
              </dd>
            </div>
            <div>
              <dt>Reading time</dt>
              <dd>{minutes} min</dd>
            </div>
            {page.type && (
              <div>
                <dt>Filed under</dt>
                <dd>
                  <a href={page.type.url}>{page.type.label}</a>
                </dd>
              </div>
            )}
            {page.tags && page.tags.length > 0 && (
              <div>
                <dt>Tags</dt>
                <dd>
                  <ul className="mg-tags">
                    {page.tags.map((tag) => (
                      <li key={tag.name}>
                        {tag.url ? <a href={tag.url}>{tag.name}</a> : tag.name}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </aside>

        <HtmlContent className="mg-prose mg-post__body" html={page.content} />
      </div>

      <footer className="mg-post__footer">
        <p className="mg-copy">
          Thanks for reading. Questions or thoughts?{" "}
          <a href={to("/contact/")}>Get in touch</a>.
        </p>
        {page.type && (
          <MoreLink
            href={page.type.url}
          >{`More ${page.type.title.toLowerCase()}`}</MoreLink>
        )}
      </footer>

      <PostNav nav={page.postNav} />

      {page.newsletter && <Newsletter />}
    </article>
  );
}
