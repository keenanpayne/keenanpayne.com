import { useTo } from "../../../site";
import { PageHeader } from "../parts";

export function NotFound() {
  const to = useTo();

  return (
    <PageHeader
      eyebrow="404"
      title="Page not found"
      lede="This page may have moved, or never existed."
    >
      <ul className="wireframe-list">
        <li>
          <a href={to("/")}>Home</a>
        </li>
        <li>
          <a href={to("/archive/")}>Writing</a>
        </li>
        <li>
          <a href={to("/portfolio/")}>Work</a>
        </li>
      </ul>
    </PageHeader>
  );
}
