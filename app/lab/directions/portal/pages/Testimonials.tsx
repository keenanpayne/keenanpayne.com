import type { BasicPageModel, LabContent } from "../../../../lib/types";
import { introOf, pad, sectionOf } from "../../../site";
import { Heading, Intro, Quote, TitleBar } from "../parts";

export function Testimonials({
  page,
  content
}: {
  page: BasicPageModel;
  content: LabContent;
}) {
  const intro = introOf(page);
  const grid = sectionOf(page, "testimonials-grid");
  const testimonials = grid?.testimonials ?? content.testimonials;
  const qualities = (grid?.qualities ?? []).slice(0, 10);
  const max = Math.max(1, ...qualities.map((quality) => quality.count));

  return (
    <>
      <TitleBar
        title="Testimonials"
        images={testimonials.map((testimonial) => testimonial.person?.image)}
      />
      <Intro heading={intro?.heading} lede={intro?.subheading} />

      {qualities.length > 0 && (
        <section className="pt-section">
          <Heading>Top ten qualities</Heading>
          <ol className="pt-topten">
            {qualities.map((quality, index) => (
              <li key={quality.label}>
                <span className="pt-topten__rank">{index + 1}</span>
                <span className="pt-topten__label">{quality.label}</span>
                <span
                  className="pt-topten__bar"
                  style={
                    { "--level": quality.count / max } as React.CSSProperties
                  }
                  aria-hidden="true"
                />
                <span className="pt-topten__count">
                  {pad(quality.count)}
                  <span className="pt-visually-hidden"> mentions</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="pt-section">
        <Heading>Player reviews</Heading>
        <div className="pt-quotes">
          {testimonials.map((testimonial, index) => (
            <Quote
              key={testimonial.id}
              testimonial={testimonial}
              index={index}
            />
          ))}
        </div>
      </section>
    </>
  );
}
