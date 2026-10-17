import { introOf, sectionOf, type TemplateProps } from "../../../site";
import { Chips, Layout, PageHeader, Quotes } from "../parts";

export function Testimonials({ page }: TemplateProps<"testimonials">) {
  const intro = introOf(page);
  const grid = sectionOf(page, "testimonials-grid");

  return (
    <Layout
      rail={
        grid &&
        grid.qualities.length > 0 && (
          <section className="st-railNote" aria-labelledby="st-qualities">
            <h2 id="st-qualities">Most mentioned</h2>
            <ol>
              {grid.qualities.map((quality) => (
                <li key={quality.label}>
                  <span>{quality.label}</span>
                  <span>{quality.count}</span>
                </li>
              ))}
            </ol>
          </section>
        )
      }
    >
      <PageHeader
        title={intro?.heading ?? "Testimonials"}
        lede={intro?.subheading}
      >
        {grid && (
          <p className="st-pageMeta">
            <span>{`${grid.testimonials.length} kind words`}</span>
            <span>{`${grid.qualities.length} qualities`}</span>
          </p>
        )}
        {grid && grid.qualities.length > 0 && (
          <div className="st-onlyNarrow">
            <Chips
              label="Most mentioned qualities"
              links={grid.qualities.map((quality) => ({
                text: `${quality.label} ${quality.count}`
              }))}
            />
          </div>
        )}
      </PageHeader>

      {grid && <Quotes testimonials={grid.testimonials} />}
    </Layout>
  );
}
