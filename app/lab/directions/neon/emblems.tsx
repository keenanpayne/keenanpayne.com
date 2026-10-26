import { useId } from "react";

import { cx } from "../../site";

/*
 * Emblems
 * ==================================================
 * Line-art badges stroked in a cyan-to-magenta gradient, after sets of neon
 * geometric icons: rings, wavy blooms, warped grids, spirals, sunbursts,
 * and their half-domes, which line the footer's horizon. Each is a pure
 * function of its kind, so the server and the browser draw the same thing.
 */

/** Whole emblems, drawn in a 100 × 100 box */
export const EMBLEMS = [
  "rings",
  "bloom",
  "waves",
  "mesh",
  "bars",
  "orbit",
  "pinwheel",
  "burst",
  "quarters",
  "target",
  "stripes",
  "globe"
] as const;

/** Half-domes, drawn in a 100 × 50 box standing on its bottom edge */
export const DOMES = [
  "rays",
  "arches",
  "dome",
  "fan",
  "comb",
  "swirl"
] as const;

export type EmblemKind = (typeof EMBLEMS)[number] | (typeof DOMES)[number];

const C = 50;
const R = 44;
const TAU = Math.PI * 2;

const round = (value: number) => Math.round(value * 100) / 100;

/** A point at `angle` (radians, clockwise from three o'clock) and `radius` */
const at = (angle: number, radius: number, cy = C) =>
  `${round(C + Math.cos(angle) * radius)} ${round(cy + Math.sin(angle) * radius)}`;

/** A closed polar curve, r(θ), as a path */
function polar(radius: (angle: number) => number, steps = 120) {
  let d = "";
  for (let step = 0; step <= steps; step++) {
    const angle = (step / steps) * TAU;
    d += `${step ? "L" : "M"}${at(angle, radius(angle))}`;
  }
  return `${d}Z`;
}

/** A wavy line from (x, top) to (x, bottom) */
function wavy(x: number, top: number, bottom: number, amp: number, phase = 0) {
  let d = `M${round(x + Math.sin(phase) * amp)} ${top}`;
  for (let y = top + 3; y <= bottom; y += 3) {
    d += `L${round(x + Math.sin(y / 6 + phase) * amp)} ${y}`;
  }
  return d;
}

/** Half the chord of the whole emblem's circle at `x` */
const chord = (x: number, radius = R) =>
  Math.sqrt(Math.max(0, radius * radius - (x - C) * (x - C)));

const DOT = { strokeDasharray: "0 5", strokeLinecap: "round" } as const;

type Draw = (ids: { clip: string }) => React.ReactNode;

const range = (from: number, to: number, step: number) => {
  const values: number[] = [];
  for (let value = from; value <= to + 1e-6; value += step) values.push(value);
  return values;
};

