import { useEffect, useEffectEvent, useRef } from "react";

import type { ProfileModel } from "../../../lib/types";
import {
  degrees,
  localClock,
  localFormat,
  LocalTime,
  useForecast
} from "../../site";

import { seedOf } from "./dither";
import { cx } from "./parts";
import {
  frontRange,
  frontRangeFrame,
  momentAt,
  moonPhase,
  phaseName,
  type Sky
} from "./ridges";
import { useScene } from "./scene";

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
// Until the forecast says otherwise
const SUNRISE = 6.5;
const SUNSET = 18.5;

/** The time of day on a 24-hour clock, for `hourOf` */
const CLOCK: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23"
};
/** A reading's time, like the clock beside it, e.g. `3:04 PM` */
const READING: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit"
};

/** Decimal hours, e.g. 7:05 → 7.08 */
const decimalHours = ({ hours, minutes }: { hours: number; minutes: number }) =>
  hours + minutes / 60;

/** The time of day in Denver, in decimal hours */
function hourOf(date: Date) {
  const parts = localFormat(CLOCK).formatToParts(date);
  const part = (type: string) =>
    Number(parts.find((each) => each.type === type)?.value ?? 0);
  return decimalHours({ hours: part("hour"), minutes: part("minute") });
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
  const {
    forecast,
    current,
    label,
    condition,
    night,
    readAt,
    status,
    refresh
  } = useForecast();

  const load = useEffectEvent(refresh);
  useEffect(() => load(), []);

  const sky: Sky = condition ?? "unknown";
  const sunrise = forecast
    ? decimalHours(localClock(forecast.daily.sunrise[0]))
    : SUNRISE;
  const sunset = forecast
    ? decimalHours(localClock(forecast.daily.sunset[0]))
    : SUNSET;

  const repaint = useScene({
    frame,
    canvas,
    inks: INKS,
    source: "Front Range",
    develop: true,
    build: (columns, rows) => frontRange(columns, rows, seedOf("Front Range")),
    // The sky and the light right now, read fresh by every frame
    draw: (view, seconds) => {
      const now = new Date();
      const moment = momentAt(hourOf(now), sunrise, sunset, moonPhase(now));
      return frontRangeFrame(view, sky, moment, seconds);
    },
    // A still view keeps up with the clock
    attach: ({ still, repaint }) => {
      if (!still) return () => {};
      const minute = setInterval(repaint, 60_000);
      return () => clearInterval(minute);
    }
  });
  // Weather arriving after the first frame redraws a still view
  useEffect(() => repaint(), [repaint, sky, sunrise, sunset]);

  const weather = current && `${label}, ${degrees(current.temperature_2m)}F`;
  // A failed refresh keeps the last reading, so mark it as outdated
  const reading =
    status === "error"
      ? [
          "Weather unavailable",
          weather && readAt
            ? `last reading ${localFormat(READING).format(readAt)}: ${weather}`
            : null
        ]
      : [
          weather,
          night && readAt && (condition === "clear" || condition === "cloudy")
            ? phaseName(moonPhase(readAt))
            : null
        ];
  const notes = reading.filter(Boolean).join(" · ");

  return (
    <figure className={cx("st-view", className)}>
      <div ref={frame} className="st-terrain st-view__art" aria-hidden="true">
        <canvas ref={canvas} />
      </div>
      <figcaption>
        <span>{`The Front Range from ${location.city}`}</span>
        <span>
          <LocalTime /> {location.timeZoneName}
          {notes && ` · ${notes}`}
        </span>
      </figcaption>
    </figure>
  );
}
