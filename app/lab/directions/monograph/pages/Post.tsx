import type { ReactNode } from "react";

import { HtmlContent } from "../../../../components/HtmlContent";
import type { PostPageModel } from "../../../../lib/types";
import { readingMinutes, useTo } from "../../../site";
import {
  Discussion,
  Facts,
  Icon,
  MoreLink,
  Newsletter,
  PostNav
} from "../parts";

export function Post({ page }: { page: PostPageModel }) {
  const to = useTo();
  const minutes = readingMinutes(page.content);

  const facts: [string, ReactNode][] = [
    ["Published", <time dateTime={page.date.iso}>{page.date.long}</time>],
    ["Reading time", `${minutes} min`]
  ];
  if (page.type) {
    facts.push(["Filed under", <a href={page.type.url}>{page.type.label}</a>]);
  }
  if (page.tags && page.tags.length > 0) {
    facts.push([
      "Tags",
      <ul className="mg-tags">
        {page.tags.map((tag) => (
          <li key={tag.name}>
            {tag.url ? <a href={tag.url}>{tag.name}</a> : tag.name}
          </li>
        ))}
      </ul>
    ]);
  }

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
          <Facts stacked rows={facts} />
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

      {page.comments && <Discussion url={page.meta.canonical} />}

      {page.newsletter && <Newsletter />}
    </article>
  );
}
