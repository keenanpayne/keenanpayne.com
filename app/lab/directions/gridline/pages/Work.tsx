import {
  industriesOf,
  introOf,
  quotesOf,
  type TemplateProps,
  titleOf,
  yearsOf
} from "../../../site";
import {
  Band,
  Facts,
  KindWords,
  PageHeader,
  SectionHead,
  WorkCards
} from "../parts";

export function Work({ page, content }: TemplateProps<"work">) {
  const intro = introOf(page);
  const { work } = content;
  const since = Math.min(
    ...work.flatMap((item) => yearsOf(item.year)?.[0] ?? [])
  );

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title={titleOf(page)}
        lede={intro?.subheading}
        aside={
          <Facts
            rows={[
              ["Projects", work.length],
              ["Industries", industriesOf(work).size],
              ["Since", since]
            ]}
          />
        }
      />

      <Band>
        <SectionHead eyebrow="Index" title="Every project" />
        <div className="gl-table-wrap">
          <table className="gl-table">
            <thead>
              <tr>
                <th scope="col">Client</th>
                <th scope="col">Industry</th>
                <th scope="col">Role</th>
                <th scope="col">Years</th>
              </tr>
            </thead>
            <tbody>
              {work.map((item) => (
                <tr key={item.url}>
                  <th scope="row">
                    <a href={item.url}>{item.name}</a>
                  </th>
                  <td>{item.industry}</td>
                  <td>{item.role}</td>
                  <td className="gl-meta">{item.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Band>

      <Band className="gl-band--gray">
        <SectionHead eyebrow="Case studies" title="Selected work" />
        <WorkCards work={work} />
      </Band>

      <KindWords testimonials={quotesOf(page, content)} />
    </>
  );
}
