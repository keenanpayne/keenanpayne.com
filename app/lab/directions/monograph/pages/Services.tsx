import type { BasicPageModel, LabContent } from "../../../../lib/types";
import { introOf } from "../../../site";
import {
  Banner,
  KindWords,
  PageHeader,
  Section,
  ServicesLedger
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
        icon="list"
        eyebrow="Services"
        title={intro?.heading ?? "Services"}
        lede={intro?.subheading}
      />

      <Section icon="list" label="Services I offer">
        <ServicesLedger services={content.services} />
      </Section>

      <Section icon="spark" label="How we’ll work together">
        <ol className="mg-row mg-row--quarters mg-steps">
          {content.profile.process.map((step, index) => (
            <li className="mg-card" key={step.title}>
              <span className="mg-steps__number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mg-card__title">{step.title}</h3>
              <p className="mg-copy">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Banner />

      <KindWords testimonials={content.testimonials} />
    </>
  );
}
