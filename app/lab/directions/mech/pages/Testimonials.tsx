import type { BasicPageModel } from "../../../../lib/types";
import {
  Alert,
  introOf,
  pad,
  PageHeader,
  Panel,
  Section,
  sectionOf,
  Transmission
} from "../parts";

export function Testimonials({ page }: { page: BasicPageModel }) {
  const intro = introOf(page);
  const grid = sectionOf(page, "testimonials-grid");
  const max = Math.max(1, ...(grid?.qualities.map((q) => q.count) ?? []));

  return (
    <>
      <PageHeader
        episode="Episode:05"
        eyebrow="Testimonials"
        jp="証言"
        title={intro?.heading ?? "Testimonials"}
        lede={intro?.subheading}
        aside={
          grid &&
          grid.qualities.length > 0 && (
            <Panel label="Signal analysis" code="Most mentioned">
              <ul className="mc-levels">
                {grid.qualities.map((quality) => (
                  <li key={quality.label}>
                    <span className="mc-levels__label">{quality.label}</span>
                    <span
                      className="mc-levels__bar"
                      style={
                        {
                          "--level": quality.count / max
                        } as React.CSSProperties
                      }
                      aria-hidden="true"
                    />
                    <span className="mc-levels__value">
                      {pad(quality.count)}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )
        }
      />

      {grid && (
        <Section
          label="Intercepted transmissions"
          jp="傍受"
          code={`${grid.testimonials.length} received`}
        >
          <div className="mc-masonry">
            {grid.testimonials.map((testimonial, index) => (
              <Transmission
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        </Section>
      )}

      <Alert heading="Want to be next?" />
    </>
  );
}
