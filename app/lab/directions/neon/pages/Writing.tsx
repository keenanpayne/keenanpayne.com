import {
  hasNewsletter,
  introOf,
  postsByYear,
  postTypes,
  titleOf,
  type TemplateProps
} from "../../../site";
import {
  KANA,
  LinkList,
  Newsletter,
  PageHeader,
  PostList,
  Section,
  toneAt
} from "../parts";

export function Writing({ page, content }: TemplateProps<"writing">) {
  const intro = introOf(page);
  const years = postsByYear(content.posts);
  const types = postTypes(content.posts);

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title={titleOf(page)}
        lede={intro?.subheading}
        kana={KANA.writing}
        emblem="bars"
      >
        <ul className="neon-counters">
          <li>
            <span className="neon-counter">{content.posts.length}</span>{" "}
            articles
          </li>
          <li>
            <span className="neon-counter">{years.length}</span> years
          </li>
          <li>
            <span className="neon-counter">{types.length}</span> kinds
          </li>
        </ul>
        <LinkList links={types} label="Post types" />
      </PageHeader>

      {years.map(([year, posts], index) => (
        <Section
          key={year}
          title={year}
          kana={`${posts.length}${KANA.count}`}
          tone={toneAt(index)}
          className="neon-section--year"
        >
          <PostList posts={posts} />
        </Section>
      ))}

      {hasNewsletter(page) && <Newsletter floor="B1" />}
    </>
  );
}