const SHAPES: Record<EmblemKind, Draw> = {
  rings: () => (
    <>
      <circle cx={C} cy={C} r={R} />
      <circle cx={C} cy={C} r={34} {...DOT} />
      <circle cx={C} cy={C} r={24} {...DOT} strokeDasharray="0 4" />
      <circle cx={C} cy={C} r={14} />
    </>
  ),
  bloom: () => (
    <>
      {[0, 1, 2].map((loop) => (
        <path
          key={loop}
          d={polar(
            (angle) => 31 + 11 * Math.sin(5 * angle + (loop * TAU) / 15)
          )}
        />
      ))}
    </>
  ),
  waves: ({ clip }) => (
    <>
      <g clipPath={`url(#${clip})`}>
        {range(10, 90, 8).map((x, index) => (
          <path key={x} d={wavy(x, 0, 100, 3.2, index * 0.9)} />
        ))}
      </g>
      <circle cx={C} cy={C} r={R} />
    </>
  ),
  mesh: ({ clip }) => (
    <>
      <g clipPath={`url(#${clip})`}>
        {range(8, 92, 10).map((value) => (
          <path
            key={`h${value}`}
            d={range(0, 100, 4)
              .map(
                (x, index) =>
                  `${index ? "L" : "M"}${x} ${round(value + Math.sin(x / 14 + value / 20) * 6)}`
              )
              .join("")}
          />
        ))}
        {range(8, 92, 10).map((value) => (
          <path
            key={`v${value}`}
            d={range(0, 100, 4)
              .map(
                (y, index) =>
                  `${index ? "L" : "M"}${round(value + Math.sin(y / 14 + value / 16) * 6)} ${y}`
              )
              .join("")}
          />
        ))}
      </g>
      <circle cx={C} cy={C} r={R} />
    </>
  ),
  bars: () => (
    <>
      {range(14, 86, 6).map((x, index) => (
        <path
          key={x}
          d={wavy(
            x,
            round(C - chord(x) * 0.92),
            round(C + chord(x) * 0.92),
            1.2,
            index
          )}
        />
      ))}
    </>
  ),
  orbit: () => (
    <>
      {[0, 60, 120].map((angle) => (
        <ellipse
          key={angle}
          cx={C}
          cy={C}
          rx={R}
          ry={15}
          transform={`rotate(${angle} ${C} ${C})`}
        />
      ))}
      <circle cx={C} cy={C} r={4} className="neon-emblem__fill" />
    </>
  ),
  pinwheel: () => (
    <>
      {range(0, 7, 1).map((blade) => {
        const angle = (blade / 8) * TAU;
        return (
          <path
            key={blade}
            className="neon-emblem__fill"
            d={`M${C} ${C}Q${at(angle - 0.7, 30)} ${at(angle, R)}A${R} ${R} 0 0 1 ${at(angle + 0.42, R)}Q${at(angle - 0.25, 22)} ${C} ${C}Z`}
          />
        );
      })}
    </>
  ),
  burst: () => (
    <path
      className="neon-emblem__fill"
      d={`${range(0, 31, 1)
        .map(
          (point) =>
            `${point ? "L" : "M"}${at((point / 32) * TAU, point % 2 ? 30 : R)}`
        )
        .join("")}Z`}
    />
  ),
  quarters: ({ clip }) => (
    <>
      <g clipPath={`url(#${clip}-a)`}>
        {range(-100, 100, 7).map((x) => (
          <line key={x} x1={x} y1={0} x2={x + 100} y2={100} />
        ))}
      </g>
      <g clipPath={`url(#${clip}-b)`}>
        {[40, 32, 24, 16, 8].map((radius) => (
          <circle
            key={radius}
            cx={C}
            cy={C}
            r={radius}
            {...DOT}
            strokeDasharray="0 4"
          />
        ))}
      </g>
      <circle cx={C} cy={C} r={R} {...DOT} strokeDasharray="0 4" />
    </>
  ),
  target: () => (
    <>
      <circle cx={C} cy={C} r={R} />
      <circle cx={C} cy={C} r={36} {...DOT} strokeDasharray="0 4" />
      <circle cx={C} cy={C} r={27} />
      <circle cx={C} cy={C} r={18} {...DOT} strokeDasharray="0 3.5" />
      <circle cx={C} cy={C} r={7} className="neon-emblem__fill" />
    </>
  ),
  stripes: ({ clip }) => (
    <>
      <g clipPath={`url(#${clip})`}>
        {range(10, 90, 7).map((y) => (
          <line key={`h${y}`} x1={0} y1={y} x2={C} y2={y} />
        ))}
        {range(56, 96, 7).map((x) => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={100} />
        ))}
      </g>
      <line x1={C} y1={C - R} x2={C} y2={C + R} />
      <circle cx={C} cy={C} r={R} />
    </>
  ),
  globe: () => (
    <>
      <circle cx={C} cy={C} r={R} />
      {[30, 14].map((rx) => (
        <ellipse key={rx} cx={C} cy={C} rx={rx} ry={R} />
      ))}
      <line x1={C} y1={C - R} x2={C} y2={C + R} />
      {[-30, -15, 0, 15, 30].map((dy) => (
        <line
          key={dy}
          x1={round(C - chord(C + dy))}
          y1={C + dy}
          x2={round(C + chord(C + dy))}
          y2={C + dy}
          {...(dy % 30 ? DOT : {})}
          strokeDasharray={dy % 30 ? "0 4" : undefined}
        />
      ))}
    </>
  ),

  // Domes stand on y = 50
  rays: () => (
    <>
      {range(0, 15, 1).map((ray) => {
        const angle = Math.PI + (ray / 15) * Math.PI;
        return (
          <line
            key={ray}
            x1={round(C + Math.cos(angle) * 8)}
            y1={round(50 + Math.sin(angle) * 8)}
            x2={round(C + Math.cos(angle) * 46)}
            y2={round(50 + Math.sin(angle) * 46)}
          />
        );
      })}
      <line x1={2} y1={50} x2={98} y2={50} />
    </>
  ),
  arches: () => (
    <>
      {[46, 36, 26, 16].map((radius, index) => (
        <path
          key={radius}
          d={`M${C - radius} 50A${radius} ${radius} 0 0 1 ${C + radius} 50`}
          {...(index % 2 ? DOT : {})}
          strokeDasharray={index % 2 ? "0 4" : undefined}
        />
      ))}
    </>
  ),
  dome: ({ clip }) => (
    <>
      <g clipPath={`url(#${clip})`}>
        {range(-40, 140, 9).map((x) => (
          <line key={`a${x}`} x1={x} y1={0} x2={x - 50} y2={50} />
        ))}
        {range(-40, 140, 9).map((x) => (
          <line key={`b${x}`} x1={x} y1={0} x2={x + 50} y2={50} />
        ))}
      </g>
      <path d="M4 50A46 46 0 0 1 96 50Z" />
    </>
  ),
  fan: ({ clip }) => (
    <>
      <g clipPath={`url(#${clip})`}>
        {range(-50, 100, 8).map((x) => (
          <line key={x} x1={x} y1={50} x2={x + 50} y2={0} />
        ))}
      </g>
      <path d="M4 50A46 46 0 0 1 96 50" />
    </>
  ),
  comb: () => (
    <>
      {range(8, 92, 6).map((x, index) => (
        <path key={x} d={wavy(x, round(50 - chord(x, 46)), 50, 0.8, index)} />
      ))}
    </>
  ),
  swirl: () => (
    <>
      {range(0, 11, 1).map((ray) => {
        const angle = Math.PI + (ray / 11) * Math.PI;
        const bend = angle - 0.5;
        return (
          <path
            key={ray}
            d={`M${C} 50Q${round(C + Math.cos(bend) * 30)} ${round(50 + Math.sin(bend) * 30)} ${round(C + Math.cos(angle) * 46)} ${round(50 + Math.sin(angle) * 46)}`}
          />
        );
      })}
    </>
  )
};

