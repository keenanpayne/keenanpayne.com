import type { BasicPageModel } from "../../../../lib/types";
import { Banner, PageHeader, Quote, Section } from "../parts";

import { introOf, sectionOf } from "./Generic";

export function Testimonials({ page }: { page: BasicPageModel }) {
  const intro = introOf(page);
  const grid = sectionOf(page, "testimonials-grid");

  return (
    <>
      <PageHeader
        icon="quote"
        eyebrow="Testimonials"
        title={intro?.heading ?? "Testimonials"}
        lede={intro?.subheading}
      >
        {grid && grid.qualities.length > 0 && (
          <ul className="mg-chips" aria-label="Most mentioned qualities">
            {grid.qualities.map((quality) => (
              <li key={quality.label}>
                {quality.label} <span>{quality.count}</span>
              </li>
            ))}
          </ul>
        )}
      </PageHeader>

      {grid && (
        <Section icon="quote" label={`${grid.testimonials.length} kind words`}>
          <div className="mg-masonry">
            {grid.testimonials.map((testimonial) => (
              <Quote key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </Section>
      )}

      <Banner heading="Want to be next?" />
    </>
  );
}
