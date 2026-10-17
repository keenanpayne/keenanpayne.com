import type {
  TestimonialsGridSection,
  TestimonialsSection
} from "../../lib/types";
import { Label } from "../Label";
import { Testimonial } from "../Testimonial";

export function Testimonials({ section }: { section: TestimonialsSection }) {
  if (!section.testimonials) return null;

  return (
    <section className="testimonials _container _page-spacing-top">
      <Label
        text="Previous collaborators say"
        className="testimonials-label"
        readMore={section.readMore}
      />

      <div className="testimonials-container">
        {section.testimonials.map((testimonial) => (
          <div className="testimonials-slide" key={testimonial.id}>
            <Testimonial testimonial={testimonial} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function TestimonialsGrid({
  section
}: {
  section: TestimonialsGridSection;
}) {
  return (
    <section className="testimonials-grid _container _page-spacing-top">
      <div className="testimonials-qualities">
        <h3 className="testimonials-qualities-heading _text-h5">
          Most mentioned qualities:
        </h3>
        <div className="testimonials-qualities-grid">
          {section.qualities.map((quality) => (
            <span className="testimonials-quality-tag" key={quality.label}>
              {quality.label}
              <small className="testimonials-quality-count">
                {`${quality.count}×`}
              </small>
            </span>
          ))}
        </div>
      </div>

      <div className="testimonials-grid-container">
        {section.testimonials.map((testimonial) => (
          <div className="testimonials-grid-item" key={testimonial.id}>
            <Testimonial testimonial={testimonial} />
          </div>
        ))}
      </div>
    </section>
  );
}
