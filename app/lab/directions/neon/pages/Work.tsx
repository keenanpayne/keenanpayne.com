import { introOf, quotesOf, titleOf, type TemplateProps } from "../../../site";
import {
  floorOf,
  KANA,
  KindWords,
  PageHeader,
  Section,
  toneAt,
  WorkGrid
} from "../parts";

export function Work({ page, content }: TemplateProps<"work">) {
  const intro = introOf(page);
  const quotes = quotesOf(page, content);
  const floors = quotes.length ? 3 : 2;

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title={titleOf(page)}
        lede={intro?.subheading}
        kana={KANA.work}
        emblem="quarters"
      />

      <Section
        title="Index of projects"
        kana={KANA.index}
        floor={floorOf(0, floors)}
        tone="cyan"
      >
        <table className="neon-table neon-directory">
          <thead>
            <tr>
              <th scope="col">Client</th>
              <th scope="col">Industry</th>
              <th scope="col">Role</th>
              <th scope="col">Years</th>
            </tr>
          </thead>
          <tbody>
            {content.work.map((item, index) => (
              <tr key={item.url} className={`neon-tone--${toneAt(index + 1)}`}>
                <th scope="row">
                  <a href={item.url}>{item.name}</a>
                </th>
                <td>{item.industry}</td>
                <td>{item.role}</td>
                <td className="neon-directory__years">{item.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section
        title="Selected work"
        kana={KANA.work}
        floor={floorOf(1, floors)}
        tone="pink"
      >
        <WorkGrid work={content.work} />
      </Section>

      <KindWords testimonials={quotes} floor={floorOf(2, floors)} />
    </>
  );
}
