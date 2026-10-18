import type { LabContent } from "../../../../lib/types";
import { homeWork, Html, useTo } from "../../../site";
import {
  Badge,
  GoDot,
  Heading,
  JumpMenu,
  NewsList,
  Pill,
  PostCard,
  postNews,
  Quote,
  QuotePromo,
  ratedTypes,
  TagStrip,
  Tile
} from "../parts";
import { FACE, MONITOR } from "../sprites";
import { serviceItem } from "./Services";

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
  const { profile } = content;
  const [promoted, ...reviews] = content.testimonials;
  const work = homeWork(content);

  return (
    <>
      <section className="pt-hero">
        <div className="pt-hero__screen">
          <div className="pt-hero__copy">
            <Logotype lines={profile.name.split(" ")} />
            <p className="pt-hero__tag">
              <GoDot />
              {profile.role}
            </p>
            <Html as="p" className="pt-hero__lede" html={profile.bio} />
          </div>

          <div className="pt-hero__art" aria-hidden="true">
            {work.slice(0, 3).map((item, index) => (
              <img
                key={item.url}
                className={`pt-hero__shot pt-hero__shot--${index + 1}`}
                src={item.cover}
                alt=""
              />
            ))}
            <span className="pt-hero__player">
              <img src={profile.avatar} alt="" />
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
          {work.map((item) => (
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
              options={ratedTypes(content.posts).map((type) => ({
                href: type.url,
                text: `${type.text}s`
              }))}
            />
          </Tile>
          <Tile title="Elsewhere" icon="house">
            <JumpMenu
              label="Sub categories"
              options={content.socials.map((social) => ({
                href: social.url,
                text: social.text
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
          <QuotePromo testimonial={promoted} />
        </section>
      </div>

      <div className="pt-pair">
        <section className="pt-section">
          <Heading more={{ href: to("/services/"), text: "Services" }}>
            Most wanted
          </Heading>
          <NewsList
            items={content.services.map((service, index) => ({
              href: service.url,
              title: service.title,
              lede: service.lede,
              item: serviceItem(index)
            }))}
          />
        </section>
        {reviews.length > 0 && (
          <section className="pt-section">
            <Heading more={{ href: to("/testimonials/"), text: "All reviews" }}>
              Player reviews
            </Heading>
            <div className="pt-quotes">
              {reviews.map((testimonial, index) => (
                <Quote
                  key={testimonial.id}
                  testimonial={testimonial}
                  index={index + 1}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
