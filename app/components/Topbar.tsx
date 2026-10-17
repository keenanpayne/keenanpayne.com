import { Link } from "react-router";

export function Topbar() {
  return (
    <aside className="topbar">
      <div className="topbar-content">
        <p className="topbar-text">
          <span className="status-dot"></span>I have availability Q3-Q4, 2025
        </p>
        <p className="topbar-text">
          <span className="topbar-separator">—</span>
          <Link className="topbar-link" to="/project-inquiry/">
            inquire about working together
          </Link>
          {" today!"}
        </p>
      </div>
    </aside>
  );
}
