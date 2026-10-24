import { useId } from "react";

import { cx } from "../../site";

/*
 * The city
 * ==================================================
 * A night skyline drawn from a seed: three depths of towers with lit
 * windows, vertical neon strips and billboards, holographic rings around
 * the tallest, blinking beacons, and a pink light trail sweeping past at
 * street level. The same seed always draws the same city, on the server
 * and in the browser, and every color comes from the skin's tokens.
 */

/** A small, seeded random number generator (mulberry32) */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WIDTH = 1600;
const HEIGHT = 600;
const TONES = ["pink", "cyan", "amber", "violet", "lime"] as const;
export type Tone = (typeof TONES)[number];

interface Tower {
  x: number;
  w: number;
  h: number;
  /** Which window pattern lights it */
  windows: number;
  strip?: { x: number; y: number; h: number; tone: Tone };
  screen?: { y: number; h: number; tone: Tone };
  ring?: boolean;
  beacon?: boolean;
  crown?: number;
}

interface City {
  layers: Tower[][];
}

/** Towers across the width, at one depth */
function towers(
  random: () => number,
  {
    count,
    min,
    max,
    width: [narrow, wide],
    edges = false,
    signs = 0
  }: {
    count: number;
    min: number;
    max: number;
    width: [number, number];
    /** Taller at the edges, framing a street down the middle */
    edges?: boolean;
    /** The chance a tower carries a neon strip or screen */
    signs?: number;
  }
): Tower[] {
  const list: Tower[] = [];
  let x = -40;
  for (let index = 0; index < count && x < WIDTH + 40; index++) {
    const w = Math.round(narrow + random() * (wide - narrow));
    const middle = Math.abs(x + w / 2 - WIDTH / 2) / (WIDTH / 2);
    const lift = edges ? 0.35 + middle * 0.65 : 0.55 + random() * 0.45;
    const h = Math.round(min + (max - min) * lift * (0.75 + random() * 0.25));
    const tower: Tower = { x, w, h, windows: Math.floor(random() * 3) };
    if (random() < signs) {
      tower.strip = {
        x: Math.round(x + 4 + random() * (w - 12)),
        y: Math.round(HEIGHT - h + 12 + random() * 30),
        h: Math.round(h * (0.25 + random() * 0.35)),
        tone: TONES[Math.floor(random() * TONES.length)]
      };
    } else if (random() < signs * 0.6 && w > 50) {
      tower.screen = {
        y: Math.round(HEIGHT - h + 16 + random() * 40),
        h: Math.round(26 + random() * 40),
        tone: TONES[Math.floor(random() * TONES.length)]
      };
    }
    if (random() < 0.3) tower.crown = Math.round(6 + random() * 18);
    list.push(tower);
    x += w + Math.round(random() * 14) - 4;
  }
  return list;
}

const cities = new Map<number, City>();

/** The city a seed draws, built once */
function cityOf(seed: number): City {
  let city = cities.get(seed);
  if (city) return city;
  const random = seeded(seed);
  const far = towers(random, {
    count: 40,
    min: 240,
    max: 520,
    width: [36, 80],
    signs: 0.15
  });
  const mid = towers(random, {
    count: 30,
    min: 170,
    max: 440,
    width: [48, 110],
    signs: 0.45
  });
  const near = towers(random, {
    count: 24,
    min: 90,
    max: 330,
    width: [60, 130],
    edges: true,
    signs: 0.5
  });
  // The tallest of the middle depth wear holographic rings and beacons
  [...mid]
    .sort((a, b) => b.h - a.h)
    .slice(0, 2)
    .forEach((tower) => (tower.ring = true));
  [...far, ...mid]
    .filter((tower) => tower.h > 400)
    .forEach((tower) => (tower.beacon = true));
  city = { layers: [far, mid, near] };
  cities.set(seed, city);
  return city;
}

/** Window patterns: a tile of lit and dark panes, three ways */
function WindowPatterns({ id }: { id: string }) {
  const random = seeded(7);
  return (
    <>
      {[0, 1, 2].map((variant) => (
        <pattern
          key={variant}
          id={`${id}-w${variant}`}
          width={42}
          height={54}
          patternUnits="userSpaceOnUse"
        >
          {Array.from({ length: 6 }, (_, row) =>
            Array.from({ length: 6 }, (_, col) => {
              const lit = random();
              if (lit > 0.42 - variant * 0.08) return null;
              const tone = lit < 0.1 ? "pink" : lit < 0.2 ? "amber" : "cyan";
              return (
                <rect
                  key={`${row}-${col}`}
                  className={`neon-city__pane neon-city__pane--${tone}`}
                  x={col * 7 + 2}
                  y={row * 9 + 2}
                  width={3}
                  height={4}
                />
              );
            })
          )}
        </pattern>
      ))}
    </>
  );
}

const DEPTHS = ["far", "mid", "near"] as const;

/**
 * A skyline. `seed` picks the city; `trail` draws the light trail, and
 * `rings` the holograms (Home's hero has both, page headers neither).
 */
