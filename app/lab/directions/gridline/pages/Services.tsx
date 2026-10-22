import { introOf, quotesOf, type TemplateProps, titleOf } from "../../../site";
import {
  Band,
  KindWords,
  PageHeader,
  ProcessSteps,
  SectionHead,
  ServiceCells
} from "../parts";

export function Services({ page, content }: TemplateProps<"services">) {
  const intro = introOf(page);

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title={titleOf(page)}
        lede={intro?.subheading}
      />

      <Band>
        <SectionHead
          index={1}
          eyebrow="Offering"
          title="Services I offer"
          description="Each one stands alone, or combines with the others into a whole project."
        />
        <ServiceCells services={content.services} />
      </Band>

      <Band invert>
        <SectionHead
          index={2}
          eyebrow="Process"
          title="How we’ll work together"
        />
        <ProcessSteps steps={content.profile.process} />
      </Band>

      <KindWords testimonials={quotesOf(page, content)} index={3} />
    </>
  );
}
