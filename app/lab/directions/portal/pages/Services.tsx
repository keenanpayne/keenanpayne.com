import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  Heading,
  Icon,
  Intro,
  introOf,
  NewsList,
  QuotePromo,
  Sprite,
  TitleBar
} from "../parts";
import { ITEMS, type Item } from "../sprites";

const SEQUENCE = [
  [
    "Listen",
    "We talk through your goals, audience, constraints, and what success looks like."
  ],
  [
    "Plan",
    "A clear scope, timeline, and budget, so there are no surprises later."
  ],
  [
    "Build",
    "Regular check-ins and working previews as the project comes together."
  ],
  [
    "Launch",
    "A careful release, documentation for your team, and support after launch."
  ]
];

/** One power-up per service, cycled in order */
export const SERVICE_ITEMS: Item[] = [
  "paper",
  "pencil",
  "star",
  "wrench",
  "case",
  "heart",
  "mail",
  "question"
];

export const serviceItem = (index: number) =>
  SERVICE_ITEMS[Math.max(0, index) % SERVICE_ITEMS.length];

/** The project process as a level select: World 1-1 through 1-4 */
export const Worlds = () => (
  <ol className="pt-worlds">
    {SEQUENCE.map(([title, copy], index) => (
      <li key={title}>
        <span className="pt-worlds__label">World 1-{index + 1}</span>
        <h3 className="pt-worlds__title">{title}</h3>
        <p>{copy}</p>
      </li>
    ))}
  </ol>
);

export function Services({
  page,
  content
}: {
  page: BasicPageModel;
  content: LabContent;
}) {
  const intro = introOf(page);

  return (
    <>
      <TitleBar
        title="Services"
        images={content.work.slice(3, 7).map((item) => item.coverSquare)}
      />
      <Intro heading={intro?.heading} lede={intro?.subheading} />

      <section className="pt-section">
        <Heading>Explore these service categories</Heading>
        <ul className="pt-tiles">
          {content.services.map((service, index) => (
            <li className="pt-tile" key={service.url}>
              <a className="pt-tile__head" href={service.url}>
                <Icon name="star" />
                <span>{service.title}</span>
              </a>
              <a
                className="pt-tile__screen"
                href={service.url}
                tabIndex={-1}
                style={{ "--hue": index * 37 } as React.CSSProperties}
              >
                <Sprite art={ITEMS[serviceItem(index)]} scale={5} />
              </a>
              {service.lede && <p className="pt-tile__copy">{service.lede}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section className="pt-section">
        <Heading>How it works</Heading>
        <Worlds />
      </section>

      <div className="pt-pair">
        <section className="pt-section">
          <Heading>Service manual</Heading>
          <NewsList
            items={content.services.map((service, index) => ({
              href: service.url,
              title: service.title,
              item: serviceItem(index)
            }))}
          />
        </section>
        <section className="pt-section">
          <Heading>Clients’ choice</Heading>
          <QuotePromo testimonial={content.testimonials[1]} />
        </section>
      </div>
    </>
  );
}
