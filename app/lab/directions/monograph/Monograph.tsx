import { useEffect, useState } from "react";

import { socials } from "../../../data/socials";
import type { DirectionProps } from "..";

import stylesheet from "./monograph.css?url";
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
import { BaseContext, Icon } from "./parts";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300;1,6..72,400&family=IBM+Plex+Mono:wght@400;500&display=swap";

const SOCIAL_IDS = [1, 4, 6, 2, 3];

const NAVIGATION = [
  { path: "/portfolio/", text: "Work" },
  { path: "/archive/", text: "Writing" },
  { path: "/about/", text: "About" },
  { path: "/services/", text: "Services" },
  { path: "/contact/", text: "Contact" }
];

function useDenverTime() {
  const [time, setTime] = useState<string>();

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Denver"
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = setInterval(tick, 15_000);
    return () => clearInterval(timer);
  }, []);

  return time;
}

/** Picks the Monograph layout for the site page being mocked up */
function PageBody({ path, page, notFound, content }: DirectionProps) {
  if (path === "/") return <Home content={content} />;
  if (notFound || !page) return <NotFound />;
  if (page.layout === "post") return <Post page={page} />;
  if (page.layout === "portfolio") return <CaseStudy page={page} />;

  switch (path.replace(/\/?$/, "/")) {
    case "/portfolio/":
      return <Work page={page} content={content} />;
    case "/archive/":
      return <Archive page={page} content={content} />;
    case "/about/":
      return <About page={page} />;
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

export function Monograph(props: DirectionProps) {
  const { base, path } = props;
  const time = useDenverTime();
  const to = (target: string) => `${base}${target}`;

  return (
    <BaseContext.Provider value={base}>
      <div className="mg">
        <link rel="stylesheet" href={FONTS_URL} precedence="default" />
        <link rel="stylesheet" href={stylesheet} precedence="default" />

        <div className="mg-page">
          <header className="mg-mast">
            <div className="mg-mast__row">
              <p className="mg-mast__aside">
                <Icon name="pin" />
                Denver, CO{time && <> · {time}</>}
              </p>
              <span className="mg-mast__line" aria-hidden="true" />
              <a className="mg-mast__name" href={to("/")}>
                Keenan Payne
              </a>
              <span className="mg-mast__line" aria-hidden="true" />
              <nav aria-label="Main">
                <ul className="mg-mast__nav">
                  {NAVIGATION.map((item) => (
                    <li key={item.path}>
                      <a
                        href={to(item.path)}
                        aria-current={
                          path.startsWith(item.path) ? "page" : undefined
                        }
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="mg-mast__rule">
              <span className="mg-tag">@keenanpayne</span>
            </div>
          </header>

          <main>
            <PageBody {...props} />
          </main>

          <footer className="mg-footer">
            <p>Copyright © {new Date().getFullYear()} Keenan Payne</p>
            <ul className="mg-footer__social">
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
          </footer>
        </div>

        <svg className="mg-dither" aria-hidden="true">
          <filter id="mg-dither-filter" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="1"
              seed="7"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="discrete" tableValues="0 1" />
              <feFuncG type="discrete" tableValues="0 1" />
              <feFuncB type="discrete" tableValues="0 1" />
            </feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter="url(#mg-dither-filter)" />
        </svg>
      </div>
    </BaseContext.Provider>
  );
}
