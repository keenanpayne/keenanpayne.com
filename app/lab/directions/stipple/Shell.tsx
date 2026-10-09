import { useId } from "react";

import { samePath, useMenu, useTo, type ShellProps } from "../../site";

import { DenverClock, DenverNotes } from "./Denver";
import { Arrow, Mark, Signup, Terrain } from "./parts";

/** Below this, the navigation folds into a menu that fills the window */
const WIDE = "(width >= 760px)";

/**
 * A hairline window fixed over the viewport, with the page scrolling inside
 * it. Its top edge steps down around the navigation and its bottom edge
 * steps up around the footer, so both sit in notches outside the window.
 * On a phone the notch keeps Contact and a menu, which opens the pages as
 * an index inside the window.
 */
export function Shell({ path, navigation, content, children }: ShellProps) {
  const to = useTo();
  const notes = useId();
  const menu = useId();
  const { open, setOpen, toggle } = useMenu(WIDE, path);
  const { profile, socials } = content;

  return (
    <div className="st">
      <a className="st-skip" href="#st-main">
        Skip to content
      </a>

      <header className="st-top">
        <div className="st-top__tab">
          <a className="st-brand" href={to("/")}>
            <Mark />
            <span>{profile.name}</span>
          </a>
        </div>
        <span className="st-step st-step--top" aria-hidden="true">
          <span className="st-step__out" />
          <span className="st-step__line" />
          <span className="st-step__in" />
        </span>
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
          <DenverClock
            notes={notes}
            location={profile.location}
            className="st-nav__clock"
          />

          <div id={menu} className="st-menu" hidden={!open}>
            <p className="st-menu__label">
              <span>Index</span>
              <span>{`${navigation.length} pages`}</span>
            </p>
            <ol className="st-menu__list">
              {navigation.map((item, index) => (
                <li
                  key={item.url}
                  style={{ "--st-i": index } as React.CSSProperties}
                >
                  <a
                    href={item.url}
                    aria-current={item.current ? "page" : undefined}
                  >
                    <span className="st-menu__number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
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
            <ul className="st-menu__links">
              {socials.map((social) => (
                <li key={social.url}>
                  <a href={social.url} rel={social.rel}>
                    {social.text}
                  </a>
                </li>
              ))}
              <li>
                <a href="/feed.xml">RSS</a>
              </li>
            </ul>
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
        <span className="st-step st-step--bottom" aria-hidden="true">
          <span className="st-step__in" />
          <span className="st-step__line" />
          <span className="st-step__out" />
        </span>
        <div className="st-bottom__content">
          <DenverClock
            notes={notes}
            location={profile.location}
            className="st-bottom__clock"
          />
          <a className="st-bottom__name" href={to("/")}>
            {profile.name}
          </a>
          <ul className="st-bottom__links">
            {socials.map((social) => (
              <li key={social.url}>
                <a href={social.url} rel={social.rel}>
                  {social.text}
                </a>
              </li>
            ))}
            <li>
              <a href="/feed.xml">RSS</a>
            </li>
          </ul>
          <Signup compact />
        </div>
      </footer>

      <DenverNotes id={notes} location={profile.location} />
    </div>
  );
}

/** Nine dots that, open, keep their diagonals: a cross */
function MenuDots() {
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
