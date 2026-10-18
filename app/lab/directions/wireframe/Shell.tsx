import { useId } from "react";

import { metadata } from "../../../lib/site";
import { useTo, type ShellProps } from "../../site";

import { DenverClock, DenverWeather } from "./Denver";

export function Shell({ navigation, content, children }: ShellProps) {
  const to = useTo();
  const weather = useId();
  const { profile, socials } = content;

  return (
    <div className="wireframe">
      <a className="wireframe-skip" href="#wireframe-main">
        Skip to content
      </a>

      <header className="wireframe-header">
        <a className="wireframe-name" href={to("/")}>
          {profile.name}
        </a>
        <nav aria-label="Main">
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
        <DenverClock popover={weather} location={profile.location} />
      </header>

      <main id="wireframe-main" className="wireframe-main">
        {children}
      </main>

      <footer className="wireframe-footer">
        <p>{`© ${new Date().getFullYear()} ${profile.name} · ${profile.location.name}`}</p>
        <ul>
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

      <DenverWeather id={weather} location={profile.location} />
    </div>
  );
}
