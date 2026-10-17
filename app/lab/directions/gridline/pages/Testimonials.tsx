import { introOf, sectionOf, type TemplateProps } from "../../../site";
import { Band, Chips, PageHeader, QuoteCells, SectionHead } from "../parts";

export function Testimonials({ page }: TemplateProps<"testimonials">) {
  const intro = introOf(page);
  const grid = sectionOf(page, "testimonials-grid");

  return (
    <>
      <PageHeader
        eyebrow="Testimonials"
        title={intro?.heading ?? "Testimonials"}
        lede={intro?.subheading}
        aside={
          grid &&
          grid.qualities.length > 0 && (
            <>
              <p className="gl-label">Mentioned most</p>
              <Chips
                label="Most mentioned qualities"
                links={grid.qualities.map((quality) => ({
                  text: quality.label,
                  url: "",
                  count: quality.count
                }))}
              />
            </>
          )
        }
      />

      {grid && (
        <Band>
          <SectionHead
            eyebrow="Kind words"
            title={`${grid.testimonials.length} clients and colleagues`}
          />
          <QuoteCells testimonials={grid.testimonials} />
        </Band>
      )}
    </>
  );
}
