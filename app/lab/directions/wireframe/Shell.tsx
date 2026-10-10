import { useTo, type ShellProps } from "../../site";

export function Shell({ navigation, content, children }: ShellProps) {
  const to = useTo();
  const { profile, socials } = content;

  return (
    <div className="wireframe">
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
      </header>

      <main className="wireframe-main">{children}</main>

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
            <a href="/feed.xml">RSS</a>
          </li>
        </ul>
      </footer>
    </div>
  );
}
