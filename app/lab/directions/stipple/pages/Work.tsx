import { useState } from "react";

import { introOf, type TemplateProps } from "../../../site";
import {
  Clients,
  Contents,
  Layout,
  Ledger,
  PageHeader,
  Quotes,
  Section,
  ViewSwitch,
  WorkCard
} from "../parts";

type View = "index" | "plates";

const VIEWS: { value: View; label: string }[] = [
  { value: "index", label: "Index" },
  { value: "plates", label: "Plates" }
];

export function Work({ page, content }: TemplateProps<"work">) {
  const [view, setView] = useState<View>("index");
  const intro = introOf(page);
  const { work } = content;
  const industries = new Set(work.map((item) => item.industry).filter(Boolean));
  const index = view === "index";

  return (
    <Layout
      wide={index}
      rail={
        !index && (
          <Contents
            chapters={[
              { id: "clients", label: "Clients" },
              { id: "case-studies", label: "Case studies" },
              { id: "kind-words", label: "Kind words" }
            ]}
          />
        )
      }
    >
      <PageHeader title={intro?.heading ?? "Work"} lede={intro?.subheading}>
        <p className="st-pageMeta">
          <span>{`${work.length} case studies`}</span>
          <span>{`${industries.size} industries`}</span>
          <ViewSwitch
            label="Show the work as"
            views={VIEWS}
            value={view}
            onChange={setView}
          />
        </p>
      </PageHeader>

      {index ? (
        <Section id="clients" title="Clients">
          <Ledger work={work} />
        </Section>
      ) : (
        <>
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
        </>
      )}

      <Section id="kind-words" title="Kind words">
        <Quotes testimonials={content.testimonials} />
      </Section>
    </Layout>
  );
}
