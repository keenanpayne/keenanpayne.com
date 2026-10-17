import {
  hasNewsletter,
  introOf,
  postsByYear,
  postTypes,
  type TemplateProps
} from "../../../site";
import { Band, Chips, Facts, Newsletter, PageHeader, PostRows } from "../parts";

export function Writing({ page, content }: TemplateProps<"writing">) {
  const intro = introOf(page);
  const { posts } = content;
  const years = postsByYear(posts);
  const types = postTypes(posts);

  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title={intro?.heading ?? "Writing"}
        lede={intro?.subheading}
        aside={
          <Facts
            rows={[
              ["Articles", posts.length],
              ["Years", `${years.at(-1)?.[0]}–${years[0]?.[0]}`],
              ["Kinds", types.length]
            ]}
          />
        }
      >
        <div className="gl-actions">
          <Chips
            label="Post types"
            links={types.map((type) => ({
              ...type,
              count: posts.filter((post) => post.type === type.text).length
            }))}
          />
        </div>
      </PageHeader>

      {years.map(([year, yearPosts]) => (
        <Band key={year} className="gl-year">
          <div className="gl-year__grid">
            <h2 className="gl-year__label">
              <span>{year}</span>
              <span className="gl-meta">
                {`${yearPosts.length} ${yearPosts.length === 1 ? "post" : "posts"}`}
              </span>
            </h2>
            <PostRows posts={yearPosts} />
          </div>
        </Band>
      ))}

      {hasNewsletter(page) && <Newsletter invert />}
    </>
  );
}
