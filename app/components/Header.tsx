import { Link } from "react-router";

import calendarIcon from "../assets/svg/calendar.svg?raw";
import mailboxIcon from "../assets/svg/mailbox.svg?raw";
import { isActive, usePageUrl } from "../lib/navigation";
import type { LinkModel } from "../lib/types";

export function Header({ navigation }: { navigation: LinkModel[] }) {
  const pageUrl = usePageUrl();

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-logo">
          <Link className="-hover-color" to="/">
            Keenan
            <br />
            Payne
          </Link>
        </h1>

        <h2 className="header-tagline">
          Professional web design and <span className="_a11y-hidden">web</span>
          {" development services "}
          <strong className="_rainbow-underline">since 2007</strong>
        </h2>

        <Link
          to="/project-inquiry/"
          className="header-button button -secondary"
        >
          Project inquiry →
        </Link>
      </div>

      <div className="navigation">
        <nav className="navigation-left">
          {navigation.map((item) => (
            <Link
              key={item.url}
              className={`-inverted navigation-item${isActive(item.url, pageUrl) ? " -active" : ""}`}
              to={item.url}
            >
              {item.text}
            </Link>
          ))}
        </nav>

        <nav className="navigation-right">
          <a
            className="-inverted navigation-item"
            href="https://calendly.com/keenanpayne/"
            title="Schedule time to talk"
            target="_blank"
            rel="noopener"
            dangerouslySetInnerHTML={{ __html: calendarIcon }}
          />

          <Link
            className="-inverted navigation-item"
            to="/subscribe/"
            title="Subscribe to my newsletter"
            dangerouslySetInnerHTML={{ __html: mailboxIcon }}
          />
        </nav>
      </div>
    </header>
  );
}
