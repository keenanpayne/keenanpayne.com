import {
  hasNewsletter,
  introOf,
  postsByYear,
  postTypes,
  type TemplateProps
} from "../../../site";
import { Newsletter, PageHeader, PostList, Section } from "../parts";

export function Writing({ page, content }: TemplateProps<"writing">) {
  const intro = introOf(page);
  const years = postsByYear(content.posts);
  const types = postTypes(content.posts).map((type) => type.text);

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title={intro?.heading ?? "Writing"}
        lede={intro?.subheading}
      >
        <p className="wireframe-meta">
          {`${content.posts.length} articles · ${years.length} years · ${types.join(", ")}`}
        </p>
      </PageHeader>

      {years.map(([year, posts]) => (
        <Section key={year} title={year}>
          <PostList posts={posts} />
        </Section>
      ))}

      {hasNewsletter(page) && <Newsletter />}
    </>
  );
}
