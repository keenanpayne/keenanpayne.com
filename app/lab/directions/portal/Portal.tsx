import { useState } from "react";

import { socials } from "../../../data/socials";
import type { PageModel } from "../../../lib/types";
import type { DirectionProps } from "..";

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
import {
  Ad,
  BaseContext,
  Go,
  Icon,
  Mascot,
  Pill,
  Sprite,
  type AdName
} from "./parts";
import stylesheet from "./portal.css?url";
import { ICONS, INFO, type IconName, type Item } from "./sprites";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Saira:ital,wdth,wght@0,50..125,100..900;1,50..125,100..900&family=Silkscreen:wght@400;700&display=swap";

const NAVIGATION = [
  { path: "/portfolio/", text: "Work" },
  { path: "/archive/", text: "Writing" },
  { path: "/about/", text: "About" },
  { path: "/services/", text: "Services" },
  { path: "/contact/", text: "Contact" }
];

const SUB_NAVIGATION = [
  { path: "/", text: "Home" },
  { path: "/testimonials/", text: "Testimonials" },
  { path: "/project-inquiry/", text: "Project inquiry" },
  { href: socials[1].url, text: "LinkedIn" },
  { href: socials[4].url, text: "Bluesky" },
  { href: socials[6].url, text: "Mastodon", rel: "me" },
  { href: socials[2].url, text: "Dribbble" }
];

const RAIL = [
  { path: "/archive/", text: "New releases" },
  { path: "/services/", text: "Most wanted" },
  { path: "/testimonials/", text: "Clients’ choice" },
  { path: "/archive/#ratings", text: "Ratings guide" }
];

const SIDE_BUTTONS: { icon: IconName; text: string; path: string }[] = [
  { icon: "power", text: "Hire me", path: "/project-inquiry/" },
  { icon: "mail", text: "Newsletter", path: "/archive/#newsletter" },
  { icon: "heart", text: "Kind words", path: "/testimonials/" },
  { icon: "question", text: "Help", path: "/contact/" }
];

interface Scene {
  /** What the mascot says over the top of the frame */
  bubble: string;
  item?: Item;
  /** The "What is" card in the side column */
  info: { title: string; body: string; path?: string };
  cta: { text: string; path: string; icon: IconName };
  ads: AdName[];
}

/** Mascot line, side card, and ads for each part of the site */
function sceneFor(
  path: string,
  page: PageModel | null,
  notFound: boolean
): Scene {
  const hire = {
    text: "Start a project inquiry",
    path: "/project-inquiry/",
    icon: "power" as IconName
  };

  if (path === "/") {
    return {
      bubble: "Everything you want to know about Keenan and more",
      info: {
        title: "Work list",
        body: "Use this tool to browse every case study by client, sector, and year.",
        path: "/portfolio/"
      },
      cta: hire,
      ads: ["first", "news"]
    };
  }

  if (notFound || !page) {
    return {
      bubble: "Uh oh! This page warped away!",
      item: "question",
      info: {
        title: "Home page",
        body: "Lost? Head back to the home page and try again.",
        path: "/"
      },
      cta: { text: "Back to the home page", path: "/", icon: "house" },
      ads: ["suck"]
    };
  }

  if (page.layout === "portfolio" || path.startsWith("/portfolio/")) {
    return {
      bubble: "All about Keenan’s clients and case studies!",
      item: "case",
      info:
        page.layout === "portfolio"
          ? {
              title: "Content key",
              body: "Use this tool to quickly jump down to the topic of your choice."
            }
          : {
              title: "Master list",
              body: "Every case study in one table, sorted by priority. Search it from the top of the page."
            },
      cta: hire,
      ads: ["suck", "first"]
    };
  }

  if (
    page.layout === "post" ||
    path.startsWith("/archive/") ||
    path.startsWith("/type/") ||
    path.startsWith("/tags/")
  ) {
    return {
      bubble: "Official Keenan news. Straight from the source!",
      item: page.layout === "post" ? "pencil" : "paper",
      info: {
        title: "Ratings",
        body: "Every article is rated by the KPRB: A for Article, E for Essay, R for Reflection, and T for Tutorial.",
        path: "/archive/#ratings"
      },
      cta: {
        text: "Sign up for e-mail news",
        path: "/archive/#newsletter",
        icon: "mail"
      },
      ads: ["news", "suck"]
    };
  }

  if (path.startsWith("/services/")) {
    return {
      bubble: "All about Keenan’s web services and expertise!",
      item: "wrench",
      info:
        path === "/services/"
          ? {
              title: "Services",
              body: "Pick a category to see how I can help your team."
            }
          : {
              title: "Content key",
              body: "Use this tool to quickly jump down to the topic of your choice."
            },
      cta: hire,
      ads: ["first", "suck"]
    };
  }

  if (path.startsWith("/testimonials/")) {
    return {
      bubble: "Kind words from real clients and coworkers!",
      item: "heart",
      info: {
        title: "Clients’ choice",
        body: "The qualities clients mention most, tallied from every review."
      },
      cta: hire,
      ads: ["first", "news"]
    };
  }

  if (path.startsWith("/contact/") || path.startsWith("/project-inquiry/")) {
    return {
      bubble: "Welcome to keenanpayne.com! Drop me a line!",
      item: "mail",
      info: {
        title: "Project inquiry",
        body: "Have a project in mind? This form helps me learn about your goals.",
        path: "/project-inquiry/"
      },
      cta: { text: "Printer friendly format", path: "", icon: "print" },
      ads: ["news"]
    };
  }

  return {
    bubble: "Welcome to keenanpayne.com!",
    item: "star",
    info: {
      title: "Player 1",
      body: "Full-stack web developer and designer, based in Denver, Colorado."
    },
    cta: hire,
    ads: ["first", "news"]
  };
}

