import { useTo, type ShellProps } from "../../site";

import { DenverStatus } from "./Denver";
import { HexOutline, Ticks } from "./parts";

export function Shell({ navigation, content, children }: ShellProps) {
  const { profile, socials } = content;
  const to = useTo();

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
      </header>
      <div className="mc-ruler" aria-hidden="true" />

      <main className="mc-main">{children}</main>

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
