import {
  hasNewsletter,
  introOf,
  postsByYear,
  postTypes,
  type TemplateProps,
  titleOf
} from "../../../site";
import {
  Contents,
  Entries,
  Layout,
  NewsletterSection,
  PageHeader,
  postItems,
  Section
} from "../parts";

export function Writing({ page, content }: TemplateProps<"writing">) {
  const intro = introOf(page);
  const years = postsByYear(content.posts);

  return (
    <Layout
      rail={
        <Contents
          chapters={years.map(([year]) => ({
            id: `year-${year}`,
            label: year
          }))}
        />
      }
    >
      <PageHeader title={titleOf(page)} lede={intro?.subheading}>
        <p className="st-pageMeta">
          <span>{`${content.posts.length} articles · ${years.length} years`}</span>
          <span>
            {postTypes(content.posts)
              .map((type) => type.text)
              .join(", ")}
          </span>
        </p>
      </PageHeader>

      {years.map(([year, posts]) => (
        <Section key={year} id={`year-${year}`} title={year}>
          <Entries items={postItems(posts)} />
        </Section>
      ))}

      {hasNewsletter(page) && <NewsletterSection />}
    </Layout>
  );
}
