import { Html, introOf, type TemplateProps } from "../../../site";
import { Facts, PageHeader, Section } from "../parts";

export function About({ page, content }: TemplateProps<"about">) {
  const intro = introOf(page);
  const { facts, photos } = content.profile;

  return (
    <>
      <PageHeader
        eyebrow="About"
        title={intro?.heading ?? "About"}
        lede={intro?.subheading}
      />

      {intro?.body && <Html className="wireframe-prose" html={intro.body} />}

      <Section title="At a glance">
        <Facts
          rows={[
            ...facts.map((fact): [string, React.ReactNode] => [
              fact.label,
              fact.url ? <a href={fact.url}>{fact.text}</a> : fact.text
            ]),
            [
              "Elsewhere",
              content.socials.map((social, index) => (
                <span key={social.url}>
                  {index > 0 && ", "}
                  <a href={social.url} rel={social.rel}>
                    {social.text}
                  </a>
                </span>
              ))
            ]
          ]}
        />
      </Section>

      <Section title="Photos">
        <div className="wireframe-grid">
          {photos.map((photo) => (
            <figure key={photo.src}>
              <img src={photo.src} alt={photo.alt} loading="lazy" />
              <figcaption>{photo.alt}</figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}
