import { metadata } from "../../../lib/site";
import { cx, useMenu, useReadout, useTo, type ShellProps } from "../../site";

import { DenverClock, DenverWeather } from "./Denver";
import { DOMES, Emblem } from "./emblems";
import { KANA, kanaOf, toneAt } from "./parts";
import { Wires } from "./scene";

const WIDE = "(width >= 960px)";

/** The footer's horizon: every dome, twice, with a whole emblem between */
const HORIZON = [...DOMES, ...DOMES];

export function Shell({ navigation, content, children }: ShellProps) {
  const to = useTo();
  const { profile, socials } = content;
  const { open, setOpen, toggle } = useMenu(WIDE);
  const readout = useReadout(profile.location);

  return (
    <div className="neon">
      <a className="neon-skip" href="#neon-main">
        Skip to content
      </a>

      <header className="neon-header">
        <Wires className="neon-header__wires" />
        <div className="neon-header__bar">
          <a className="neon-brand" href={to("/")}>
            <Emblem kind="target" className="neon-brand__mark" />
            <span className="neon-brand__name">{profile.name}</span>
          </a>

          <nav
            id="neon-nav"
            className={cx("neon-nav", open && "neon-nav--open")}
            aria-label="Main"
          >
            <ul>
              {navigation.map((item, index) => (
                <li key={item.url} className={`neon-tone--${toneAt(index)}`}>
                  <a
                    href={item.url}
                    aria-current={item.current ? "page" : undefined}
                  >
                    <span className="neon-nav__kana" aria-hidden="true">
                      {kanaOf(item.url)}
                    </span>
                    <span className="neon-nav__text">{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="neon-header__end">
            <DenverClock button={readout.button} location={profile.location} />
            <button
              ref={toggle}
              className="neon-menu"
              type="button"
              aria-expanded={open}
              aria-controls="neon-nav"
              onClick={() => setOpen(!open)}
            >
              <span>Menu</span>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d={open ? "M3 3l10 10M13 3L3 13" : "M1 4h14M1 8h14M1 12h14"}
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main id="neon-main" className="neon-main">
        {children}
      </main>

      <footer className="neon-footer">
        <div className="neon-footer__horizon" aria-hidden="true">
          {HORIZON.map((kind, index) => (
            <Emblem key={index} kind={kind} />
          ))}
        </div>

        <div className="neon-footer__street">
          <div className="neon-footer__brand">
            <a className="neon-brand" href={to("/")}>
              <Emblem kind="target" className="neon-brand__mark" />
              <span className="neon-brand__name">{profile.name}</span>
            </a>
            <p>{profile.role}</p>
            <p className="neon-footer__open">
              <span aria-hidden="true">{KANA.open} · </span>
              {profile.location.short}
            </p>
          </div>

          <div>
            <p className="neon-footer__label">Elsewhere</p>
            <ul className="neon-footer__signs">
              {socials.map((social, index) => (
                <li key={social.url} className={`neon-tone--${toneAt(index)}`}>
                  <a href={social.url} rel={social.rel}>
                    {social.text}
                  </a>
                </li>
              ))}
              <li className="neon-tone--amber">
                <a href={metadata.feed.path}>RSS feed</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="neon-footer__bar">
          <p>{`© ${new Date().getFullYear()} ${profile.name}`}</p>
          <p aria-hidden="true" className="neon-footer__fonts">
            Lit in Tilt Neon, Chakra Petch &amp; Martian Mono
          </p>
          <p>
            <a href="#neon-main">Back to top ↑</a>
          </p>
        </div>
      </footer>

      <DenverWeather readout={readout} location={profile.location} />
    </div>
  );
}