/** Picks the Portal layout for the site page being mocked up */
function PageBody({ path, page, notFound, content }: DirectionProps) {
  if (path === "/") return <Home content={content} />;
  if (notFound || !page) return <NotFound content={content} />;
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
      return <Testimonials page={page} content={content} />;
    case "/contact/":
      return <Contact page={page} variant="contact" />;
    case "/project-inquiry/":
      return <Contact page={page} variant="inquiry" />;
    default:
      return <Generic page={page} content={content} />;
  }
}

/** Raised tab on the top right of the frame: search the writing or work */
function Search({ base }: { base: string }) {
  const [scope, setScope] = useState("/archive/");

  return (
    <form
      className="pt-search"
      role="search"
      method="get"
      action={`${base}${scope}`}
    >
      <p className="pt-search__label">
        <Icon name="arrowRight" />
        <label htmlFor="pt-search-q">Search</label>
        <a href={`${base}/archive/#archive`}>Tips</a>
      </p>
      <div className="pt-search__row">
        <input id="pt-search-q" className="pt-input" type="search" name="q" />
      </div>
      <div className="pt-search__row">
        <select
          className="pt-select"
          aria-label="Search in"
          value={scope}
          onChange={(event) => setScope(event.target.value)}
        >
          <option value="/archive/">Writing</option>
          <option value="/portfolio/">Work</option>
        </select>
        <Go />
      </div>
    </form>
  );
}

