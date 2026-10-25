import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode
} from "react";

import { cx, useQueryParam, useReducedMotion } from "../../site";
import {
  Measure,
  penFor,
  project,
  type Surface,
  type Vec2,
  type Vec3
} from "../../site/isometric";

import { rigFor, type Ease, type Key, type Motion, type Rig } from "./rigs";

/*
 * Service illustrations
 * ==================================================
 * Stipple's isometric scenes, rigged in `./rigs.ts` and drawn as linework:
 * hairline outlines in ink, faces in a few flat tones, shadows hatched, the
 * ground a patch of floor grid, and the darkest parts in violet. Each one
 * plays its own short story: on a loop where it heads a service's page, and
 * while hovered on a service's tile (always at rest for reduced motion).
 * Treatments recolor the tones, and `?illo=` previews one across the site.
 */

export const TREATMENTS = {
  shaded: {
    name: "Shaded",
    note: "Flat tones by the light, hatched shadows, violet for the darkest parts"
  },
  line: {
    name: "Line",
    note: "Outlines only, faces left blank, violet details"
  },
  violet: {
    name: "Violet",
    note: "Every tone a step of violet, like a blueprint"
  }
} satisfies Record<string, { name: string; note: string }>;

export type TreatmentId = keyof typeof TREATMENTS;

export const DEFAULT_TREATMENT: TreatmentId = "shaded";

const isTreatment = (id: string): id is TreatmentId =>
  Object.hasOwn(TREATMENTS, id);

/** Scene units in SVG units, so hatching keeps one size from scene to scene */
const UNIT = 40;

/** Animation keyframes a second; the browser runs straight between them */
const FRAMES_A_SECOND = 20;

/* Drawing
   ========================================================================== */

/** A face's ink coverage as one of four tones: lit tops, the left-hand
 *  faces, the right-hand faces, and the darkest things */
type Tone = 0 | 1 | 2 | 3;
const toneOf = (coverage: number): Tone =>
  coverage < 0.3 ? 0 : coverage < 0.52 ? 1 : coverage < 0.86 ? 2 : 3;

type Shape = { part?: string } & (
  | { kind: "face"; points: Vec2[]; tone: Tone }
  | { kind: "line"; points: Vec2[]; dashed?: boolean }
  | {
      kind: "ball";
      center: Vec2;
      radius: number;
      tone: Tone;
      outline: boolean;
    }
);

/** Collects a scene as shapes, each marked with its part, and its floor */
class Linework implements Surface {
  shapes: Shape[] = [];
  shadows: Vec2[][] = [];
  /** The floor grid's lines, each from one end to the other */
  floor: [Vec2, Vec2][] = [];
  part?: string;

  fill(polygon: Vec2[], coverage: number) {
    this.shapes.push({
      kind: "face",
      points: polygon,
      tone: toneOf(coverage),
      part: this.part
    });
  }

  stroke(points: Vec2[], dashed?: boolean) {
    this.shapes.push({ kind: "line", points, dashed, part: this.part });
  }

  ball(center: Vec2, radius: number, darken: number, outline: boolean) {
    this.shapes.push({
      kind: "ball",
      center,
      radius,
      tone: toneOf(0.4 + darken),
      outline,
      part: this.part
    });
  }

  shade(polygon: Vec2[]) {
    this.shadows.push(polygon);
  }

  /** Ground is a patch of floor grid, a line every unit, cut to an ellipse */
  ground([cx, cy]: Vec2, radiusX: number, radiusY: number) {
    for (let x = Math.ceil(cx - radiusX); x <= cx + radiusX; x++) {
      const reach = radiusY * Math.sqrt(1 - ((x - cx) / radiusX) ** 2);
      this.floor.push([
        project([x, cy - reach, 0]),
        project([x, cy + reach, 0])
      ]);
    }
    for (let y = Math.ceil(cy - radiusY); y <= cy + radiusY; y++) {
      const reach = radiusX * Math.sqrt(1 - ((y - cy) / radiusY) ** 2);
      this.floor.push([
        project([cx - reach, y, 0]),
        project([cx + reach, y, 0])
      ]);
    }
  }
}

