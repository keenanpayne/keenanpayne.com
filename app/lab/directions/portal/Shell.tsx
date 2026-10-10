import { useId, useState, type ReactNode } from "react";

import type { LabContent, SocialLink } from "../../../lib/types";
import {
  samePath,
  useMenu,
  useTo,
  type NavItem,
  type ShellProps,
  type View
} from "../../site";

import {
  Ad,
  cx,
  Go,
  Icon,
  ItemIcon,
  Mascot,
  Pill,
  Sprite,
  type AdName
} from "./parts";
import { ICONS, INFO, type IconName, type Item } from "./sprites";

/** Below this, the header folds into the site map */
const WIDE = "(width >= 640px)";

/** The item each zone's button shows on the site map */
export const ZONE_ITEMS: Record<string, Item> = {
  "/portfolio/": "case",
  "/archive/": "pencil",
  "/about/": "star",
  "/services/": "wrench",
  "/contact/": "mail"
};

const SUB_NAVIGATION = [
  { path: "/", text: "Home" },
  { path: "/testimonials/", text: "Testimonials" },
  { path: "/project-inquiry/", text: "Project inquiry" }
];

/** CodePen gets its own "Code bank" chip in the header */
export const isCodeBank = (social: SocialLink) => social.text === "CodePen";

export const RAIL = [
  { path: "/archive/", text: "New releases" },
  { path: "/services/", text: "Most wanted" },
  { path: "/testimonials/", text: "Clients’ choice" },
  { path: "/archive/#ratings", text: "Ratings guide" }
];

