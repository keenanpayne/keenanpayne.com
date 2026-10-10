import { Fragment } from "react";
import { Link } from "react-router";

import behance from "../assets/svg/behance.svg?raw";
import bluesky from "../assets/svg/bluesky.svg?raw";
import codepen from "../assets/svg/codepen.svg?raw";
import dribbble from "../assets/svg/dribbble.svg?raw";
import linkedin from "../assets/svg/linkedin.svg?raw";
import mastodon from "../assets/svg/mastodon.svg?raw";
import threads from "../assets/svg/threads.svg?raw";
import twitter from "../assets/svg/twitter.svg?raw";
import { socials } from "../data/socials";
import { isActive, usePageUrl } from "../lib/navigation";
import type { LinkModel } from "../lib/types";

const icons: Record<string, string> = {
  behance,
  bluesky,
  codepen,
  dribbble,
  linkedin,
  mastodon,
  threads,
  twitter
};

export function Footer({ navigation }: { navigation: LinkModel[] }) {
  const pageUrl = usePageUrl();

  return (
    <footer className="footer">
      <div className="footer-content _container">
        <nav className="footer-left footer-nav">
          <span className="footer-label _label-sans">Footer Navigation</span>

          <div className="footer-nav-items">
            {navigation.map((item) => (
              <Link
                key={item.url}
                className={`footer-nav-item${isActive(item.url, pageUrl) ? " -active" : ""}`}
                to={item.url}
              >
                {item.text}
              </Link>
            ))}
          </div>
        </nav>

        <div className="footer-right">
          <div className="footer-socials">
            <span className="footer-label _label-sans">Follow me</span>

            <ul className="footer-socials-list">
              {Object.values(socials).map((social) => {
                const name = social.name.toLowerCase();
                return (
                  // Items are inline-block, so keep the whitespace between them
                  <Fragment key={name}>
                    {" "}
                    <li className="footer-socials-item">
                      <a
                        className={`footer-socials-link -${name}`}
                        target="_blank"
                        rel="noopener"
                        href={social.url}
                        title={`Find me on ${name}`}
                        dangerouslySetInnerHTML={{ __html: icons[name] }}
                      />
                    </li>
                  </Fragment>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="_text-small">
            Live and direct from Denver, Colorado ✌🏻
          </span>
        </div>
      </div>
    </footer>
  );
}
