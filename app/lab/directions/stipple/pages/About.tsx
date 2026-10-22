import {
  coordinates,
  Html,
  introOf,
  LocalTime,
  relabel,
  type TemplateProps,
  titleOf
} from "../../../site";
import {
  Contents,
  Entries,
  Facts,
  hostOf,
  Layout,
  PageHeader,
  Section,
  Stipple
} from "../parts";
import { Strata } from "../Strata";

export function About({ page, content }: TemplateProps<"about">) {
  const intro = introOf(page);
  const { facts, location, photos } = content.profile;

  return (
    <>
      <Strata className="st-vista" content={content} />

      <Layout
        rail={
          <Contents
            chapters={[
              ...(intro?.body ? [{ id: "story", label: "Story" }] : []),
              { id: "at-a-glance", label: "At a glance" },
              { id: "photographs", label: "Photographs" },
              { id: "elsewhere", label: "Elsewhere" }
            ]}
          />
        }
      >
        <PageHeader title={titleOf(page)} lede={intro?.subheading} />

        {intro?.body && (
          <Section id="story" title="Story">
            <Html className="st-prose" html={intro.body} />
          </Section>
        )}

        <Section id="at-a-glance" title="At a glance">
          <Facts
            rows={[
              ...relabel(facts, { location: "Home base" }).map(
                (fact): [string, React.ReactNode] => [
                  fact.label,
                  fact.url ? <a href={fact.url}>{fact.text}</a> : fact.text
                ]
              ),
              ["Coordinates", coordinates(location)],
              ["Local time", <LocalTime placeholder="—" />]
            ]}
          />
        </Section>

        <Section id="photographs" title="Photographs">
          <div className="st-photos">
            {photos.map((photo) => (
              <figure key={photo.src}>
                <Stipple src={photo.src} alt={photo.alt} />
                <figcaption>{photo.alt}</figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <Section id="elsewhere" title="Elsewhere">
          <Entries
            size="medium"
            items={content.socials.map((social) => ({
              url: social.url,
              title: social.text,
              meta: [hostOf(social.url)]
            }))}
          />
        </Section>
      </Layout>
    </>
  );
}
