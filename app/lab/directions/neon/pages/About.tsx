import { Html, introOf, titleOf, type TemplateProps } from "../../../site";
import { Billboard } from "../Billboard";
import { Facts, floorOf, KANA, PageHeader, Section } from "../parts";

export function About({ page, content }: TemplateProps<"about">) {
  const intro = introOf(page);
  const { facts, photos, avatar, name } = content.profile;

  return (
    <>
      <PageHeader
        eyebrow="About"
        title={titleOf(page)}
        lede={intro?.subheading}
        kana={KANA.about}
        emblem="globe"
      />

      <div className="neon-split">
        {intro?.body && <Html className="neon-prose" html={intro.body} />}
        <Billboard src={avatar} alt={name} className="neon-split__billboard" />
      </div>

      <Section
        title="At a glance"
        kana={KANA.glance}
        floor={floorOf(0, 2)}
        tone="cyan"
      >
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

      <Section
        title="Photos"
        kana={KANA.photos}
        floor={floorOf(1, 2)}
        tone="pink"
      >
        <div className="neon-photos">
          {photos.map((photo) => (
            <figure key={photo.src} className="neon-photo">
              <div className="neon-photo__screen">
                <img src={photo.src} alt={photo.alt} loading="lazy" />
              </div>
              <figcaption>{photo.alt}</figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}
