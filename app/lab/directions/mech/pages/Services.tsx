import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  Alert,
  introOf,
  KindWords,
  Magi,
  pad,
  PageHeader,
  Readout,
  Section,
  ServicesList
} from "../parts";

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
      <PageHeader
        episode="Episode:04"
        eyebrow="Services"
        jp="業務"
        title={intro?.heading ?? "Services"}
        lede={intro?.subheading}
        aside={
          <dl className="mc-readouts mc-readouts--grid">
            <Readout
              label="Systems online"
              value={pad(content.services.length, 3)}
              tone="green"
            />
            <Readout label="Status" value="Nominal" tone="green" />
          </dl>
        }
      />

      <Section label="Magi system" jp="三賢者" code="Select a system">
        <Magi services={content.services} />
      </Section>

      <Section label="System manifest" jp="一覧">
        <ServicesList services={content.services} />
      </Section>

      <Section label="Launch sequence" jp="発進" code="4 stages">
        <ol className="mc-sequence">
          {SEQUENCE.map(([title, copy], index) => (
            <li key={title}>
              <span className="mc-sequence__stage">Stage {pad(index + 1)}</span>
              <h3 className="mc-sequence__title">{title}</h3>
              <p className="mc-card__copy">{copy}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Alert />

      <KindWords testimonials={content.testimonials} />
    </>
  );
}