export const SIDE_BUTTONS: { icon: IconName; text: string; path: string }[] = [
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
export function sceneFor(
  view: View,
  path: string,
  profile: LabContent["profile"]
): Scene {
  const hire = {
    text: "Start a project inquiry",
    path: "/project-inquiry/",
    icon: "power" as IconName
  };

  if (view.kind === "home") {
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

  if (view.kind === "notFound") {
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

  if (view.kind === "caseStudy" || view.kind === "work") {
    return {
      bubble: "All about Keenan’s clients and case studies!",
      item: "case",
      info:
        view.kind === "caseStudy"
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
    view.kind === "post" ||
    view.kind === "writing" ||
    path.startsWith("/type/") ||
    path.startsWith("/tags/")
  ) {
    return {
      bubble: "Official Keenan news. Straight from the source!",
      item: view.kind === "post" ? "pencil" : "paper",
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

  if (view.kind === "services" || view.kind === "service") {
    return {
      bubble: "All about Keenan’s web services and expertise!",
      item: "wrench",
      info:
        view.kind === "services"
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

  if (view.kind === "testimonials") {
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

  if (view.kind === "contact" || view.kind === "inquiry") {
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
      body: `${profile.role}, based in ${profile.location.name}.`
    },
    cta: hire,
    ads: ["first", "news"]
  };
}

/**
 * Raised tab on the top right of the frame: search the writing or work. The
 * site map carries its own on phones.
 */
export function Search({ className }: { className?: string }) {
  const to = useTo();
  const id = useId();
  const [scope, setScope] = useState("/archive/");

  return (
    <form
      className={cx("pt-search", className)}
      role="search"
      method="get"
      action={to(scope)}
    >
      <p className="pt-search__label">
        <Icon name="arrowRight" />
        <label htmlFor={id}>Search</label>
        <a href={to("/archive/#archive")}>Tips</a>
      </p>
      <div className="pt-search__row">
        <input id={id} className="pt-input" type="search" name="q" />
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

/** The quick chips on the header's right: Code bank and Work list */
export function Chips({ codeBank }: { codeBank?: SocialLink }) {
  const to = useTo();

  return (
    <>
      {codeBank && (
        <a className="pt-chip" href={codeBank.url}>
          <span className="pt-chip__icon">
            <Icon name="code" />
          </span>
          Code bank
        </a>
      )}
      <a className="pt-chip pt-chip--orange" href={to("/portfolio/")}>
        <span className="pt-chip__icon">
          <Icon name="list" />
        </span>
        Work list
      </a>
    </>
  );
}

export function Hire() {
  const to = useTo();

  return (
    <a className="pt-hire" href={to("/project-inquiry/")}>
      <span className="pt-hire__stars" aria-hidden="true">
        <Sprite art={ICONS.star} />
        <Sprite art={ICONS.star} />
        <Sprite art={ICONS.star} />
      </span>
      Hire me
    </a>
  );
}

/** The lavender strip under the header: other pages and elsewhere online */
export function Elsewhere({
  path,
  socials,
  children
}: {
  path: string;
  socials: SocialLink[];
  children?: ReactNode;
}) {
  const to = useTo();
  const isCurrent = (target: string) =>
    target === "/" ? path === "/" : path.startsWith(target);

  return (
    <nav className="pt-subnav" aria-label="Elsewhere">
      <span className="pt-subnav__arrow" aria-hidden="true">
        <Icon name="arrowRight" />
      </span>
      <ul>
        {SUB_NAVIGATION.map((item) => (
          <li key={item.text}>
            <a
              href={to(item.path)}
              aria-current={isCurrent(item.path) ? "page" : undefined}
            >
              {item.text}
            </a>
          </li>
        ))}
        {socials
          .filter((social) => !isCodeBank(social))
          .map((social) => (
            <li key={social.text}>
              <a href={social.url} rel={social.rel}>
                {social.text}
              </a>
            </li>
          ))}
      </ul>
      {children}
    </nav>
  );
}

/**
 * The site map, which the header folds into on phones: the zones as big
 * buttons, then search, the chips, and the lavender strip
 */
function SiteMap({
  id,
  hidden,
  navigation,
  path,
  socials,
  codeBank
}: {
  id: string;
  hidden: boolean;
  navigation: NavItem[];
  path: string;
  socials: SocialLink[];
  codeBank?: SocialLink;
}) {
  const to = useTo();
  const itemFor = (url: string) =>
    Object.entries(ZONE_ITEMS).find(([zone]) => samePath(url, to(zone)))?.[1];

  return (
    <div id={id} className="pt-map" hidden={hidden}>
      <p className="pt-map__head">
        <Sprite art={INFO} />
        Site map
        <span>{`${navigation.length} zones`}</span>
      </p>

      <nav aria-label="Main">
        <ul className="pt-map__zones">
          {navigation.map((item, index) => {
            const zoneItem = itemFor(item.url);
            return (
              <li
                key={item.url}
                style={{ "--pt-i": index } as React.CSSProperties}
              >
                <a
                  href={item.url}
                  aria-current={item.current ? "page" : undefined}
                >
                  <span className="pt-map__well">
                    {zoneItem && <ItemIcon item={zoneItem} />}
                  </span>
                  <span className="pt-map__text">{item.text}</span>
                  {item.current && (
                    <span className="pt-map__here">You are here</span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <Search className="pt-search--map" />

      <div className="pt-map__chips">
        <Chips codeBank={codeBank} />
        <Hire />
      </div>

      <Elsewhere path={path} socials={socials} />
    </div>
  );
}

export function Shell({
  view,
  path,
  navigation,
  content,
  children
}: ShellProps) {
  const { profile, socials } = content;
  const to = useTo();
  const map = useId();
  const { open, setOpen, toggle } = useMenu(WIDE, path);
  const scene = sceneFor(view, path, profile);
  const codeBank = socials.find(isCodeBank);

  return (
    <div className="pt">
      <div className="pt-device">
        <div className="pt-top">
          <div className="pt-host">
            <Mascot item={open ? "question" : scene.item} />
            <p className="pt-bubble">
              {open ? "Where to next? Pick a zone!" : scene.bubble}
            </p>
          </div>
          <Search />
        </div>

        <div className="pt-frame">
          <header className="pt-header">
            <a className="pt-logo" href={to("/")}>
              <span className="pt-logo__pill">{profile.name}</span>
            </a>

            <nav className="pt-nav" aria-label="Main">
              <ul>
                {navigation.map((item) => (
                  <li key={item.url}>
                    <a
                      href={item.url}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="pt-quick">
              <Chips codeBank={codeBank} />
              <button
                ref={toggle}
                type="button"
                className="pt-toggle"
                aria-expanded={open}
                aria-controls={map}
                onClick={() => setOpen(!open)}
              >
                <span className="pt-toggle__well">
                  <Icon name={open ? "arrowUp" : "arrowDown"} />
                </span>
                Menu
              </button>
            </div>
          </header>

          <SiteMap
            id={map}
            hidden={!open}
            navigation={navigation}
            path={path}
            socials={socials}
            codeBank={codeBank}
          />

          <Elsewhere path={path} socials={socials}>
            <Hire />
          </Elsewhere>

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
              <main className="pt-main">{children}</main>
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
                © {new Date().getFullYear()} {profile.name}. Case studies are
                property of their respective owners. {profile.name} is
                headquartered in {profile.location.name}.
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
  );
}
