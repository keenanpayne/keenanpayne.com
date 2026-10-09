import type { BasicPageModel, LabContent } from "../../../../lib/types";
import { introOf, pad } from "../../../site";
import {
  Alert,
  KindWords,
  Magi,
  PageHeader,
  Readout,
  Section,
  ServicesList
} from "../parts";

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

      <Section
        label="Launch sequence"
        jp="発進"
        code={`${content.profile.process.length} stages`}
      >
        <ol className="mc-sequence">
          {content.profile.process.map((step, index) => (
            <li key={step.title}>
              <span className="mc-sequence__stage">Stage {pad(index + 1)}</span>
              <h3 className="mc-sequence__title">{step.title}</h3>
              <p className="mc-card__copy">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Alert />

      <KindWords testimonials={content.testimonials} />
    </>
  );
}
