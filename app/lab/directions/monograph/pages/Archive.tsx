import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  ArrowCircle,
  MoreLink,
  Newsletter,
  PageHeader,
  Section
} from "../parts";

import { introOf } from "./Generic";

type Posts = LabContent["posts"];

/** Row of four article cards, with a typographic stand-in for missing art */
export function PostCards({ posts }: { posts: Posts }) {
  return (
    <div className="mg-row mg-row--quarters">
      {posts.map((post) => (
        <article className="mg-card" key={post.url}>
          <a className="mg-figure" href={post.url} tabIndex={-1}>
            {post.image ? (
              <img src={post.image} alt="" loading="lazy" />
            ) : (
              <span className="mg-figure__placeholder" aria-hidden="true">
                <span>{post.type ?? "Essay"}</span>
                <span>{post.year}</span>
              </span>
            )}
          </a>
          <h3 className="mg-card__title">
            <a href={post.url}>{post.title}</a>
          </h3>
          {post.lede && <p className="mg-copy">{post.lede}</p>}
          <MoreLink href={post.url}>
            Read the {(post.type ?? "essay").toLowerCase()}
          </MoreLink>
        </article>
      ))}
    </div>
  );
}

export function Archive({
  page,
  content
}: {
  page: BasicPageModel;
  content: LabContent;
}) {
  const intro = introOf(page);
  const years = new Map<string, Posts>();
  for (const post of content.posts) {
    years.set(post.year, [...(years.get(post.year) ?? []), post]);
  }
  const types = [
    ...new Set(content.posts.map((post) => post.type).filter(Boolean))
  ];

  return (
    <>
      <PageHeader
        icon="pen"
        eyebrow="Writing"
        title={intro?.heading ?? "Writing"}
        lede={intro?.subheading}
      >
        <p className="mg-pageHeader__stats">
          {content.posts.length} articles · {years.size} years ·{" "}
          {types.join(", ")}
        </p>
      </PageHeader>

      <Section icon="spark" label="Latest">
        <PostCards posts={content.posts.slice(0, 4)} />
      </Section>

      <Section icon="list" label="Index">
        {[...years].map(([year, posts]) => (
          <div className="mg-year" key={year}>
            <h3 className="mg-year__label">{year}</h3>
            <ol className="mg-index">
              {posts.map((post) => (
                <li key={post.url}>
                  <a href={post.url}>
                    <span className="mg-index__date">
                      {post.date.slice(0, 6)}
                    </span>
                    <span className="mg-index__title">{post.title}</span>
                    <span className="mg-index__type">{post.type}</span>
                    <ArrowCircle />
                  </a>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </Section>

      <Newsletter />
    </>
  );
}
