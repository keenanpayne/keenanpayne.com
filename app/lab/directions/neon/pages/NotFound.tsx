import { useTo } from "../../../site";
import { Emblem } from "../emblems";
import { KANA } from "../parts";
import { Skyline } from "../scene";

/** A sign with a dead tube: the 4, the 0, and the 4, one of them flickering */
export function NotFound() {
  const to = useTo();

  return (
    <header className="neon-lost">
      <Skyline seed={404} trail className="neon-lost__city" />
      <div className="neon-lost__sign" aria-hidden="true">
        <span>4</span>
        <span className="neon-lost__dead">0</span>
        <span>4</span>
      </div>
      <p className="neon-eyebrow">
        <span aria-hidden="true">{KANA.lost} · </span>404
      </p>
      <h1 className="neon-title">Page not found</h1>
      <p className="neon-lede">This page may have moved, or never existed.</p>
      <ul className="neon-lost__ways">
        <li>
          <a href={to("/")}>
            <Emblem kind="arches" />
            Home
          </a>
        </li>
        <li>
          <a href={to("/archive/")}>
            <Emblem kind="comb" />
            Writing
          </a>
        </li>
        <li>
          <a href={to("/portfolio/")}>
            <Emblem kind="rays" />
            Work
          </a>
        </li>
      </ul>
    </header>
  );
}
