import { socials } from "../../../../data/socials";
import type { BasicPageModel, LabContent } from "../../../../lib/types";
import {
  Directory,
  Heading,
  Html,
  Icon,
  Intro,
  introOf,
  KeySection,
  pad,
  TitleBar,
  useTo
} from "../parts";

export const PHOTOS = [
  {
    src: "https://res.cloudinary.com/keenan-payne/image/upload/f_auto,q_auto,w_800/v1666204078/people/me/jun-27-2021_o8sd0l.jpg",
    alt: "Me in grayscale"
  },
  {
    src: "https://res.cloudinary.com/keenan-payne/image/upload/f_auto,q_auto,w_800/v1666204077/people/me/dec-26-2021_iuhh3w.jpg",
    alt: "Me being cold"
  },
  {
    src: "https://res.cloudinary.com/keenan-payne/image/upload/f_auto,q_auto,w_800/v1666204078/people/me/jul-5-2020_lwglyk.jpg",
    alt: "Hanging out with my high school buddies"
  }
];

/** Card with a house tab, like the old "Our address" box */
export function Address({ children }: { children?: React.ReactNode }) {
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
        Keenan Payne
        <br />
        Denver, Colorado
        <br />
        Mountain Time
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

  const facts: [string, React.ReactNode][] = [
    ["Class:", "Full-stack web developer & designer"],
    ["Home base:", "Denver, Colorado"],
    ["Experience:", "Eighteen years on the web"],
    [
      "Previous level:",
      <a className="pt-tri" href={to("/portfolio/asana/")}>
        Asana, 2014–2019
      </a>
    ],
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
    ],
    ["Shows a year:", "About thirty"],
    ["Side quests:", "Magic: The Gathering, travel, family"],
    [
      "Elsewhere:",
      <span className="pt-dir__links">
        {[1, 4, 6, 2].map((id) => (
          <a
            key={id}
            className="pt-tri"
            href={socials[id].url}
            rel={socials[id].name === "Mastodon" ? "me" : undefined}
          >
            {socials[id].name}
          </a>
        ))}
      </span>
    ]
  ];

  return (
    <>
      <TitleBar title="About" images={PHOTOS.map((photo) => photo.src)} />

      <div className="pt-split">
        <aside className="pt-split__aside">
          <Address />
          <figure className="pt-player">
            <img src={PHOTOS[0].src} alt={PHOTOS[0].alt} />
            <figcaption>
              <span className="pt-player__tag">1P</span>
              Keenan
            </figcaption>
          </figure>
        </aside>

        <div className="pt-split__main">
          <Intro heading={intro?.heading} lede={intro?.subheading} />
          <Directory title="Player profile" rows={facts} />
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
          {PHOTOS.map((photo, index) => (
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
