import { HtmlContent } from "../../../../components/HtmlContent";
import {
  ledeOf,
  readingMinutes,
  samePath,
  titleOf,
  useTo,
  type TemplateProps
} from "../../../site";
import {
  Chips,
  Discussion,
  Layout,
  NewsletterSection,
  PageHeader,
  PostNav,
  Stipple,
  Terrain
} from "../parts";

export function Post({ page, content }: TemplateProps<"post">) {
  const to = useTo();
  // Posts of the same type first, then the newest of the rest
  const recommended = [
    ...content.posts.filter((post) => post.type === page.type?.label),
    ...content.posts
  ]
    .filter(
      (post, index, posts) =>
        !samePath(post.url, page.url) &&
        posts.findIndex((other) => other.url === post.url) === index
    )
    .slice(0, 3);

  return (
    <Layout
      rail={
        <section className="st-reading" aria-labelledby="st-reading-title">
          <h2 id="st-reading-title">Recommended reading</h2>
          <ul>
            {recommended.map((post) => (
              <li key={post.url}>
                <a
                  className="st-reading__art"
                  href={post.url}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  {post.image ? (
                    <Stipple src={post.image} />
                  ) : (
                    <Terrain seed={post.url} scale={120} />
                  )}
                </a>
                <a className="st-reading__title" href={post.url}>
                  {post.title}
                </a>
                <p className="st-reading__meta">
                  <time dateTime={post.iso}>{post.date}</time>
                  {post.type && <span>{post.type}</span>}
                </p>
                {post.lede && <p className="st-reading__lede">{post.lede}</p>}
              </li>
            ))}
          </ul>
        </section>
      }
    >
      <article className="st-post">
        <PageHeader
          crumbs={
            <>
              <a href={to("/archive/")}>Writing</a>
              {page.type && (
                <>
                  <span aria-hidden="true">/</span>
                  <a href={page.type.url}>{page.type.label}</a>
                </>
              )}
            </>
          }
          title={titleOf(page)}
          lede={ledeOf(page)}
        >
          <p className="st-pageMeta">
            <time dateTime={page.date.iso}>{page.date.long}</time>
            <span>{`${readingMinutes(page.content)} min read`}</span>
          </p>
        </PageHeader>

        <HtmlContent className="st-prose" html={page.content} />

        {page.tags && page.tags.length > 0 && (
          <Chips
            label="Tags"
            links={page.tags.map((tag) => ({ text: tag.name, url: tag.url }))}
          />
        )}

        <PostNav nav={page.postNav} />

        {page.comments && <Discussion url={page.meta.canonical} />}

        {page.newsletter && <NewsletterSection />}
      </article>
    </Layout>
  );
}
