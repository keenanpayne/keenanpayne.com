import { useEffect, useState } from "react";

import { MoreLink, useTo } from "../parts";

const CX = 400;
const CY = 250;

/** Circle around the origin as a path, so text can run around it */
const ring = (r: number) =>
  `M${-r},0a${r},${r} 0 1,1 ${r * 2},0a${r},${r} 0 1,1 ${-r * 2},0`;

const RINGS = [262, 300, 338, 376, 414];
// Room outside each ring's path for its glyphs
const RING_MARGIN = 28;
const LINES = [76, 96, 116, 136, 156, 176, 196, 216];

/** One arm of the central emblem, rotated into place around the core */
function Arm({
  angle,
  href,
  label,
  flip
}: {
  angle: number;
  href: string;
  label: string;
  flip?: boolean;
}) {
  return (
    <g transform={`rotate(${angle} ${CX} ${CY})`}>
      {/* Mouse shortcut only; the same routes are listed in the panel */}
      <a href={href} className="mc-defense__arm" tabIndex={-1}>
        <path d={`M${CX + 52},${CY - 22}h150l-14,44h-150Z`} />
        <text
          x={CX + 120}
          y={CY + 6}
          transform={flip ? `rotate(180 ${CX + 120} ${CY})` : undefined}
        >
          {label}
        </text>
      </a>
    </g>
  );
}

function useSecondsSince() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(
      () => setSeconds(Math.floor((Date.now() - start) / 1000)),
      1000
    );
    return () => clearInterval(timer);
  }, []);

  return seconds;
}

export function NotFound() {
  const to = useTo();
  const seconds = useSecondsSince();
  const counter = String(seconds)
    .padStart(6, "0")
    .replace(/^(\d{3})/, "$1,");

  return (
    <section className="mc-defense">
      {/*
        Layered so the rings can turn on the compositor: the dial, then each
        ring as its own square layer rotated as a whole, then the emblem. The
        dial is cropped by height at every width, so one of its units is
        always 1/800 of the screen's width, and the rings are sized in
        container units to match.
      */}
      <div
        className="mc-defense__screen"
        role="img"
        aria-label="A defensive screen of concentric rings repeating 404"
      >
        <svg
          className="mc-defense__layer"
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="mc-defense-tint" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" className="mc-defense__stop1" />
              <stop offset="0.5" className="mc-defense__stop2" />
              <stop offset="1" className="mc-defense__stop3" />
            </linearGradient>
          </defs>
          <g className="mc-defense__lines">
            {LINES.map((r) => (
              <circle key={r} cx={CX} cy={CY} r={r} />
            ))}
          </g>
        </svg>

        {/*
          The wrapper turns, not the SVG: SVG text is re-laid out whenever its
          own SVG is transformed, which would cost a layout and repaint every
          frame.
        */}
        {RINGS.map((r, index) => {
          const size = r + RING_MARGIN;
          return (
            <div
              key={r}
              className={`mc-defense__ring mc-defense__ring--${index % 2 ? "ccw" : "cw"}`}
              style={{
                width: `${size / 4}cqw`,
                animationDuration: `${90 + index * 25}s`
              }}
            >
              <svg
                viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`}
                aria-hidden="true"
              >
                <path id={`mc-ring-${r}`} d={ring(r)} fill="none" />
                <text>
                  {/* Stretched to the circumference so the seam is even */}
                  <textPath
                    href={`#mc-ring-${r}`}
                    textLength={Math.floor(r * 2 * Math.PI)}
                    lengthAdjust="spacing"
                  >
                    {"404\u00a0".repeat(Math.floor((r * 2 * Math.PI) / 64))}
                  </textPath>
                </text>
              </svg>
            </div>
          );
        })}

        <svg
          className="mc-defense__layer"
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <g className="mc-defense__numbers">
            {[8, 7, 6, 5, 4, 3, 2].map((n, i) => (
              <text key={n} x={CX - 200 + i * 20} y={CY + 5}>
                {n}
              </text>
            ))}
          </g>

          <Arm angle={-90} href={to("/")} label="FRONT PAGE" />
          <Arm angle={30} href={to("/archive/")} label="RECORDS" />
          <Arm angle={150} href={to("/portfolio/")} label="UNITS" flip />

          <path
            className="mc-defense__core"
            d={`M${CX - 30},${CY - 52}h60l30,52-30,52h-60l-30-52Z`}
          />
          <text className="mc-defense__coreText" x={CX} y={CY - 4}>
            404
          </text>
          <text className="mc-defense__coreSmall" x={CX} y={CY + 16}>
            ORIGINAL
          </text>
        </svg>
      </div>

      <div className="mc-defense__box mc-defense__box--tl">
        <h1>Page not found</h1>
        <p>on KP-01 original</p>
      </div>
      <div className="mc-defense__box mc-defense__box--tr">
        <p className="mc-defense__small">Time since signal lost</p>
        <p className="mc-defense__big" aria-hidden="true">
          {counter} <small>sec.</small>
        </p>
      </div>
      <div className="mc-defense__box mc-defense__box--bl">
        <p className="mc-defense__big">Error No. 404</p>
        <p>This page may have moved, or never existed. Try another route.</p>
      </div>
      <nav className="mc-defense__box mc-defense__box--br" aria-label="Routes">
        <p className="mc-defense__small">Routes available</p>
        <MoreLink href={to("/")}>Front page</MoreLink>
        <MoreLink href={to("/archive/")}>Writing archive</MoreLink>
        <MoreLink href={to("/portfolio/")}>Case studies</MoreLink>
      </nav>
    </section>
  );
}
