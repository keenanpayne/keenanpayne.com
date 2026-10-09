import { introOf, pad, useTo, type TemplateProps } from "../../../site";
import {
  Button,
  Contents,
  Layout,
  PageHeader,
  Quotes,
  Section,
  ServiceCards
} from "../parts";

export function Services({ page, content }: TemplateProps<"services">) {
  const to = useTo();
  const intro = introOf(page);

  return (
    <Layout
      rail={
        <Contents
          chapters={[
            { id: "offer", label: "What I offer" },
            { id: "process", label: "How it works" },
            { id: "kind-words", label: "Kind words" }
          ]}
        />
      }
    >
      <PageHeader title={intro?.heading ?? "Services"} lede={intro?.subheading}>
        <p className="st-actions">
          <Button href={to("/project-inquiry/")} arrow>
            Start a project
          </Button>
        </p>
      </PageHeader>

      <Section id="offer" title="What I offer">
        <ServiceCards services={content.services} />
      </Section>

      <Section id="process" title="How we’ll work together">
        <ol className="st-steps">
          {content.profile.process.map((step, index) => (
            <li key={step.title}>
              <span className="st-steps__count">{pad(index + 1)}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="kind-words" title="Kind words">
        <Quotes testimonials={content.testimonials} />
      </Section>
    </Layout>
  );
}
