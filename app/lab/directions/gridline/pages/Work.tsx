import { introOf, quotesOf, type TemplateProps } from "../../../site";
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
  const industries = new Set(work.map((item) => item.industry).filter(Boolean));

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title={intro?.heading ?? "Case studies"}
        lede={intro?.subheading}
        aside={
          <Facts
            rows={[
              ["Projects", work.length],
              ["Industries", industries.size],
              [
                "Since",
                work
                  .map((item) => item.year?.slice(0, 4))
                  .filter(Boolean)
                  .sort()[0]
              ]
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

      <Band invert>
        <SectionHead eyebrow="Case studies" title="Selected work" />
        <WorkCards work={work} />
      </Band>

      <KindWords testimonials={quotesOf(page, content)} />
    </>
  );
}
