import { useEffect, useEffectEvent, useRef } from "react";

import type { ProfileModel } from "../../../lib/types";
import {
  conditionOf,
  useForecast,
  useLocalTime,
  useReducedMotion
} from "../../site";

import { paint, readInks, seedOf, subscribeToScheme } from "./dither";
import { cx } from "./parts";
import {
  frontRange,
  frontRangeFrame,
  momentAt,
  moonPhase,
  phaseName,
  type Moment,
  type Sky,
  type View
} from "./ridges";

/*
 * Front Range: the view from Denver
 * ==================================================
 * The contact page's cover: the view west from Denver as it is right now
 * (see `./ridges.ts`), with the time and the weather there beneath it.
 * It steps a dozen frames a second while it's on screen, dissolves in like
 * the other dot art, and holds a single frame when motion is reduced.
 */

type Location = ProfileModel["location"];

// Sage, deep sage, midtones, and full ink
const INKS = ["--st-sage", "--st-sage-deep", "--st-dot-mid", "--st-dot-ink"];
const DOT = 2;
const FPS = 12;
/** Seconds the view takes to dissolve in */
const DEVELOP = 0.9;
// Until the forecast says otherwise
const SUNRISE = 6.5;
const SUNSET = 18.5;

/** Decimal hours from a local ISO time, e.g. `2026-10-09T07:05` → 7.08 */
const hoursOf = (iso?: string) =>
  iso ? Number(iso.slice(11, 13)) + Number(iso.slice(14, 16)) / 60 : undefined;

/** The time of day somewhere, in decimal hours */
function hourIn(timeZone: string, date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23"
  }).formatToParts(date);
  const part = (type: string) =>
    Number(parts.find((each) => each.type === type)?.value ?? 0);
  return part("hour") + part("minute") / 60;
}

export function FrontRange({
  location,
  className
}: {
  location: Location;
  className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const still = useReducedMotion();
  const time = useLocalTime();
  const { forecast, readAt, status, refresh } = useForecast();

  const load = useEffectEvent(refresh);
  useEffect(() => load(), []);

  const current = forecast?.current;
  const [label, condition] = forecast ? conditionOf(forecast) : [];
  const sky: Sky = condition ?? "unknown";
  const sunrise = hoursOf(forecast?.daily.sunrise[0]) ?? SUNRISE;
  const sunset = hoursOf(forecast?.daily.sunset[0]) ?? SUNSET;

  /** The sky and the light right now, read fresh by every frame */
  const conditions = useEffectEvent((): [Sky, Moment] => {
    const now = new Date();
    const hour = hourIn(location.timeZone, now);
    return [sky, momentAt(hour, sunrise, sunset, moonPhase(now))];
  });
  // Weather arriving after the first frame redraws a still view
  const redraw = useRef<() => void>(null);
  useEffect(() => redraw.current?.(), [sky, sunrise, sunset]);

  useEffect(() => {
    const element = frame.current;
    const target = canvas.current;
    if (!element || !target) return;

    let view: View | null = null;
    let inks = readInks(element, INKS);
    let seconds = 0;
    let request = 0;
    let drawnAt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const build = () => {
      const { width, height } = element.getBoundingClientRect();
      const columns = Math.ceil(width / DOT);
      const rows = Math.ceil(height / DOT);
      if (!columns || !rows) return;
      view = frontRange(columns, rows, seedOf("Front Range"));
      target.width = columns;
      target.height = rows;
      target.style.width = `${columns * DOT}px`;
      target.style.height = `${rows * DOT}px`;
    };

    const draw = () => {
      if (!view) return;
      const [sky, moment] = conditions();
      const progress = still ? 1 : Math.min(1, seconds / DEVELOP) ** 0.7;
      paint(
        target,
        frontRangeFrame(view, sky, moment, seconds),
        view.width,
        view.height,
        inks,
        progress
      );
    };
    redraw.current = draw;

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
        if (!view) build();
        draw();
        start();
      },
      { rootMargin: "200px 0px" }
    );
    intersection.observe(element);

    const resize = new ResizeObserver(() => {
      if (!view) return;
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

    // A still view keeps up with the clock
    const minute = still ? setInterval(draw, 60_000) : undefined;

    return () => {
      stop();
      intersection.disconnect();
      resize.disconnect();
      unsubscribe();
      clearTimeout(timer);
      clearInterval(minute);
      redraw.current = null;
    };
  }, [still]);

  const night = current?.is_day === 0;
  const reading = current
    ? [
        `${label}, ${Math.round(current.temperature_2m)}°F`,
        night && readAt && (condition === "clear" || condition === "cloudy")
          ? phaseName(moonPhase(readAt))
          : null
      ]
    : [status === "error" ? "Weather unavailable" : null];

  return (
    <figure className={cx("st-view", className)}>
      <div ref={frame} className="st-terrain st-view__art" aria-hidden="true">
        <canvas ref={canvas} />
      </div>
      <figcaption>
        <span>{`The Front Range from ${location.city}`}</span>
        <span>
          {[time && `${time} ${location.timeZoneName}`, ...reading]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </figcaption>
    </figure>
  );
}
