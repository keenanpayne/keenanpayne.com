import type { BasicPageModel, LabContent } from "../../../../lib/types";
import { introOf } from "../../../site";
import {
  ArrowCircle,
  Banner,
  KindWords,
  PageHeader,
  Section,
  WorkGrid
} from "../parts";

export function Work({
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
        icon="grid"
        eyebrow="Work"
        title={intro?.heading ?? "Case studies"}
        lede={intro?.subheading}
      />

      <Section icon="list" label="Index of projects">
        <table className="mg-table">
          <thead>
            <tr>
              <th scope="col">Client</th>
              <th scope="col">Industry</th>
              <th scope="col">Role</th>
              <th scope="col">Years</th>
              <th scope="col">
                <span className="mg-visually-hidden">Link</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {content.work.map((item) => (
              <tr key={item.url}>
                <th scope="row">
                  <a href={item.url}>{item.name}</a>
                </th>
                <td>{item.industry}</td>
                <td>{item.role}</td>
                <td>{item.year}</td>
                <td>
                  <ArrowCircle />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section icon="grid" label="Selected work">
        <WorkGrid work={content.work} />
      </Section>

      <Banner />

      <KindWords testimonials={content.testimonials} />
    </>
  );
}
