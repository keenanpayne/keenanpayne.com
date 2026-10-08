import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  Alert,
  introOf,
  KindWords,
  pad,
  PageHeader,
  Readout,
  Section,
  Tri,
  UnitGrid,
  unitCode
} from "../parts";

export function Work({
  page,
  content
}: {
  page: BasicPageModel;
  content: LabContent;
}) {
  const intro = introOf(page);
  const industries = new Set(
    content.work.map((item) => item.industry?.split(" — ")[0])
  );

  return (
    <>
      <PageHeader
        episode="Episode:01"
        eyebrow="Work"
        jp="作品"
        title={intro?.heading ?? "Case studies"}
        lede={intro?.subheading}
        aside={
          <dl className="mc-readouts mc-readouts--grid">
            <Readout
              label="Units"
              value={pad(content.work.length, 3)}
              tone="green"
            />
            <Readout
              label="Sectors"
              value={pad(industries.size, 3)}
              tone="green"
            />
          </dl>
        }
      />

      <Section label="Unit registry" jp="登録" code="Sorted by priority">
        <div className="mc-tableWrap">
          <table className="mc-table">
            <thead>
              <tr>
                <th scope="col">Unit</th>
                <th scope="col">Client</th>
                <th scope="col">Sector</th>
                <th scope="col">Role</th>
                <th scope="col">Years</th>
                <th scope="col">
                  <span className="mc-visually-hidden">Link</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {content.work.map((item, index) => (
                <tr key={item.url}>
                  <td className="mc-table__code">{unitCode(index)}</td>
                  <th scope="row">
                    <a href={item.url}>{item.name}</a>
                  </th>
                  <td>{item.industry}</td>
                  <td>{item.role}</td>
                  <td className="mc-table__num">{item.year}</td>
                  <td className="mc-table__go">
                    <Tri />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section label="Units deployed" jp="機体">
        <UnitGrid work={content.work} />
      </Section>

      <Alert />

      <KindWords testimonials={content.testimonials} />
    </>
  );
}
