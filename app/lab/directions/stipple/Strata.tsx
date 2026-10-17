import { useMemo, useRef, useState } from "react";

import type { LabContent } from "../../../lib/types";

import { bedMiddle, bedsOf, section, sectionFrame, type Bed } from "./beds";
import { DOT, seedOf } from "./dither";
import { cx } from "./parts";
import { useScene } from "./scene";

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
  /** The bed under the pointer, or -1 */
  const hover = useRef(-1);
  const [hovered, setHovered] = useState<{ bed: Bed; middle: number }>();
  const { profile, work, posts } = content;
  const years = profile.experience.years;

  // A bed for every year, from the first through this one
  const beds = useMemo(() => {
    const until = new Date().getFullYear();
    return bedsOf(work, posts, until - years, until);
  }, [work, posts, years]);

  useScene({
    frame,
    canvas,
    inks: INKS,
    source: beds,
    hold: SETTLED,
    build: (columns, rows) => section(columns, rows, seedOf("Strata"), beds),
    draw: (ground, seconds, still) =>
      sectionFrame(ground, seconds, hover.current, !still),
    // The bed under the pointer, brought forward and named
    attach: ({ element, target, state, repaint }) => {
      const point = (event: PointerEvent) => {
        const ground = state();
        if (!ground) return;
        const box = target.getBoundingClientRect();
        const x = Math.floor((event.clientX - box.left) / DOT);
        const y = Math.floor((event.clientY - box.top) / DOT);
        const inside =
          x >= 0 && y >= 0 && x < ground.width && y < ground.height;
        const next = inside ? ground.bed[y * ground.width + x] : -1;
        if (next === hover.current) return;
        hover.current = next;
        setHovered(
          next >= 0
            ? { bed: beds[next], middle: bedMiddle(ground, next) }
            : undefined
        );
        repaint();
      };
      const leave = () => {
        hover.current = -1;
        setHovered(undefined);
        repaint();
      };
      element.addEventListener("pointermove", point);
      element.addEventListener("pointerdown", point);
      element.addEventListener("pointerleave", leave);
      return () => {
        element.removeEventListener("pointermove", point);
        element.removeEventListener("pointerdown", point);
        element.removeEventListener("pointerleave", leave);
      };
    }
  });

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
