import { introOf, type TemplateProps } from "../../../site";
import {
  Clients,
  Contents,
  Layout,
  PageHeader,
  Quotes,
  Section,
  WorkCard
} from "../parts";

export function Work({ page, content }: TemplateProps<"work">) {
  const intro = introOf(page);
  const { work } = content;
  const industries = new Set(work.map((item) => item.industry).filter(Boolean));

  return (
    <Layout
      rail={
        <Contents
          chapters={[
            { id: "clients", label: "Clients" },
            { id: "case-studies", label: "Case studies" },
            { id: "kind-words", label: "Kind words" }
          ]}
        />
      }
    >
      <PageHeader title={intro?.heading ?? "Work"} lede={intro?.subheading}>
        <p className="st-pageMeta">
          <span>{`${work.length} case studies`}</span>
          <span>{`${industries.size} industries`}</span>
        </p>
      </PageHeader>

      <Section id="clients" title="Clients">
        <Clients work={work} />
      </Section>

      <Section id="case-studies" title="Case studies">
        <div className="st-cards">
          {work.map((item) => (
            <WorkCard key={item.url} item={item} />
          ))}
        </div>
      </Section>

      <Section id="kind-words" title="Kind words">
        <Quotes testimonials={content.testimonials} />
      </Section>
    </Layout>
  );
}