/** A rig as shapes in SVG units, with its view starting at 0, 0 */
function draw(rig: Rig) {
  const measure = new Measure();
  rig.draw(penFor(measure), (_, draw) => draw());
  rig.reach?.forEach((point) => measure.add(project(point)));

  const linework = new Linework();
  rig.draw(penFor(linework), (name, draw) => {
    const outer = linework.part;
    linework.part = name;
    draw();
    linework.part = outer;
  });

  const width = measure.right - measure.left;
  const height = measure.bottom - measure.top;
  const margin = Math.max(width, height) * 0.08;
  const origin: Vec2 = [measure.left - margin, measure.top - margin];
  const at = ([x, y]: Vec2): Vec2 => [
    Number(((x - origin[0]) * UNIT).toFixed(1)),
    Number(((y - origin[1]) * UNIT).toFixed(1))
  ];
  const size = (value: number) => ((value + margin * 2) * UNIT).toFixed(1);

  return {
    origin,
    at,
    viewBox: `0 0 ${size(width)} ${size(height)}`,
    shapes: linework.shapes,
    shadows: linework.shadows,
    ground: linework.floor
      .map(([from, to]) => `M${at(from).join(",")}L${at(to).join(",")}`)
      .join("")
  };
}

/* Motion
   ========================================================================== */

interface Pose {
  move: Vec3;
  opacity: number;
  stretch: number;
  turn: number;
}

const REST: Pose = {
  move: [0, 0, 0],
  opacity: 1,
  stretch: 1,
  turn: 0
};

