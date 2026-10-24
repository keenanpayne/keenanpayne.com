import { introOf, sectionOf, titleOf, type TemplateProps } from "../../../site";
import { Chip, KANA, PageHeader, Quotes, Section, toneAt } from "../parts";

export function Testimonials({ page }: TemplateProps<"testimonials">) {
  const intro = introOf(page);
  const grid = sectionOf(page, "testimonials-grid");

  return (
    <>
      <PageHeader
        eyebrow="Testimonials"
        title={titleOf(page)}
        lede={intro?.subheading}
        kana={KANA.testimonials}
        emblem="bloom"
      >
        {grid && grid.qualities.length > 0 && (
          <ul className="neon-chips" aria-label="Most mentioned qualities">
            {grid.qualities.map((quality, index) => (
              <li key={quality.label}>
                <Chip tone={toneAt(index)}>
                  {quality.label}{" "}
                  <span className="neon-chip__count">{quality.count}</span>
                </Chip>
              </li>
            ))}
          </ul>
        )}
      </PageHeader>

      {grid && (
        <Section
          title={`${grid.testimonials.length} kind words`}
          kana={KANA.testimonials}
          tone="violet"
        >
          <Quotes testimonials={grid.testimonials} />
        </Section>
      )}
    </>
  );
}
