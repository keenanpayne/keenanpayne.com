import { useEffect, useRef, type RefObject } from "react";

import { useReducedMotion } from "../../site";

import { paint, readInks, seedOf, subscribeToScheme } from "./dither";
import {
  BUILT,
  fitPlot,
  groundwork,
  groundworkFrame,
  type Ground
} from "./ground";
import { cx } from "./parts";

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
const DOT = 2;
const FPS = 12;
/** Seconds the terrain takes to dissolve in */
const DEVELOP = 0.9;
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
  const still = useReducedMotion();

  useEffect(() => {
    const element = frame.current;
    const target = canvas.current;
    if (!element || !target) return;

    let ground: Ground | null = null;
    let inks = readInks(element, INKS);
    let time = still ? BUILT : 0;
    let lens: { x: number; y: number } | null = null;
    let request = 0;
    let drawnAt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const build = () => {
      const box = element.getBoundingClientRect();
      const columns = Math.ceil(box.width / DOT);
      const rows = Math.ceil(box.height / DOT);
      if (!columns || !rows) return;

      // The site goes in the open ground below the hero's top edge (the
      // frame reaches up under the chrome) and above its copy
      const top = element.parentElement?.getBoundingClientRect().top ?? box.top;
      const bottom = avoid?.current?.getBoundingClientRect().top ?? box.bottom;
      const plot = fitPlot(
        columns,
        Math.ceil((top - box.top + GAP) / DOT),
        Math.floor((Math.min(bottom, box.bottom) - box.top - GAP) / DOT)
      );

      ground = groundwork(columns, rows, seedOf(seed), scale / DOT, plot);
      target.width = columns;
      target.height = rows;
      target.style.width = `${columns * DOT}px`;
      target.style.height = `${rows * DOT}px`;
    };

    const draw = () => {
      if (!ground) return;
      const progress = still ? 1 : Math.min(1, time / DEVELOP) ** 0.7;
      paint(
        target,
        groundworkFrame(ground, time, lens),
        ground.width,
        ground.height,
        inks,
        progress
      );
    };

    const loop = (now: number) => {
      request = requestAnimationFrame(loop);
      const elapsed = (now - drawnAt) / 1000;
      if (elapsed < 1 / FPS) return;
      drawnAt = now;
      // A hidden tab pauses the loop; pick up where it left off
      time += Math.min(elapsed, 0.25);
      draw();
    };
    const start = () => {
      if (still || request) return;
      drawnAt = performance.now();
      request = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(request);
      request = 0;
    };

    const intersection = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return stop();
        if (!ground) build();
        draw();
        start();
      },
      { rootMargin: "200px 0px" }
    );
    intersection.observe(element);

    // Rebuild when the frame or the copy changes size (e.g. as fonts load)
    const resize = new ResizeObserver(() => {
      if (!ground) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        build();
        draw();
      }, 150);
    });
    resize.observe(element);
    if (avoid?.current) resize.observe(avoid.current);

    const unsubscribe = subscribeToScheme(() => {
      inks = readInks(element, INKS);
      draw();
    });

    // A mouse over the art looks under its surface
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = target.getBoundingClientRect();
      const top = element.parentElement?.getBoundingClientRect().top ?? box.top;
      const inside =
        event.clientX >= box.left &&
        event.clientX < box.right &&
        event.clientY >= Math.max(box.top, top) &&
        event.clientY < box.bottom;
      lens = inside
        ? {
            x: Math.floor((event.clientX - box.left) / DOT),
            y: Math.floor((event.clientY - box.top) / DOT)
          }
        : null;
    };
    const onLeave = () => {
      lens = null;
    };
    if (!still) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      intersection.disconnect();
      resize.disconnect();
      unsubscribe();
      clearTimeout(timer);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [seed, scale, avoid, still]);

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