const EASES: Record<Ease, (t: number) => number> = {
  linear: (t) => t,
  in: (t) => t ** 3,
  out: (t) => 1 - (1 - t) ** 3,
  "in-out": (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
};

/** Each key as a full pose, carrying forward whatever it leaves out */
function posesOf(keys: Key[]) {
  let pose = REST;
  return keys.map((key) => {
    pose = {
      move: key.move ?? pose.move,
      opacity: key.opacity ?? pose.opacity,
      stretch: key.stretch ?? pose.stretch,
      turn: key.turn ?? pose.turn
    };
    return { at: key.at, ease: key.ease ?? "in-out", pose };
  });
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** A motion's pose at a point in its loop */
function poseAt(poses: ReturnType<typeof posesOf>, t: number): Pose {
  const next = poses.findIndex((pose) => pose.at > t);
  if (next === 0) return poses[0].pose;
  if (next < 0) return poses[poses.length - 1].pose;
  const from = poses[next - 1];
  const to = poses[next];
  const f = EASES[from.ease]((t - from.at) / (to.at - from.at));
  return {
    move: [0, 1, 2].map((axis) =>
      mix(from.pose.move[axis], to.pose.move[axis], f)
    ) as Vec3,
    opacity: mix(from.pose.opacity, to.pose.opacity, f),
    stretch: mix(from.pose.stretch, to.pose.stretch, f),
    turn: mix(from.pose.turn, to.pose.turn, f)
  };
}

/** A 2×2 matrix, row by row */
type Matrix = [number, number, number, number];

/** How a plane's own coordinates (across, up) land on the screen */
const PLANES: Record<"xz" | "yz", Matrix> = {
  xz: [0.866, 0, 0.5, -1],
  yz: [-0.866, 0, 0.5, -1]
};

const times = ([a, b, c, d]: Matrix, [e, f, g, h]: Matrix): Matrix => [
  a * e + b * g,
  a * f + b * h,
  c * e + d * g,
  c * f + d * h
];

const inverse = ([a, b, c, d]: Matrix): Matrix => {
  const det = a * d - b * c;
  return [d / det, -b / det, -c / det, a / det];
};

/** Stretching by `by` along a direction on the screen */
function stretchAlong(axis: Vec3, by: number): Matrix {
  const [x, y] = project(axis);
  const length = Math.hypot(x, y) || 1;
  const [dx, dy] = [x / length, y / length];
  return [
    1 + (by - 1) * dx * dx,
    (by - 1) * dx * dy,
    (by - 1) * dx * dy,
    1 + (by - 1) * dy * dy
  ];
}

/**
 * A pose as a CSS matrix in SVG units: moved (projected onto the screen),
 * stretched along its axis, and turned in its plane, about the anchor
 */
function matrixOf(pose: Pose, motion: Motion, origin: Vec2) {
  const [mx, my] = project(pose.move);
  let local = stretchAlong(motion.axis ?? [0, 0, 1], pose.stretch);
  if (pose.turn) {
    const plane = PLANES[motion.plane ?? "xz"];
    const angle = (pose.turn * Math.PI) / 180;
    const turn: Matrix = [
      Math.cos(angle),
      -Math.sin(angle),
      Math.sin(angle),
      Math.cos(angle)
    ];
    local = times(times(times(plane, turn), inverse(plane)), local);
  }
  const anchor = motion.anchor ? project(motion.anchor) : origin;
  const ax = (anchor[0] - origin[0]) * UNIT;
  const ay = (anchor[1] - origin[1]) * UNIT;
  const [a, b, c, d] = local;
  const e = mx * UNIT + ax - (a * ax + b * ay);
  const f = my * UNIT + ay - (c * ax + d * ay);
  const round = (value: number) => Number(value.toFixed(4));
  // CSS lists a matrix's columns: a c (first), b d (second), then the move
  return `matrix(${[a, c, b, d, e, f].map(round).join(",")})`;
}

interface PartFrames {
  /** Keyframes for the part's group: transform and opacity */
  group?: Keyframe[];
  /** Its pose at rest, for the server's markup and reduced motion */
  rest: { transform?: string; opacity?: number };
}

/** Every part's keyframes over one loop, and its pose at rest */
function framesOf(rig: Rig, origin: Vec2): Record<string, PartFrames> {
  const count = Math.round(rig.seconds * FRAMES_A_SECOND);
  return Object.fromEntries(
    Object.entries(rig.motions).map(([name, motion]) => {
      const poses = posesOf(motion.keys);
      const samples = Array.from({ length: count + 1 }, (_, index) =>
        poseAt(poses, index / count)
      );
      const moves = poses.some(
        ({ pose }) =>
          pose.move.some(Boolean) || pose.stretch !== 1 || pose.turn !== 0
      );
      const fades = poses.some(({ pose }) => pose.opacity !== 1);
      const rest = samples[0];

      const frames: PartFrames = {
        rest: {
          transform: moves ? matrixOf(rest, motion, origin) : undefined,
          opacity: fades ? rest.opacity : undefined
        }
      };
      if (moves || fades) {
        frames.group = samples.map((pose) => ({
          ...(moves && { transform: matrixOf(pose, motion, origin) }),
          ...(fades && { opacity: Number(pose.opacity.toFixed(3)) })
        }));
      }
      return [name, frames];
    })
  );
}

/**
 * When a drawing plays: `auto`, on a loop while it's in view; `hover`, while
 * the link around it is hovered or focused, finishing its loop (back at
 * rest) once left; `never`, held at rest
 */
export type Playback = "auto" | "hover" | "never";

/** Plays a rig's parts, all on one clock, as `playback` says */
function usePlayback(
  frames: Record<string, PartFrames> | undefined,
  seconds: number,
  playback: Playback
) {
  const svg = useRef<SVGSVGElement>(null);
  // Turning reduced motion on cancels the animations under way, which leaves
  // the still drawing; turning it off starts them again
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = svg.current;
    if (!element || !frames || playback === "never" || reduced) return;

    const duration = seconds * 1000;
    const timing = { duration, iterations: Infinity };
    const animations = Object.entries(frames).flatMap(([name, part]) =>
      part.group
        ? [...element.querySelectorAll(`[data-part="${name}"]`)].map((group) =>
            group.animate(part.group!, timing)
          )
        : []
    );
    animations.forEach((animation) => animation.pause());

    if (playback === "auto") {
      const observer = new IntersectionObserver(
        ([entry]) =>
          animations.forEach((animation) =>
            entry.isIntersecting ? animation.play() : animation.pause()
          ),
        { threshold: 0.2 }
      );
      observer.observe(element);
      return () => {
        observer.disconnect();
        animations.forEach((animation) => animation.cancel());
      };
    }

    // Hover: loop while hovered or focused; once left, finish the loop under
    // way, which ends at rest, rather than freezing mid-story
    const target = element.closest("a") ?? element;
    let hovered = false;
    let focused = false;
    const update = () => {
      const active = hovered || focused;
      animations.forEach((animation) => {
        if (active) {
          if (animation.playState === "finished") animation.currentTime = 0;
          animation.effect?.updateTiming({ iterations: Infinity });
          animation.play();
        } else if (animation.playState === "running") {
          const time = Number(animation.currentTime ?? 0);
          animation.effect?.updateTiming({
            iterations: Math.floor(time / duration) + 1
          });
        }
      });
    };
    const on = (event: Event) => {
      if (event.type === "pointerenter") hovered = true;
      if (event.type === "pointerleave") hovered = false;
      if (event.type === "focusin") focused = true;
      if (event.type === "focusout") focused = false;
      update();
    };
    const events = ["pointerenter", "pointerleave", "focusin", "focusout"];
    events.forEach((type) => target.addEventListener(type, on));
    return () => {
      events.forEach((type) => target.removeEventListener(type, on));
      animations.forEach((animation) => animation.cancel());
    };
  }, [frames, seconds, playback, reduced]);

  return svg;
}

/* Illustration
   ========================================================================== */

