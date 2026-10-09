import { introOf, sectionOf, type TemplateProps } from "../../../site";
import { PageHeader, Quote, Section } from "../parts";

export function Testimonials({ page }: TemplateProps<"testimonials">) {
  const intro = introOf(page);
  const grid = sectionOf(page, "testimonials-grid");

  return (
    <>
      <PageHeader
        eyebrow="Testimonials"
        title={intro?.heading ?? "Testimonials"}
        lede={intro?.subheading}
      >
        {grid && grid.qualities.length > 0 && (
          <ul className="wireframe-tags" aria-label="Most mentioned qualities">
            {grid.qualities.map((quality) => (
              <li
                key={quality.label}
              >{`${quality.label} (${quality.count})`}</li>
            ))}
          </ul>
        )}
      </PageHeader>

      {grid && (
        <Section title={`${grid.testimonials.length} kind words`}>
          <div className="wireframe-grid">
            {grid.testimonials.map((testimonial) => (
              <Quote key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
