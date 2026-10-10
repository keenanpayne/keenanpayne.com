import {
  introOf,
  postsByYear,
  postTypes,
  type TemplateProps
} from "../../../site";
import { PageHeader, PostList, Section } from "../parts";

export function Writing({ page, content }: TemplateProps<"writing">) {
  const intro = introOf(page);
  const years = postsByYear(content.posts);

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title={intro?.heading ?? "Writing"}
        lede={intro?.subheading}
      >
        <p className="wireframe-meta">
          {`${content.posts.length} articles · ${years.length} years · ${postTypes(content.posts).join(", ")}`}
        </p>
      </PageHeader>

      {years.map(([year, posts]) => (
        <Section key={year} title={year}>
          <PostList posts={posts} />
        </Section>
      ))}
    </>
  );
}
