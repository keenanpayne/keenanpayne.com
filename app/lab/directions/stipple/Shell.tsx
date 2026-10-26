import { useId, type CSSProperties } from "react";

import { metadata } from "../../../lib/site";
import type { LabContent } from "../../../lib/types";
import {
  pad,
  samePath,
  useMenu,
  useReadout,
  useTo,
  type NavItem,
  type Readout,
  type ShellProps
} from "../../site";

import { DenverClock, DenverNotes } from "./Denver";
import { Arrow, Mark, NewsletterLink, Terrain } from "./parts";

/** Below this, the navigation folds into a menu that fills the window */
const WIDE = "(width >= 760px)";

/**
 * A hairline window fixed over the viewport, with the page scrolling inside
 * it. Its top edge steps down around the navigation and its bottom edge
 * steps up around the footer, so both sit in notches outside the window.
 * On a phone the notch keeps Contact and a menu, which opens the pages as
 * an index inside the window.
 */
export function Shell({ navigation, content, children }: ShellProps) {
  const to = useTo();
  const menu = useId();
  const { open, setOpen, toggle } = useMenu(WIDE);
  const { profile, socials } = content;
  const readout = useReadout(profile.location);

  return (
    <div className="st">
      <a className="st-skip" href="#st-main">
        Skip to content
      </a>

      <header className="st-top">
        <div className="st-top__tab">
          <Brand name={profile.name} />
        </div>
        <Step edge="top" />
        <nav className="st-nav" aria-label="Main">
          <ul>
            {navigation.map((item) => {
              const cta = samePath(item.url, to("/contact/"));
              return (
                <li
                  key={item.url}
                  className={cta ? "st-nav__ctaItem" : undefined}
                >
                  <a
                    className={cta ? "st-nav__cta" : undefined}
                    href={item.url}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.text}
                    {cta && <Arrow />}
                  </a>
                </li>
              );
            })}
          </ul>
          <button
            ref={toggle}
            type="button"
            className="st-nav__toggle"
            aria-expanded={open}
            aria-controls={menu}
            onClick={() => setOpen(!open)}
          >
            <MenuDots />
            Menu
          </button>
          <DenverClock button={readout.button} className="st-nav__clock" />

          <div id={menu} className="st-menu" hidden={!open}>
            <MenuIndex
              navigation={navigation}
              content={content}
              clock={readout.button}
            />
            {open && (
              <Terrain
                className="st-menu__land"
                seed={profile.name}
                shape="isle"
                scale={180}
              />
            )}
          </div>
        </nav>
      </header>

      <div className="st-window" aria-hidden="true" />
      <div className="st-gutters" aria-hidden="true" />

      <main id="st-main" className="st-sheet" inert={open}>
        {children}
      </main>

      <footer className="st-bottom">
        <div className="st-bottom__tab">
          <p>{`© ${new Date().getFullYear()}`}</p>
        </div>
        <Step edge="bottom" />
        <div className="st-bottom__content">
          <DenverClock button={readout.button} className="st-bottom__clock" />
          <BottomName name={profile.name} />
          <SocialLinks socials={socials} className="st-bottom__links" />
          <NewsletterLink />
        </div>
      </footer>

      <DenverNotes readout={readout} location={profile.location} />
    </div>
  );
}

/** The name beside the moon, in the window's top tab */
export function Brand({ name }: { name: string }) {
  const to = useTo();

  return (
    <a className="st-brand" href={to("/")}>
      <Mark />
      <span>{name}</span>
    </a>
  );
}

/** The name again, in the footer */
export function BottomName({ name }: { name: string }) {
  const to = useTo();

  return (
    <a className="st-bottom__name" href={to("/")}>
      {name}
    </a>
  );
}

/**
 * One step of the window's edge: down around the navigation at the top,
 * up around the footer at the bottom
 */
export const Step = ({ edge }: { edge: "top" | "bottom" }) => (
  <span className={`st-step st-step--${edge}`} aria-hidden="true">
    {edge === "top" ? (
      <>
        <span className="st-step__out" />
        <span className="st-step__line" />
        <span className="st-step__in" />
      </>
    ) : (
      <>
        <span className="st-step__in" />
        <span className="st-step__line" />
        <span className="st-step__out" />
      </>
    )}
  </span>
);

/** Nine dots that, open, keep their diagonals: a cross */
export function MenuDots() {
  return (
    <svg className="st-dots" viewBox="0 0 14 14" aria-hidden="true">
      {[2, 7, 12].flatMap((y, row) =>
        [2, 7, 12].map((x, column) => (
          <circle
            key={`${x} ${y}`}
            className={(row + column) % 2 ? "st-dots__edge" : undefined}
            cx={x}
            cy={y}
            r="1.35"
          />
        ))
      )}
    </svg>
  );
}

/** Profiles elsewhere and the feed, as a row of links */
function SocialLinks({
  socials,
  className,
  style
}: {
  socials: LabContent["socials"];
  className: string;
  style?: CSSProperties;
}) {
  return (
    <ul className={className} style={style}>
      {socials.map((social) => (
        <li key={social.url}>
          <a href={social.url} rel={social.rel}>
            {social.text}
          </a>
        </li>
      ))}
      <li>
        <a href={metadata.feed.path}>RSS</a>
      </li>
    </ul>
  );
}

// The menu resets its lists and paragraphs; shown bare, outside it, the
// index brings the resets itself and anchors the notes to the clock here
const BARE: CSSProperties = { margin: 0, padding: 0, listStyle: "none" };

/**
 * The phone menu's contents: the pages as an index, then everything the
 * footer holds, as the menu covers it. The style guide shows it `bare`,
 * outside the menu.
 */
export function MenuIndex({
  navigation,
  content,
  clock,
  bare
}: {
  navigation: NavItem[];
  content: Pick<LabContent, "profile" | "socials">;
  /** The clock that opens the notes, as the Shell wires it */
  clock: Readout["button"];
  bare?: boolean;
}) {
  const { profile, socials } = content;

  return (
    <>
      <p className="st-menu__label" style={bare ? { margin: 0 } : undefined}>
        <span>Index</span>
        <span>{`${navigation.length} pages`}</span>
      </p>
      <ol className="st-menu__list" style={bare ? BARE : undefined}>
        {navigation.map((item, index) => (
          <li key={item.url} style={{ "--st-i": index } as CSSProperties}>
            <a href={item.url} aria-current={item.current ? "page" : undefined}>
              <span className="st-menu__number">{pad(index + 1)}</span>
              <span className="st-menu__text">{item.text}</span>
              {item.current ? (
                <Mark seed={item.url} className="st-menu__here" />
              ) : (
                <Arrow />
              )}
            </a>
          </li>
        ))}
      </ol>
      {/* Everything the footer holds, as it has no room for it here */}
      <div className="st-menu__foot">
        <SocialLinks
          socials={socials}
          className="st-menu__links"
          style={bare ? BARE : undefined}
        />
        <NewsletterLink />
        <p
          className="st-menu__meta"
          style={bare ? { ...BARE, anchorName: "--st-clock" } : undefined}
        >
          <DenverClock button={clock} />
          <span>{`© ${new Date().getFullYear()} ${profile.name}`}</span>
        </p>
      </div>
    </>
  );
}
