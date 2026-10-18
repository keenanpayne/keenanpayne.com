import { useId } from "react";

import { metadata } from "../../../lib/site";
import { useTo, type ShellProps } from "../../site";

import { DenverBox, DenverClock } from "./Denver";
import { handleOf } from "./parts";

/** The dithered edge under every page's footer; makes its own filter id */
export function Dither({ id }: { id?: string }) {
  const generated = useId();
  const filter = id ?? generated;

  return (
    <svg className="mg-dither" aria-hidden="true">
      <filter id={filter} x="0" y="0" width="100%" height="100%">
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
      <rect width="100%" height="100%" filter={`url(#${filter})`} />
    </svg>
  );
}

export function Shell({ navigation, content, children }: ShellProps) {
  const { profile, socials } = content;
  const handle = handleOf(socials);
  const to = useTo();
  const box = useId();

  return (
    <div className="mg">
      <a className="mg-skip" href="#mg-main">
        Skip to content
      </a>

      <div className="mg-page">
        <header className="mg-mast">
          <div className="mg-mast__row">
            <DenverClock
              box={box}
              location={profile.location}
              className="mg-mast__aside mg-mast__clock"
            />
            <span className="mg-mast__line" aria-hidden="true" />
            <a className="mg-mast__name" href={to("/")}>
              {profile.name}
            </a>
            <span className="mg-mast__line" aria-hidden="true" />
            <nav aria-label="Main">
              <ul className="mg-mast__nav">
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
          </div>
          <div className="mg-mast__rule">
            {handle && <span className="mg-tag">{handle}</span>}
          </div>
        </header>

        <main id="mg-main">{children}</main>

        <footer className="mg-footer">
          <p>
            Copyright © {new Date().getFullYear()} {profile.name}
          </p>
          <ul className="mg-footer__social">
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
        </footer>
      </div>

      <Dither id="mg-dither-filter" />
      <DenverBox id={box} location={profile.location} />
    </div>
  );
}
