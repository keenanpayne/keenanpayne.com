import type { BasicPageModel, LabContent } from "../../../../lib/types";
import { Html, introOf } from "../../../site";
import { Icon, PageHeader, Section } from "../parts";

export function About({
  page,
  content
}: {
  page: BasicPageModel;
  content: LabContent;
}) {
  const intro = introOf(page);
  const { facts, photos } = content.profile;

  const rows: [string, React.ReactNode][] = [
    ...facts.map((fact): [string, React.ReactNode] => [
      fact.label,
      fact.url ? <a href={fact.url}>{fact.text}</a> : fact.text
    ]),
    [
      "Elsewhere",
      content.socials.map((social, index) => (
        <span key={social.url}>
          {index > 0 && " – "}
          <a href={social.url} rel={social.rel}>
            {social.text}
          </a>
        </span>
      ))
    ]
  ];

  return (
    <>
      <PageHeader
        icon="user"
        eyebrow="About"
        title={intro?.heading ?? "About"}
        lede={intro?.subheading}
      />

      <section className="mg-section mg-about">
        <div className="mg-about__body">
          <p className="mg-label">
            <Icon name="pen" />
            In brief
          </p>
          {intro?.body && <Html className="mg-prose" html={intro.body} />}
        </div>

        <aside className="mg-about__aside">
          <p className="mg-label">
            <Icon name="list" />
            At a glance
          </p>
          <dl className="mg-facts">
            {rows.map(([term, detail]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <Section icon="camera" label="Photos of me and others">
        <div className="mg-row mg-row--thirds mg-photos">
          {photos.map((photo) => (
            <figure className="mg-card" key={photo.src}>
              <div className="mg-figure mg-figure--portrait">
                <img src={photo.src} alt={photo.alt} loading="lazy" />
              </div>
              <figcaption className="mg-meta">{photo.alt}</figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}
