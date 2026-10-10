import { useLocalTime, useTo, type ShellProps } from "../../site";

import { Icon } from "./parts";

export function Shell({ navigation, content, children }: ShellProps) {
  const { profile, socials } = content;
  const time = useLocalTime();
  const to = useTo();

  return (
    <div className="mg">
      <div className="mg-page">
        <header className="mg-mast">
          <div className="mg-mast__row">
            <p className="mg-mast__aside">
              <Icon name="pin" />
              {profile.location.short}
              {time && <> · {time}</>}
            </p>
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
            <span className="mg-tag">@keenanpayne</span>
          </div>
        </header>

        <main>{children}</main>

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
              <a href="/feed.xml">RSS</a>
            </li>
          </ul>
        </footer>
      </div>

      <svg className="mg-dither" aria-hidden="true">
        <filter id="mg-dither-filter" x="0" y="0" width="100%" height="100%">
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
        <rect width="100%" height="100%" filter="url(#mg-dither-filter)" />
      </svg>
    </div>
  );
}
