import { socials } from "../../../../data/socials";
import type { LabContent } from "../../../../lib/types";
import {
  Badge,
  GoDot,
  Heading,
  JumpMenu,
  NewsList,
  Pill,
  PostCard,
  postNews,
  QuotePromo,
  RATING_TYPES,
  TagStrip,
  Tile,
  typePath,
  useTo
} from "../parts";
import { FACE, MONITOR } from "../sprites";

export const AVATAR =
  "https://res.cloudinary.com/keenan-payne/image/upload/f_auto,q_auto,c_fill,g_face,ar_1:1,w_320/v1666204078/people/me/jun-27-2021_o8sd0l.jpg";

/** Big title art, set like a game logo over a starfield */
export const Logotype = ({
  lines,
  as: Tag = "h1"
}: {
  lines: string[];
  as?: "h1" | "h2" | "p";
}) => (
  <Tag className="pt-logotype">
    {lines.map((line) => (
      <span key={line} className="pt-logotype__line" data-text={line}>
        {line}
      </span>
    ))}
    <svg
      className="pt-logotype__swoosh"
      viewBox="0 0 300 40"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M2 30C80 4 190-2 298 18 200 8 96 14 2 38Z" />
    </svg>
  </Tag>
);

export function Home({ content }: { content: LabContent }) {
  const to = useTo();
  const tiles = content.work.slice(0, Math.floor(content.work.length / 3) * 3);

  return (
    <>
      <section className="pt-hero">
        <div className="pt-hero__screen">
          <div className="pt-hero__copy">
            <Logotype lines={["Keenan", "Payne"]} />
            <p className="pt-hero__tag">
              <GoDot />
              Web developer &amp; designer
            </p>
            <p className="pt-hero__lede">
              I’m a full-stack web developer and designer with eighteen years of
              experience helping teams market and build products on the web. I
              spent five years growing the website at{" "}
              <a href={to("/portfolio/asana/")}>Asana</a>, and have since
              partnered with <a href={to("/portfolio/rippling/")}>Rippling</a>,{" "}
              <a href={to("/portfolio/gofundme/")}>GoFundMe</a>,{" "}
              <a href={to("/portfolio/neuralink/")}>Neuralink</a>, and many
              others. I also <a href={to("/archive/")}>write</a> about craft,
              career, and the occasional reflection.
            </p>
          </div>

          <div className="pt-hero__art" aria-hidden="true">
            {content.work.slice(0, 3).map((item, index) => (
              <img
                key={item.url}
                className={`pt-hero__shot pt-hero__shot--${index + 1}`}
                src={item.cover}
                alt=""
              />
            ))}
            <span className="pt-hero__player">
              <img src={AVATAR} alt="" />
              <span>1P</span>
            </span>
          </div>

          <TagStrip
            cells={[
              { label: "Plat form", art: MONITOR },
              { label: "Home page", art: FACE, href: to("/about/") },
              {
                badge: <Badge big="E" title="Rated E for Everyone" />
              }
            ]}
          />
        </div>

        <div className="pt-hero__bar">
          <Pill href={to("/contact/")} icon="mail" tone="dark">
            Contact
          </Pill>
          <p>E-mail me a question, or start a project inquiry.</p>
          <Pill href={to("/portfolio/")} icon="list" tone="dark">
            Master work list
          </Pill>
        </div>
      </section>

      <ul className="pt-games">
        {content.posts.slice(0, 3).map((post) => (
          <li key={post.url}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>

      <section className="pt-section">
        <Heading more={{ href: to("/portfolio/"), text: "All work" }}>
          Explore these case studies
        </Heading>
        <ul className="pt-tiles">
          {tiles.map((item) => (
            <Tile
              key={item.url}
              title={item.name}
              href={item.url}
              icon="case"
              image={item.cover}
            />
          ))}
          <Tile title="Services" href={to("/services/")} icon="wrench">
            <JumpMenu
              label="Sub categories"
              options={content.services.map((service) => ({
                href: service.url,
                text: service.title
              }))}
            />
          </Tile>
          <Tile title="Writing" href={to("/archive/")} icon="pencil">
            <JumpMenu
              label="Sub categories"
              options={RATING_TYPES.map((type) => ({
                href: to(typePath(type)),
                text: `${type}s`
              }))}
            />
          </Tile>
          <Tile title="Elsewhere" icon="house">
            <JumpMenu
              label="Sub categories"
              options={[1, 4, 6, 2, 3].map((id) => ({
                href: socials[id].url,
                text: socials[id].name
              }))}
            />
          </Tile>
        </ul>
      </section>

      <div className="pt-pair">
        <section className="pt-section">
          <Heading more={{ href: to("/archive/"), text: "Archive" }}>
            Latest news
          </Heading>
          <NewsList items={postNews(content.posts.slice(3, 8))} />
        </section>
        <section className="pt-section">
          <Heading>Clients’ choice</Heading>
          <QuotePromo testimonial={content.testimonials[0]} />
        </section>
      </div>
    </>
  );
}
