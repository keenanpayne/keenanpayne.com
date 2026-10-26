import {
  introOf,
  pad,
  quotesOf,
  titleOf,
  type TemplateProps
} from "../../../site";
import {
  floorOf,
  KANA,
  KindWords,
  PageHeader,
  Section,
  ServiceList
} from "../parts";

export function Services({ page, content }: TemplateProps<"services">) {
  const intro = introOf(page);
  const quotes = quotesOf(page, content);
  const floors = quotes.length ? 3 : 2;

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title={titleOf(page)}
        lede={intro?.subheading}
        kana={KANA.services}
        emblem="orbit"
      />

      <Section
        title="Services I offer"
        kana={KANA.services}
        floor={floorOf(0, floors)}
        tone="amber"
      >
        <ServiceList services={content.services} />
      </Section>

      <Section
        title="How we’ll work together"
        kana={KANA.process}
        floor={floorOf(1, floors)}
        tone="cyan"
      >
        <ol className="neon-line">
          {content.profile.process.map((step, index) => (
            <li key={step.title} className="neon-line__stop">
              <span className="neon-line__number" aria-hidden="true">
                {pad(index + 1)}
              </span>
              <strong className="neon-line__title">{step.title}</strong>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <KindWords testimonials={quotes} floor={floorOf(2, floors)} />
    </>
  );
}