const isDome = (kind: EmblemKind) =>
  (DOMES as readonly string[]).includes(kind);

/** An emblem by its place in a list, so neighbors differ */
export const emblemAt = (index: number) => EMBLEMS[index % EMBLEMS.length];

/** An emblem for some text, so the same page always gets the same one */
export function emblemFor(text: string) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return EMBLEMS[Math.abs(hash) % EMBLEMS.length];
}

/** A line-art emblem in the skin's gradient; decoration unless `label`led */
export function Emblem({
  kind,
  className,
  label
}: {
  kind: EmblemKind;
  className?: string;
  label?: string;
}) {
  const id = `neon${useId().replace(/[^\w-]/g, "")}`;
  const dome = isDome(kind);
  const height = dome ? 50 : 100;

  return (
    <svg
      className={cx("neon-emblem", dome && "neon-emblem--dome", className)}
      viewBox={`0 0 100 ${height}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <defs>
        <linearGradient
          id={`${id}-ink`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="100"
          y2={height}
        >
          <stop offset="0" className="neon-emblem__from" />
          <stop offset="0.55" className="neon-emblem__via" />
          <stop offset="1" className="neon-emblem__to" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          {dome ? (
            <path d="M4 50A46 46 0 0 1 96 50Z" />
          ) : (
            <circle cx={C} cy={C} r={R} />
          )}
        </clipPath>
        <clipPath id={`${id}-clip-a`}>
          <path
            d={`M${C} ${C}L${C} ${C - R}A${R} ${R} 0 0 0 ${C - R} ${C}ZM${C} ${C}L${C} ${C + R}A${R} ${R} 0 0 0 ${C + R} ${C}Z`}
          />
        </clipPath>
        <clipPath id={`${id}-clip-b`}>
          <path
            d={`M${C} ${C}L${C} ${C - R}A${R} ${R} 0 0 1 ${C + R} ${C}ZM${C} ${C}L${C} ${C + R}A${R} ${R} 0 0 1 ${C - R} ${C}Z`}
          />
        </clipPath>
      </defs>
      <g
        fill="none"
        stroke={`url(#${id}-ink)`}
        style={{ ["--neon-emblem-ink" as string]: `url(#${id}-ink)` }}
      >
        {SHAPES[kind]({ clip: `${id}-clip` })}
      </g>
    </svg>
  );
}
