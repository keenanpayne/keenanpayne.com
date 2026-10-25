import { useEffect, useRef, type RefObject } from "react";

import { metadata } from "../../../lib/site";
import {
  cx,
  useMenu,
  useQueryParam,
  useReadout,
  useTo,
  type ShellProps
} from "../../site";

import { DenverClock, DenverReadout } from "./Denver";
import { Cells, Cta, DEFAULT_CTA, isCta } from "./parts";

const WIDE = "(width >= 960px)";

/** Pages that are a call to action already, so don't close with another */
const NO_CTA = new Set(["contact", "inquiry", "notFound"]);

/** How near a cross the pointer has to be to reach it, in pixels */
const CROSS_REACH = 10;

type Cross = { band: HTMLElement; side: "start" | "end" };

/** The cross within reach of a point, if one is shown there */
function crossAt(root: HTMLElement, x: number, y: number): Cross | null {
  for (const band of root.querySelectorAll<HTMLElement>(".gl-band")) {
    const box = band.getBoundingClientRect();
    if (Math.abs(y - box.top) > CROSS_REACH * 2) continue;
    for (const side of ["start", "end"] as const) {
      const mark = getComputedStyle(
        band,
        side === "start" ? "::before" : "::after"
      );
      if (mark.display === "none") continue;
      // Its middle, from its offsets in the band's padding box
      const half = parseFloat(mark.width) / 2;
      const middleX =
        side === "start"
          ? box.left + band.clientLeft + parseFloat(mark.left) + half
          : box.right - band.clientLeft - parseFloat(mark.right) - half;
      const middleY = box.top + band.clientTop + parseFloat(mark.top) + half;
      if (
        Math.abs(x - middleX) <= CROSS_REACH &&
        Math.abs(y - middleY) <= CROSS_REACH
      ) {
        return { band, side };
      }
    }
  }
  return null;
}

/**
 * The bands' crosses are drawn as their `::before` and `::after`, which
 * can't take the pointer, so this finds the one under it: marking its band
 * `data-cross` (with the side) while it's there, and `data-cross-ping` once
 * it's clicked, until that animation ends. Scrolling lets go of it.
 */
function useCrosses(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let frame = 0;
    let hovered: Cross | null = null;

    const hover = (next: Cross | null) => {
      if (next?.band === hovered?.band && next?.side === hovered?.side) return;
      hovered?.band.removeAttribute("data-cross");
      next?.band.setAttribute("data-cross", next.side);
      hovered = next;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const { clientX, clientY } = event;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        hover(crossAt(node, clientX, clientY))
      );
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      hover(null);
    };
    const onClick = (event: MouseEvent) => {
      const cross = crossAt(node, event.clientX, event.clientY);
      if (!cross) return;
      // Restarted on each click, even one landing mid-ping
      cross.band.removeAttribute("data-cross-ping");
      void cross.band.offsetWidth;
      cross.band.setAttribute("data-cross-ping", cross.side);
    };
    const onPinged = (event: AnimationEvent) => {
      if (event.animationName !== "gl-cross-ping") return;
      (event.target as Element).removeAttribute("data-cross-ping");
    };

    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerleave", onLeave);
    node.addEventListener("click", onClick);
    node.addEventListener("animationend", onPinged);
    window.addEventListener("scroll", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      node.removeEventListener("click", onClick);
      node.removeEventListener("animationend", onPinged);
      window.removeEventListener("scroll", onLeave);
    };
  }, [root]);
}

export function Shell({ view, navigation, content, children }: ShellProps) {
  const to = useTo();
  const { profile, socials } = content;
  const { open, setOpen, toggle } = useMenu(WIDE);
  const readout = useReadout(profile.location);
  // The lab previews the other closing panels from the URL
  const [ctaParam] = useQueryParam("cta");
  const cta = isCta(ctaParam) ? ctaParam : DEFAULT_CTA;
  const root = useRef<HTMLDivElement>(null);
  useCrosses(root);

  return (
    <div ref={root} className="gl">
      <a className="gl-skip" href="#gl-main">
        Skip to content
      </a>
      <div className="gl-frame">
        <header className="gl-header">
          <a className="gl-brand" href={to("/")}>
            {profile.name}
          </a>

          <nav
            id="gl-nav"
            className={cx("gl-nav", open && "gl-nav--open")}
            aria-label="Main"
          >
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

          <div className="gl-header__end">
            <DenverClock
              button={readout.button}
              label={profile.location.city}
              className="gl-header__clock"
            />
            <div className="gl-header__cta">
              <a
                className="gl-button gl-button--small"
                href={to("/project-inquiry/")}
              >
                Start a project
              </a>
            </div>
            <button
              ref={toggle}
              className="gl-menu"
              type="button"
              aria-expanded={open}
              aria-controls="gl-nav"
              onClick={() => setOpen(!open)}
            >
              Menu
              <svg viewBox="0 0 14 14" aria-hidden="true">
                <path
                  d={open ? "M2 2l10 10M12 2L2 12" : "M1 4h12M1 10h12"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
        </header>

        <main id="gl-main" className="gl-main">
          {children}
        </main>

        {!NO_CTA.has(view.kind) && <Cta email={profile.email} variant={cta} />}

        <footer className="gl-footer">
          <Cells cols={4} as="div">
            <div className="gl-cell gl-footer__brand">
              <a className="gl-brand" href={to("/")}>
                {profile.name}
              </a>
              <p>{profile.role}</p>
            </div>
            <div className="gl-cell">
              <h2 className="gl-label">Pages</h2>
              <ul>
                {navigation.map((item) => (
                  <li key={item.url}>
                    <a href={item.url}>{item.text}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="gl-cell">
              <h2 className="gl-label">Elsewhere</h2>
              <ul>
                {socials.map((social) => (
                  <li key={social.url}>
                    <a href={social.url} rel={social.rel}>
                      {social.text}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={metadata.feed.path}>RSS feed</a>
                </li>
              </ul>
            </div>
            <div className="gl-cell">
              <h2 className="gl-label">Get in touch</h2>
              <ul>
                <li>
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </li>
                <li>
                  <a href={to("/project-inquiry/")}>Project inquiry</a>
                </li>
                <li>
                  <a href={to("/contact/")}>Say hello</a>
                </li>
              </ul>
            </div>
          </Cells>

          <div className="gl-footer__bar">
            <p>{`© ${new Date().getFullYear()} ${profile.name}`}</p>
            <p>Set in Instrument Sans, Instrument Serif &amp; IBM Plex Mono</p>
            <p>
              <a href="#gl-main">
                Back to top<span aria-hidden="true"> ↑</span>
              </a>
            </p>
          </div>
        </footer>
      </div>

      <DenverReadout readout={readout} location={profile.location} />
    </div>
  );
}
