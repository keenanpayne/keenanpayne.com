import { socials } from "../../../data/socials";
import type { DirectionProps } from "..";

import stylesheet from "./mech.css?url";
import { About } from "./pages/About";
import { Archive } from "./pages/Archive";
import { CaseStudy } from "./pages/CaseStudy";
import { Contact } from "./pages/Contact";
import { Generic } from "./pages/Generic";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Post } from "./pages/Post";
import { Services } from "./pages/Services";
import { Testimonials } from "./pages/Testimonials";
import { Work } from "./pages/Work";
import { DenverStatus } from "./Denver";
import { BaseContext, HexOutline, Ticks } from "./parts";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Barlow:ital,wght@0,400;0,500;0,600;1,400&family=Shippori+Mincho+B1:wght@700;800&family=Share+Tech+Mono&display=swap";

const SOCIAL_IDS = [1, 4, 6, 2, 3];

const NAVIGATION = [
  { path: "/portfolio/", text: "Work" },
  { path: "/archive/", text: "Writing" },
  { path: "/about/", text: "About" },
  { path: "/services/", text: "Services" },
  { path: "/contact/", text: "Contact" }
];

/** Picks the Mech layout for the site page being mocked up */
function PageBody({ path, page, notFound, content }: DirectionProps) {
  if (path === "/") return <Home content={content} />;
  if (notFound || !page) return <NotFound />;
  if (page.layout === "post") return <Post page={page} content={content} />;
  if (page.layout === "portfolio") {
    return <CaseStudy page={page} content={content} />;
  }

  switch (path.replace(/\/?$/, "/")) {
    case "/portfolio/":
      return <Work page={page} content={content} />;
    case "/archive/":
      return <Archive page={page} content={content} />;
    case "/about/":
      return <About page={page} content={content} />;
    case "/services/":
      return <Services page={page} content={content} />;
    case "/testimonials/":
      return <Testimonials page={page} />;
    case "/contact/":
      return <Contact page={page} variant="contact" />;
    case "/project-inquiry/":
      return <Contact page={page} variant="inquiry" />;
    default:
      return <Generic page={page} content={content} />;
  }
}

export function Mech(props: DirectionProps) {
  const { base, path } = props;
  const to = (target: string) => `${base}${target}`;

  return (
    <BaseContext.Provider value={base}>
      <div className="mc">
        <link rel="stylesheet" href={FONTS_URL} precedence="default" />
        <link rel="stylesheet" href={stylesheet} precedence="default" />

        <header className="mc-hud">
          <a className="mc-hud__id" href={to("/")}>
            <span className="mc-badge" aria-hidden="true">
              <HexOutline />
              KP
            </span>
            <span className="mc-hud__name">
              Keenan Payne
              <small>Web development &amp; design · Unit KP-01</small>
            </span>
          </a>

          <nav className="mc-hud__nav" aria-label="Main">
            <ul>
              {NAVIGATION.map((item, index) => (
                <li key={item.path}>
                  <a
                    href={to(item.path)}
                    aria-current={
                      path.startsWith(item.path) ? "page" : undefined
                    }
                  >
                    <span className="mc-hud__num">0{index + 1}</span>
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mc-hud__status">
            <DenverStatus />
            <span className="mc-hud__signal">
              <span className="mc-dot" aria-hidden="true" />
              Nominal
            </span>
          </div>
        </header>
        <div className="mc-ruler" aria-hidden="true" />

        <main className="mc-main">
          <PageBody {...props} />
        </main>

        <footer className="mc-footer">
          <span className="mc-hazard" aria-hidden="true" />
          <div className="mc-footer__row">
            <p className="mc-footer__end">
              <span className="mc-footer__kanji" lang="ja">
                終
              </span>
              <span>
                End of transmission
                <small>
                  © {new Date().getFullYear()} Keenan Payne · KP-01 original
                </small>
              </span>
            </p>
            <ul className="mc-footer__social">
              {SOCIAL_IDS.map((id) => (
                <li key={id}>
                  <a
                    href={socials[id].url}
                    rel={socials[id].name === "Mastodon" ? "me" : undefined}
                  >
                    {socials[id].name}
                  </a>
                </li>
              ))}
              <li>
                <a href="/feed.xml">RSS</a>
              </li>
            </ul>
            <Ticks />
          </div>
        </footer>

        <div className="mc-scan" aria-hidden="true" />
      </div>
    </BaseContext.Provider>
  );
}
