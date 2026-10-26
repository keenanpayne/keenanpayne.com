import { useState } from "react";

import {
  industriesOf,
  introOf,
  quotesOf,
  type TemplateProps,
  titleOf
} from "../../../site";
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

export type WorkView = "index" | "plates";

/** How the page shows the work: as an index, or as plates */
export const WORK_VIEWS: { value: WorkView; label: string }[] = [
  { value: "index", label: "Index" },
  { value: "plates", label: "Plates" }
];

export function Work({ page, content }: TemplateProps<"work">) {
  const [view, setView] = useState<WorkView>("index");
  const intro = introOf(page);
  const { work } = content;
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
      <PageHeader title={titleOf(page)} lede={intro?.subheading}>
        <p className="st-pageMeta">
          <span>{`${work.length} case studies`}</span>
          <span>{`${industriesOf(work).size} industries`}</span>
          <ViewSwitch
            label="Show the work as"
            views={WORK_VIEWS}
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
        <Quotes testimonials={quotesOf(page, content)} />
      </Section>
    </Layout>
  );
}