/**
 * What a service is, drawn as an animated isometric scene, or nothing for a
 * service without one. `treatment` overrides the site's (and `?illo=`);
 * `playback` says when it moves. A `pausable` one that plays by itself has
 * a button to stop it (and start it again), as its loop runs past the five
 * seconds anything may move unasked.
 */
// The rigs never change, so each is drawn and sampled once, however many
// tiles show it and however often they mount (on the server too)
const arts = new Map<
  Rig,
  { drawing: ReturnType<typeof draw>; frames: Record<string, PartFrames> }
>();

function artOf(rig: Rig) {
  let art = arts.get(rig);
  if (!art) {
    const drawing = draw(rig);
    art = { drawing, frames: framesOf(rig, drawing.origin) };
    arts.set(rig, art);
  }
  return art;
}

export function ServiceArt({
  url,
  treatment,
  playback = "auto",
  pausable,
  className
}: {
  url: string;
  treatment?: TreatmentId;
  playback?: Playback;
  pausable?: boolean;
  className?: string;
}) {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const rig = rigFor(url);
  const art = rig && artOf(rig);
  const [illo] = useQueryParam("illo");
  // An id for the hatching that's safe inside `url(#…)`
  const hatch = `gl-hatch-${useId().replace(/[^\w-]/g, "")}`;
  const svg = usePlayback(
    art?.frames,
    rig?.seconds ?? 0,
    paused ? "never" : playback
  );
  if (!art) return null;
  const { drawing, frames } = art;

  const look = treatment ?? (isTreatment(illo) ? illo : DEFAULT_TREATMENT);
  const points = (list: Vec2[]) =>
    list.map((point) => drawing.at(point).join(",")).join(" ");

  const shape = (item: Shape, index: number) => {
    if (item.kind === "face") {
      return (
        <polygon
          key={index}
          className={`gl-iso__tone-${item.tone}`}
          points={points(item.points)}
        />
      );
    }
    if (item.kind === "line") {
      return (
        <polyline
          key={index}
          className={cx("gl-iso__line", item.dashed && "gl-iso__line--dashed")}
          points={points(item.points)}
        />
      );
    }
    const [x, y] = drawing.at(item.center);
    return (
      <circle
        key={index}
        className={cx(
          `gl-iso__tone-${item.tone}`,
          item.outline && "gl-iso__ball"
        )}
        cx={x}
        cy={y}
        r={(item.radius * UNIT).toFixed(1)}
      />
    );
  };

  // Runs of shapes in the same part, each run a group of its own
  const runs: { part?: string; shapes: [Shape, number][] }[] = [];
  drawing.shapes.forEach((item, index) => {
    const last = runs.at(-1);
    if (last && last.part === item.part) last.shapes.push([item, index]);
    else runs.push({ part: item.part, shapes: [[item, index]] });
  });

  const body: ReactNode[] = runs.map(({ part, shapes }, index) => {
    if (!part) {
      return (
        <Fragment key={index}>
          {shapes.map(([item, at]) => shape(item, at))}
        </Fragment>
      );
    }
    const rest = frames[part]?.rest;
    const style: CSSProperties = {
      transform: rest?.transform,
      opacity: rest?.opacity
    };
    return (
      <g key={index} className="gl-iso__part" data-part={part} style={style}>
        {shapes.map(([item, at]) => shape(item, at))}
      </g>
    );
  });

  const toggle = pausable && playback === "auto" && !reduced && (
    <button
      type="button"
      className="gl-iso__pause"
      onClick={() => setPaused(!paused)}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          fill="currentColor"
          d={paused ? "M5 3.5v9l7.5-4.5z" : "M4.5 3h2.5v10H4.5zM9 3h2.5v10H9z"}
        />
      </svg>
      <span className="gl-sr">
        {paused ? "Play the illustration" : "Pause the illustration"}
      </span>
    </button>
  );

  return (
    <>
      <svg
        ref={svg}
        className={cx("gl-iso", `gl-iso--${look}`, className)}
        viewBox={drawing.viewBox}
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={hatch}
            width="9"
            height="9"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <path className="gl-iso__hatch" d="M0 0v9" />
          </pattern>
        </defs>
        <g className="gl-iso__floor">
          <path className="gl-iso__ground" d={drawing.ground} />
          {drawing.shadows.map((shadow, index) => (
            <polygon
              key={index}
              className="gl-iso__shadow"
              points={points(shadow)}
              fill={`url(#${hatch})`}
            />
          ))}
        </g>
        {body}
      </svg>
      {toggle}
    </>
  );
}