export function Portal(props: DirectionProps) {
  const { base, path, page, notFound } = props;
  const to = (target: string) => `${base}${target}`;
  const scene = sceneFor(path, page, notFound);
  const isCurrent = (target: string) =>
    target === "/" ? path === "/" : path.startsWith(target);

  return (
    <BaseContext.Provider value={base}>
      <div className="pt">
        <link rel="stylesheet" href={FONTS_URL} precedence="default" />
        <link rel="stylesheet" href={stylesheet} precedence="default" />

        <div className="pt-device">
          <div className="pt-top">
            <div className="pt-host">
              <Mascot item={scene.item} />
              <p className="pt-bubble">{scene.bubble}</p>
            </div>
            <Search base={base} />
          </div>

          <div className="pt-frame">
            <header className="pt-header">
              <a className="pt-logo" href={to("/")}>
                <span className="pt-logo__pill">Keenan Payne</span>
              </a>

              <nav className="pt-nav" aria-label="Main">
                <ul>
                  {NAVIGATION.map((item) => (
                    <li key={item.path}>
                      <a
                        href={to(item.path)}
                        aria-current={isCurrent(item.path) ? "page" : undefined}
                      >
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="pt-quick">
                <a className="pt-chip" href={socials[3].url}>
                  <span className="pt-chip__icon">
                    <Icon name="code" />
                  </span>
                  Code bank
                </a>
                <a className="pt-chip pt-chip--orange" href={to("/portfolio/")}>
                  <span className="pt-chip__icon">
                    <Icon name="list" />
                  </span>
                  Work list
                </a>
              </div>
            </header>

            <nav className="pt-subnav" aria-label="Elsewhere">
              <span className="pt-subnav__arrow" aria-hidden="true">
                <Icon name="arrowRight" />
              </span>
              <ul>
                {SUB_NAVIGATION.map((item) => (
                  <li key={item.text}>
                    {"path" in item && item.path !== undefined ? (
                      <a
                        href={to(item.path)}
                        aria-current={isCurrent(item.path) ? "page" : undefined}
                      >
                        {item.text}
                      </a>
                    ) : (
                      <a href={item.href} rel={item.rel}>
                        {item.text}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
              <a className="pt-hire" href={to("/project-inquiry/")}>
                <span className="pt-hire__stars" aria-hidden="true">
                  <Sprite art={ICONS.star} />
                  <Sprite art={ICONS.star} />
                  <Sprite art={ICONS.star} />
                </span>
                Hire me
              </a>
            </nav>

            <div className="pt-body">
              <nav className="pt-rail" aria-label="Shortcuts">
                <span className="pt-rail__arrow" aria-hidden="true">
                  <Icon name="arrowDown" />
                </span>
                <ul>
                  {RAIL.map((item) => (
                    <li key={item.text}>
                      <a href={to(item.path)}>{item.text}</a>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="pt-center">
                <main className="pt-main">
                  <PageBody {...props} />
                </main>
                <p className="pt-cta">
                  <span className="pt-cta__arrow" aria-hidden="true">
                    <Icon name="arrowRight" />
                  </span>
                  {scene.cta.path ? (
                    <Pill href={to(scene.cta.path)} icon={scene.cta.icon}>
                      {scene.cta.text}
                    </Pill>
                  ) : (
                    <Pill icon={scene.cta.icon} onClick={() => window.print()}>
                      {scene.cta.text}
                    </Pill>
                  )}
                </p>
              </div>

              <aside className="pt-side" aria-label="Sidebar">
                <div className="pt-side__panel">
                  <ul className="pt-side__buttons">
                    {SIDE_BUTTONS.map((button) => (
                      <li key={button.text}>
                        <a href={to(button.path)}>
                          <Icon name={button.icon} />
                          {button.text}
                        </a>
                      </li>
                    ))}
                    <li>
                      <a href="/feed.xml">
                        <Icon name="rss" />
                        RSS feed
                      </a>
                    </li>
                  </ul>

                  <div className="pt-whatis">
                    <p className="pt-whatis__head">
                      <Sprite art={INFO} />
                      What is
                    </p>
                    <div className="pt-whatis__card">
                      <p className="pt-whatis__title">
                        {scene.info.path ? (
                          <a href={to(scene.info.path)}>{scene.info.title}</a>
                        ) : (
                          scene.info.title
                        )}
                      </p>
                      <p>{scene.info.body}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-side__ads">
                  {scene.ads.map((name) => (
                    <Ad key={name} name={name} />
                  ))}
                </div>
              </aside>
            </div>

            <footer className="pt-footer">
              <div className="pt-footer__bar">
                <span className="pt-footer__copy" aria-hidden="true">
                  ©
                </span>
                <p className="pt-footer__legal">
                  © {new Date().getFullYear()} Keenan Payne. Case studies are
                  property of their respective owners. Keenan Payne is
                  headquartered in Denver, Colorado.
                </p>
                <a className="pt-seal" href="/feed.xml">
                  <span className="pt-seal__top">
                    RSS<sup>™</sup>
                  </span>
                  <span className="pt-seal__mid">Feed Certified</span>
                  <span className="pt-seal__low">click to subscribe</span>
                </a>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </BaseContext.Provider>
  );
}
