import { introOf, type TemplateProps } from "../../../site";
import { KindWords, PageHeader, Section, WorkGrid } from "../parts";

export function Work({ page, content }: TemplateProps<"work">) {
  const intro = introOf(page);

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title={intro?.heading ?? "Case studies"}
        lede={intro?.subheading}
      />

      <Section title="Index of projects">
        <table className="wireframe-table">
          <thead>
            <tr>
              <th scope="col">Client</th>
              <th scope="col">Industry</th>
              <th scope="col">Role</th>
              <th scope="col">Years</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Selected work">
        <WorkGrid work={content.work} />
      </Section>

      <KindWords testimonials={content.testimonials} />
    </>
  );
}
