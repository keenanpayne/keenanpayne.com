import { useId } from "react";

import { metadata } from "../../../lib/site";
import { cx, useMenu, useQueryParam, useTo, type ShellProps } from "../../site";

import { DenverClock, DenverReadout } from "./Denver";
import { Cells, Cta, DEFAULT_CTA, isCta } from "./parts";

const WIDE = "(width >= 960px)";

/** Pages that are a call to action already, so don't close with another */
const NO_CTA = new Set(["contact", "inquiry", "notFound"]);

export function Shell({ view, navigation, content, children }: ShellProps) {
  const to = useTo();
  const { profile, socials } = content;
  const { open, setOpen, toggle } = useMenu(WIDE);
  const readout = useId();
  // The lab previews the other closing panels from the URL
  const [ctaParam] = useQueryParam("cta");
  const cta = isCta(ctaParam) ? ctaParam : DEFAULT_CTA;

  return (
    <div className="gl">
      <a className="gl-skip" href="#gl-main">
        Skip to content
      </a>
      <div className="gl-frame">
        <header className="gl-header">
          <a className="gl-brand" href={to("/")}>
            {profile.name}
          </a>

          <nav
            id="gl-nav"
            className={cx("gl-nav", open && "gl-nav--open")}
            aria-label="Main"
          >
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

          <div className="gl-header__end">
            <DenverClock
              readout={readout}
              location={profile.location}
              label={profile.location.city}
              className="gl-header__clock"
            />
            <div className="gl-header__cta">
              <a
                className="gl-button gl-button--small"
                href={to("/project-inquiry/")}
              >
                Start a project
              </a>
            </div>
            <button
              ref={toggle}
              className="gl-menu"
              type="button"
              aria-expanded={open}
              aria-controls="gl-nav"
              onClick={() => setOpen(!open)}
            >
              Menu
              <svg viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d={open ? "M2 2l10 10M12 2L2 12" : "M1 4h12M1 10h12"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
        </header>

        <main id="gl-main" className="gl-main">
          {children}
        </main>

        {!NO_CTA.has(view.kind) && <Cta email={profile.email} variant={cta} />}

        <footer className="gl-footer">
          <Cells cols={4} as="div">
            <div className="gl-cell gl-footer__brand">
              <a className="gl-brand" href={to("/")}>
                {profile.name}
              </a>
              <p>{profile.role}</p>
            </div>
            <div className="gl-cell">
              <p className="gl-label">Pages</p>
              <ul>
                {navigation.map((item) => (
                  <li key={item.url}>
                    <a href={item.url}>{item.text}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="gl-cell">
              <p className="gl-label">Elsewhere</p>
              <ul>
                {socials.map((social) => (
                  <li key={social.url}>
                    <a href={social.url} rel={social.rel}>
                      {social.text}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={metadata.feed.path}>RSS feed</a>
                </li>
              </ul>
            </div>
            <div className="gl-cell">
              <p className="gl-label">Get in touch</p>
              <ul>
                <li>
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </li>
                <li>
                  <a href={to("/project-inquiry/")}>Project inquiry</a>
                </li>
                <li>
                  <a href={to("/contact/")}>Say hello</a>
                </li>
              </ul>
            </div>
          </Cells>

          <div className="gl-footer__bar">
            <p>{`© ${new Date().getFullYear()} ${profile.name}`}</p>
            <p>Set in Instrument Sans, Instrument Serif &amp; IBM Plex Mono</p>
            <p>
              <a href="#gl-main">Back to top ↑</a>
            </p>
          </div>

          <p className="gl-wordmark" aria-hidden="true">
            {profile.name}
          </p>
        </footer>
      </div>

      <DenverReadout id={readout} location={profile.location} />
    </div>
  );
}
