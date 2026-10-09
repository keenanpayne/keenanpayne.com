import { useEffect, useRef, useState } from "react";

import type { LabContent } from "../../../lib/types";
import { useReducedMotion } from "../../site";

import {
  bedMiddle,
  bedsOf,
  section,
  sectionFrame,
  type Bed,
  type Section
} from "./beds";
import { paint, readInks, seedOf, subscribeToScheme } from "./dither";
import { cx } from "./parts";

/*
 * Strata: the years in section
 * ==================================================
 * The About page's opener (see `./beds.ts`): a bed for every year on the
 * web, built from the portfolio and the posts. It steps a dozen frames a
 * second while it's on screen and settles fully formed when motion is
 * reduced. Hovering or tapping a bed brings it forward and names the year
 * and what it holds.
 */

// Sage, deep sage, midtones, and full ink
const INKS = ["--st-sage", "--st-sage-deep", "--st-dot-mid", "--st-dot-ink"];
const DOT = 2;
const FPS = 12;
const SETTLED = 60;

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

export function Strata({
  content,
  className
}: {
  content: Pick<LabContent, "profile" | "work" | "posts">;
  className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const still = useReducedMotion();
  const [hovered, setHovered] = useState<{ bed: Bed; middle: number }>();
  const { profile, work, posts } = content;
  const years = profile.experience.years;

  useEffect(() => {
    const element = frame.current;
    const target = canvas.current;
    if (!element || !target) return;

    // A bed for every year, from the first through this one
    const until = new Date().getFullYear();
    const beds = bedsOf(work, posts, until - years, until);

    let ground: Section | null = null;
    let inks = readInks(element, INKS);
    let seconds = still ? SETTLED : 0;
    let hover = -1;
    let request = 0;
    let drawnAt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const build = () => {
      const { width, height } = element.getBoundingClientRect();
      const columns = Math.ceil(width / DOT);
      const rows = Math.ceil(height / DOT);
      if (!columns || !rows) return;
      ground = section(columns, rows, seedOf("Strata"), beds);
      target.width = columns;
      target.height = rows;
      target.style.width = `${columns * DOT}px`;
      target.style.height = `${rows * DOT}px`;
    };

    const draw = () => {
      if (!ground) return;
      paint(
        target,
        sectionFrame(ground, seconds, hover, !still),
        ground.width,
        ground.height,
        inks
      );
    };

    const loop = (now: number) => {
      request = requestAnimationFrame(loop);
      const elapsed = (now - drawnAt) / 1000;
      if (elapsed < 1 / FPS) return;
      drawnAt = now;
      // A hidden tab pauses the loop; pick up where it left off
      seconds += Math.min(elapsed, 0.25);
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

    const resize = new ResizeObserver(() => {
      if (!ground) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        build();
        draw();
      }, 150);
    });
    resize.observe(element);

    const unsubscribe = subscribeToScheme(() => {
      inks = readInks(element, INKS);
      draw();
    });

    // The bed under the pointer, brought forward and named
    const point = (event: PointerEvent) => {
      if (!ground) return;
      const box = target.getBoundingClientRect();
      const x = Math.floor((event.clientX - box.left) / DOT);
      const y = Math.floor((event.clientY - box.top) / DOT);
      const inside = x >= 0 && y >= 0 && x < ground.width && y < ground.height;
      const next = inside ? ground.bed[y * ground.width + x] : -1;
      if (next === hover) return;
      hover = next;
      setHovered(
        next >= 0
          ? { bed: beds[next], middle: bedMiddle(ground, next) }
          : undefined
      );
      if (!request) draw();
    };
    const leave = () => {
      hover = -1;
      setHovered(undefined);
      if (!request) draw();
    };
    element.addEventListener("pointermove", point);
    element.addEventListener("pointerdown", point);
    element.addEventListener("pointerleave", leave);

    return () => {
      stop();
      intersection.disconnect();
      resize.disconnect();
      unsubscribe();
      clearTimeout(timer);
      element.removeEventListener("pointermove", point);
      element.removeEventListener("pointerdown", point);
      element.removeEventListener("pointerleave", leave);
    };
  }, [work, posts, years, still]);

  const bed = hovered?.bed;
  const holds = bed && [
    ...bed.work,
    ...(bed.posts ? [plural(bed.posts, "post")] : [])
  ];

  return (
    <figure className={cx("st-view", "st-strata", className)}>
      <div ref={frame} className="st-terrain st-view__art" aria-hidden="true">
        <canvas ref={canvas} />
        {hovered && (
          <span
            className="st-strata__tick"
            style={{ top: `${hovered.middle * 100}%` }}
          >
            {hovered.bed.year}
          </span>
        )}
      </div>
      <figcaption>
        {bed ? (
          <>
            <span>{bed.year}</span>
            <span>
              {holds?.length
                ? holds.join(" · ")
                : "No projects or posts on the site from this year"}
            </span>
          </>
        ) : (
          <>
            <span>{`${profile.experience.text}, a layer a year`}</span>
            <span>Projects lie in them as pebbles, posts as fine lines</span>
          </>
        )}
      </figcaption>
    </figure>
  );
}
