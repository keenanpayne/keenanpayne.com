import { introOf, type TemplateProps } from "../../../site";
import { KindWords, PageHeader, Section, ServiceList } from "../parts";

export function Services({ page, content }: TemplateProps<"services">) {
  const intro = introOf(page);

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title={intro?.heading ?? "Services"}
        lede={intro?.subheading}
      />

      <Section title="Services I offer">
        <ServiceList services={content.services} />
      </Section>

      <Section title="How we’ll work together">
        <ol className="wireframe-list">
          {content.profile.process.map((step) => (
            <li key={step.title}>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <KindWords testimonials={content.testimonials} />
    </>
  );
}
