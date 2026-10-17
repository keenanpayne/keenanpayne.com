import { Link } from "react-router";

import type { PostPageModel } from "../../lib/types";
import { Comments } from "../Comments";
import { HtmlContent } from "../HtmlContent";
import { NewsletterLarge } from "../Newsletter";
import { PostNav } from "../PostNav";

export function PostPage({ page }: { page: PostPageModel }) {
  const { footer, date } = page;

  return (
    <main>
      <section className={page.sectionClass}>
        <header className="post-header">
          <div className="post-meta">
            {page.type && (
              <Link
                className="-underline-hover _label"
                to={page.type.url}
                title={page.type.title}
              >
                <span>{page.type.label}</span>
              </Link>
            )}

            <time className="_text-small" dateTime={date.iso}>
              {date.short}
            </time>
          </div>

          <h1 className="post-title">{page.title}</h1>

          {page.lede && <p className="post-lede _text-h5">{page.lede}</p>}

          {page.tags && (
            <div className="post-tags">
              {page.tags.map((tag) => (
                <div className="post-tag" key={tag.name}>
                  {tag.url ? (
                    <Link to={tag.url} className="tag">
                      {tag.name}
                    </Link>
                  ) : (
                    <span className="tag -inactive">{tag.name}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </header>

        <HtmlContent className="post-content" html={page.content} />

        <footer className="post-footer">
          {footer && page.type && (
            <p>
              <Link to={page.url}>{page.title}</Link>
              {` is ${footer.article} `}
              <Link to={page.type.url} title={page.type.title}>
                {footer.typeLabel}
              </Link>
              {" published on "}
              <time className="entries-time" dateTime={date.iso}>
                {`${date.long}.`}
              </time>
            </p>
          )}
        </footer>

        <PostNav nav={page.postNav} />
      </section>

      {page.comments && <Comments url={page.meta.canonical} />}

      {page.newsletter && <NewsletterLarge modifiers="-pre-footer" />}
    </main>
  );
}
