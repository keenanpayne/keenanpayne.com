import { useId } from "react";

import { samePath, useTo, type ShellProps } from "../../site";

import { DenverClock, DenverNotes } from "./Denver";
import { Arrow, Mark, Signup } from "./parts";

/**
 * A hairline window fixed over the viewport, with the page scrolling inside
 * it. Its top edge steps down around the navigation and its bottom edge
 * steps up around the footer, so both sit in notches outside the window.
 */
export function Shell({ navigation, content, children }: ShellProps) {
  const to = useTo();
  const notes = useId();
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
                <li key={item.url}>
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
          <DenverClock
            notes={notes}
            location={profile.location}
            className="st-nav__clock"
          />
        </nav>
      </header>

      <div className="st-window" aria-hidden="true" />
      <div className="st-gutters" aria-hidden="true" />

      <main id="st-main" className="st-sheet">
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