export function Skyline({
  seed = 1,
  trail = false,
  rings = false,
  className
}: {
  seed?: number;
  trail?: boolean;
  rings?: boolean;
  className?: string;
}) {
  const id = `neon${useId().replace(/[^\w-]/g, "")}`;
  const { layers } = cityOf(seed);

  return (
    <svg
      className={cx("neon-city", className)}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <WindowPatterns id={id} />
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="neon-city__haze-top" />
          <stop offset="1" className="neon-city__haze-bottom" />
        </linearGradient>
      </defs>

      {layers.map((layer, depth) => (
        <g
          key={depth}
          className={`neon-city__depth neon-city__depth--${DEPTHS[depth]}`}
        >
          {layer.map((tower) => {
            const top = HEIGHT - tower.h;
            return (
              <g key={tower.x}>
                {tower.crown && (
                  <rect
                    className="neon-city__tower"
                    x={tower.x + tower.w * 0.2}
                    y={top - tower.crown}
                    width={tower.w * 0.6}
                    height={tower.crown + 1}
                  />
                )}
                {tower.beacon && (
                  <>
                    <line
                      className="neon-city__mast"
                      x1={tower.x + tower.w / 2}
                      y1={top - (tower.crown ?? 0)}
                      x2={tower.x + tower.w / 2}
                      y2={top - (tower.crown ?? 0) - 28}
                    />
                    <circle
                      className="neon-city__beacon"
                      cx={tower.x + tower.w / 2}
                      cy={top - (tower.crown ?? 0) - 28}
                      r={2.5}
                      style={{ animationDelay: `${(tower.x % 7) * 0.4}s` }}
                    />
                  </>
                )}
                <rect
                  className="neon-city__tower"
                  x={tower.x}
                  y={top}
                  width={tower.w}
                  height={tower.h}
                />
                <rect
                  className="neon-city__windows"
                  x={tower.x + 4}
                  y={top + 8}
                  width={Math.max(0, tower.w - 8)}
                  height={Math.max(0, tower.h - 8)}
                  fill={`url(#${id}-w${tower.windows})`}
                />
              </g>
            );
          })}
          {/* Signs glow, a depth at a time */}
          <g filter={`url(#${id}-glow)`}>
            {layer.map(
              (tower) =>
                tower.strip && (
                  <rect
                    key={`s${tower.x}`}
                    className={`neon-city__sign neon-city__sign--${tower.strip.tone}`}
                    x={tower.strip.x}
                    y={tower.strip.y}
                    width={depth === 2 ? 7 : 4}
                    height={tower.strip.h}
                    rx={2}
                  />
                )
            )}
            {layer.map(
              (tower) =>
                tower.screen && (
                  <rect
                    key={`b${tower.x}`}
                    className={`neon-city__screen neon-city__sign--${tower.screen.tone}`}
                    x={tower.x + 6}
                    y={tower.screen.y}
                    width={tower.w - 12}
                    height={tower.screen.h}
                  />
                )
            )}
          </g>
          {depth === 0 && (
            <rect
              className="neon-city__haze"
              x={0}
              y={0}
              width={WIDTH}
              height={HEIGHT}
              fill={`url(#${id}-haze)`}
            />
          )}
        </g>
      ))}

      {rings &&
        layers[1]
          .filter((tower) => tower.ring)
          .map((tower, index) => {
            const centerX = tower.x + tower.w / 2;
            const centerY = HEIGHT - tower.h * (0.62 - index * 0.12);
            return (
              <g key={`r${tower.x}`} filter={`url(#${id}-glow)`}>
                {[0, 1].map((band) => (
                  <ellipse
                    key={band}
                    className={cx(
                      "neon-city__ring",
                      band > 0 && "neon-city__ring--back"
                    )}
                    cx={centerX}
                    cy={centerY + band * 22}
                    rx={tower.w * 0.95 + band * 8}
                    ry={11 + band * 2}
                  />
                ))}
              </g>
            );
          })}

      {trail && (
        <g filter={`url(#${id}-glow)`}>
          <path
            className="neon-city__trail"
            d={`M-40 ${HEIGHT - 20}C420 ${HEIGHT - 80} 980 ${HEIGHT - 10} ${WIDTH + 40} ${HEIGHT - 120}`}
          />
          <path
            className="neon-city__trail neon-city__trail--cyan"
            d={`M-40 ${HEIGHT - 6}C520 ${HEIGHT - 50} 1100 ${HEIGHT + 6} ${WIDTH + 40} ${HEIGHT - 70}`}
          />
        </g>
      )}
    </svg>
  );
}

/** Power lines sagging across the top of the street */
export function Wires({ className }: { className?: string }) {
  return (
    <svg
      className={cx("neon-wires", className)}
      viewBox="0 0 1200 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M-10 6Q300 58 610 14T1210 22" />
      <path d="M-10 18Q420 70 760 30T1210 8" />
      <path d="M-10 2Q180 34 380 12Q760 64 1210 36" />
    </svg>
  );
}
