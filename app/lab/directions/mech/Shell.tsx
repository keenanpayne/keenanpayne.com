import { useId } from "react";

import { samePath, useMenu, useTo, type ShellProps } from "../../site";

import { DenverStatus } from "./Denver";
import { HexOutline, Ticks, Tri } from "./parts";

/** Below this, the navigation folds into the command deck */
const WIDE = "(width >= 760px)";

/** Each section's designation on the command deck */
const SECTORS: Record<string, string> = {
  "/portfolio/": "作品",
  "/archive/": "記録",
  "/about/": "経歴",
  "/services/": "任務",
  "/contact/": "通信"
};

export function Shell({ path, navigation, content, children }: ShellProps) {
  const { profile, socials } = content;
  const to = useTo();
  const deck = useId();
  const { open, setOpen, toggle } = useMenu(WIDE, path);
  const sectorOf = (url: string) =>
    Object.entries(SECTORS).find(([section]) =>
      samePath(url, to(section))
    )?.[1];

  return (
    <div className="mc">
      <header className="mc-hud">
        <a className="mc-hud__id" href={to("/")}>
          <span className="mc-badge" aria-hidden="true">
            <HexOutline />
            KP
          </span>
          <span className="mc-hud__name">
            {profile.name}
            <small>Web development &amp; design · Unit KP-01</small>
          </span>
        </a>

        <nav className="mc-hud__nav" aria-label="Main">
          <ul>
            {navigation.map((item, index) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  aria-current={item.current ? "page" : undefined}
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

        <button
          ref={toggle}
          type="button"
          className="mc-hud__toggle"
          aria-expanded={open}
          aria-controls={deck}
          onClick={() => setOpen(!open)}
        >
          <span className="mc-hud__bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          Menu
        </button>

        {/* The command deck: the pages as a stack of launch bays */}
        <div id={deck} className="mc-deck" hidden={!open}>
          <span className="mc-hazard" aria-hidden="true" />
          <p className="mc-panel__head mc-deck__head">
            <span className="mc-panel__label">Command deck</span>
            <span className="mc-panel__code">
              {`${navigation.length} sectors`}
            </span>
            <Ticks />
          </p>

          <nav aria-label="Main">
            <ol className="mc-deck__list">
              {navigation.map((item, index) => (
                <li
                  key={item.url}
                  style={{ "--mc-i": index } as React.CSSProperties}
                >
                  <a
                    href={item.url}
                    aria-current={item.current ? "page" : undefined}
                  >
                    <span className="mc-deck__num">0{index + 1}</span>
                    <span className="mc-deck__text">{item.text}</span>
                    {item.current && (
                      <span className="mc-deck__here">Engaged</span>
                    )}
                    <span className="mc-deck__sector" lang="ja">
                      {sectorOf(item.url)}
                    </span>
                    <Tri />
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mc-deck__foot">
            <span className="mc-deck__signal">
              <span className="mc-dot" aria-hidden="true" />
              All systems nominal
            </span>
            <ul className="mc-deck__links">
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
          </div>
        </div>
      </header>
      <div className="mc-ruler" aria-hidden="true" />

      <main className="mc-main" inert={open}>
        {children}
      </main>

      <footer className="mc-footer" inert={open}>
        <span className="mc-hazard" aria-hidden="true" />
        <div className="mc-footer__row">
          <p className="mc-footer__end">
            <span className="mc-footer__kanji" lang="ja">
              終
            </span>
            <span>
              End of transmission
              <small>
                © {new Date().getFullYear()} {profile.name} · KP-01 original
              </small>
            </span>
          </p>
          <ul className="mc-footer__social">
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
          <Ticks />
        </div>
      </footer>

      <div className="mc-scan" aria-hidden="true" />
    </div>
  );
}
