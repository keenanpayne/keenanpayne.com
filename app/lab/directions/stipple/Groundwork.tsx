import { useRef, type RefObject } from "react";

import { DOT, seedOf } from "./dither";
import { BUILT, fitPlot, groundwork, groundworkFrame } from "./ground";
import { cx } from "./parts";
import { useScene } from "./scene";

/*
 * Groundwork: the home hero's art
 * ==================================================
 * The hero's drift terrain, surveyed and built on in a loop (see
 * `./ground.ts`), stepping a dozen frames a second while it's on
 * screen. It dissolves in like the other dot art, holds the finished site
 * when motion is reduced, and, under a mouse, looks beneath the surface.
 */

// Terrain inks, then midtones and full ink for the site
const INKS = ["--st-sage", "--st-sage-deep", "--st-dot-mid", "--st-dot-ink"];
/** Clear space around the site, in CSS pixels */
const GAP = 28;

export function Groundwork({
  seed,
  scale = 260,
  avoid,
  className
}: {
  seed: string;
  /** Size of the terrain's largest features, in CSS pixels */
  scale?: number;
  /** The hero's copy, which the site is built above */
  avoid?: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const frame = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  /** The cell under the mouse, where the lens looks under the surface */
  const lens = useRef<{ x: number; y: number } | null>(null);

  useScene({
    frame,
    canvas,
    inks: INKS,
    source: `${seed} ${scale}`,
    hold: BUILT,
    develop: true,
    build: (columns, rows, element) => {
      // The site goes in the open ground below the hero's top edge (the
      // frame reaches up under the chrome) and above its copy
      const box = element.getBoundingClientRect();
      const top = element.parentElement?.getBoundingClientRect().top ?? box.top;
      const bottom = avoid?.current?.getBoundingClientRect().top ?? box.bottom;
      const plot = fitPlot(
        columns,
        Math.ceil((top - box.top + GAP) / DOT),
        Math.floor((Math.min(bottom, box.bottom) - box.top - GAP) / DOT)
      );
      return groundwork(columns, rows, seedOf(seed), scale / DOT, plot);
    },
    draw: (ground, seconds) => groundworkFrame(ground, seconds, lens.current),
    attach: ({ element, target, still, watch }) => {
      // Rebuild when the copy changes size too (e.g. as fonts load)
      if (avoid?.current) watch(avoid.current);

      // A mouse over the art looks under its surface
      lens.current = null;
      if (still) return () => {};
      const onPointer = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const box = target.getBoundingClientRect();
        const top =
          element.parentElement?.getBoundingClientRect().top ?? box.top;
        const inside =
          event.clientX >= box.left &&
          event.clientX < box.right &&
          event.clientY >= Math.max(box.top, top) &&
          event.clientY < box.bottom;
        lens.current = inside
          ? {
              x: Math.floor((event.clientX - box.left) / DOT),
              y: Math.floor((event.clientY - box.top) / DOT)
            }
          : null;
      };
      const onLeave = () => {
        lens.current = null;
      };
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      return () => {
        window.removeEventListener("pointermove", onPointer);
        document.documentElement.removeEventListener("pointerleave", onLeave);
      };
    }
  });

  return (
    <span
      ref={frame}
      className={cx("st-terrain", "st-terrain--drift", className)}
      aria-hidden="true"
    >
      <canvas ref={canvas} />
    </span>
  );
}
