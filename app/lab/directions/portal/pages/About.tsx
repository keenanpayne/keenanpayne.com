import type { BasicPageModel, LabContent } from "../../../../lib/types";
import { Html, introOf, pad, relabel, useTo } from "../../../site";
import {
  Directory,
  Heading,
  Icon,
  Intro,
  KeySection,
  TitleBar
} from "../parts";

// Portal's voice for the shared profile facts
export const FACT_LABELS = {
  role: "Class:",
  location: "Home base:",
  experience: "Experience:",
  previously: "Previous level:",
  shows: "Shows a year:",
  offDuty: "Side quests:"
};

/** Card with a house tab, like the old "Our address" box */
export function Address({
  profile,
  children
}: {
  profile: LabContent["profile"];
  children?: React.ReactNode;
}) {
  const to = useTo();

  return (
    <div className="pt-address">
      <p className="pt-address__label">
        <span>
          <Icon name="house" />
        </span>
        Home base
      </p>
      <p className="pt-address__body">
        {profile.name}
        <br />
        {profile.location.name}
        <br />
        {profile.location.timeZoneName}
      </p>
      <p className="pt-address__foot">
        Got a question or general comment?{" "}
        <a href={to("/contact/")}>E-mail me</a>
      </p>
      {children}
    </div>
  );
}

export function About({
  page,
  content
}: {
  page: BasicPageModel;
  content: LabContent;
}) {
  const intro = introOf(page);
  const to = useTo();

  const { facts, photos } = content.profile;

  const rows: [string, React.ReactNode][] = relabel(facts, FACT_LABELS).map(
    (fact) => [
      fact.label,
      fact.url ? (
        <a className="pt-tri" href={fact.url}>
          {fact.text}
        </a>
      ) : (
        fact.text
      )
    ]
  );
  // Tally the archive right after the previous level
  rows.splice(
    facts.findIndex((fact) => fact.id === "previously") + 1,
    0,
    [
      "Case studies:",
      <a className="pt-tri" href={to("/portfolio/")}>
        {pad(content.work.length)} on file
      </a>
    ],
    [
      "Articles:",
      <a className="pt-tri" href={to("/archive/")}>
        {pad(content.posts.length)} published
      </a>
    ]
  );
  rows.push([
    "Elsewhere:",
    <span className="pt-dir__links">
      {content.socials.map((social) => (
        <a
          key={social.url}
          className="pt-tri"
          href={social.url}
          rel={social.rel}
        >
          {social.text}
        </a>
      ))}
    </span>
  ]);

  return (
    <>
      <TitleBar title="About" images={photos.map((photo) => photo.src)} />

      <div className="pt-split">
        <aside className="pt-split__aside">
          <Address profile={content.profile} />
          <figure className="pt-player">
            <img src={photos[0].src} alt={photos[0].alt} />
            <figcaption>
              <span className="pt-player__tag">1P</span>
              {content.profile.name.split(" ")[0]}
            </figcaption>
          </figure>
        </aside>

        <div className="pt-split__main">
          <Intro heading={intro?.heading} lede={intro?.subheading} />
          <Directory title="Player profile" rows={rows} />
          {intro?.body && (
            <KeySection title="Bio" toKey={false}>
              <Html className="pt-prose" html={intro.body} />
            </KeySection>
          )}
        </div>
      </div>

      <section className="pt-section">
        <Heading>Photo album</Heading>
        <ul className="pt-album">
          {photos.map((photo, index) => (
            <li key={photo.src}>
              <figure>
                <img src={photo.src} alt={photo.alt} loading="lazy" />
                <figcaption>
                  <span>Pic {pad(index + 1)}</span>
                  {photo.alt}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
