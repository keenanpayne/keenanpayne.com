import { useId, useMemo } from "react";

import { cx, useQueryParam } from "../../site";
import {
  Measure,
  penFor,
  project,
  type Scene,
  type Surface,
  type Vec2
} from "../../site/isometric";
import { sceneFor } from "../../site/scenes";

/*
 * Service illustrations
 * ==================================================
 * The same isometric scenes as Stipple's (`../../site/scenes.ts`), drawn as
 * linework: hairline outlines in ink, faces in a few flat tones, shadows
 * hatched, the ground a patch of floor grid, and the darkest parts (windows,
 * screens, pages of type) in violet. Treatments recolor the tones; `?illo=`
 * previews one across the site.
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

/** A face's ink coverage as one of four tones: lit tops, the left-hand
 *  faces, the right-hand faces, and the darkest things */
type Tone = 0 | 1 | 2 | 3;
const toneOf = (coverage: number): Tone =>
  coverage < 0.3 ? 0 : coverage < 0.52 ? 1 : coverage < 0.86 ? 2 : 3;

type Shape =
  | { kind: "face"; points: Vec2[]; tone: Tone }
  | { kind: "line"; points: Vec2[]; dashed?: boolean }
  | {
      kind: "ball";
      center: Vec2;
      radius: number;
      tone: Tone;
      outline: boolean;
    };

/** Collects a scene as shapes, with the floor (ground, shadows) apart */
class Linework implements Surface {
  shapes: Shape[] = [];
  shadows: Vec2[][] = [];
  /** The floor grid's lines, each from one end to the other */
  floor: [Vec2, Vec2][] = [];

  fill(polygon: Vec2[], coverage: number) {
    this.shapes.push({ kind: "face", points: polygon, tone: toneOf(coverage) });
  }

  stroke(points: Vec2[], dashed?: boolean) {
    this.shapes.push({ kind: "line", points, dashed });
  }

  ball(center: Vec2, radius: number, darken: number, outline: boolean) {
    this.shapes.push({
      kind: "ball",
      center,
      radius,
      tone: toneOf(0.4 + darken),
      outline
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

const at = ([x, y]: Vec2) =>
  `${(x * UNIT).toFixed(1)},${(y * UNIT).toFixed(1)}`;
const points = (list: Vec2[]) => list.map(at).join(" ");

/** A scene as shapes in SVG units, and the box that fits it */
function draw(scene: Scene) {
  const measure = new Measure();
  scene(penFor(measure));
  const linework = new Linework();
  scene(penFor(linework));

  const width = measure.right - measure.left;
  const height = measure.bottom - measure.top;
  const margin = Math.max(width, height) * 0.08;
  const viewBox = [
    (measure.left - margin) * UNIT,
    (measure.top - margin) * UNIT,
    (width + margin * 2) * UNIT,
    (height + margin * 2) * UNIT
  ]
    .map((value) => value.toFixed(1))
    .join(" ");

  return {
    viewBox,
    shapes: linework.shapes,
    shadows: linework.shadows,
    ground: linework.floor
      .map(([from, to]) => `M${at(from)}L${at(to)}`)
      .join("")
  };
}

/**
 * What a service is, drawn as an isometric scene, or nothing for a service
 * without one. `treatment` overrides the site's (and `?illo=`).
 */
export function ServiceArt({
  url,
  treatment,
  className
}: {
  url: string;
  treatment?: TreatmentId;
  className?: string;
}) {
  const scene = sceneFor(url);
  const drawing = useMemo(() => scene && draw(scene), [scene]);
  const [param] = useQueryParam("illo");
  // An id for the hatching that's safe inside `url(#…)`
  const hatch = `gl-hatch-${useId().replace(/[^\w-]/g, "")}`;
  if (!drawing) return null;

  const look = treatment ?? (isTreatment(param) ? param : DEFAULT_TREATMENT);

  return (
    <svg
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
      <path className="gl-iso__ground" d={drawing.ground} />
      {drawing.shadows.map((shadow, index) => (
        <polygon
          key={index}
          className="gl-iso__shadow"
          points={points(shadow)}
          fill={`url(#${hatch})`}
        />
      ))}
      {drawing.shapes.map((shape, index) =>
        shape.kind === "face" ? (
          <polygon
            key={index}
            className={`gl-iso__tone-${shape.tone}`}
            points={points(shape.points)}
          />
        ) : shape.kind === "line" ? (
          <polyline
            key={index}
            className={cx(
              "gl-iso__line",
              shape.dashed && "gl-iso__line--dashed"
            )}
            points={points(shape.points)}
          />
        ) : (
          <circle
            key={index}
            className={cx(
              `gl-iso__tone-${shape.tone}`,
              shape.outline && "gl-iso__ball"
            )}
            cx={(shape.center[0] * UNIT).toFixed(1)}
            cy={(shape.center[1] * UNIT).toFixed(1)}
            r={(shape.radius * UNIT).toFixed(1)}
          />
        )
      )}
    </svg>
  );
}
