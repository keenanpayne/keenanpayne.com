import { useEffect, useMemo, useRef, useState } from "react";

import type { ProfileModel } from "../../../lib/types";
import {
  celsius,
  compass,
  conditionOf,
  coordinates,
  pad,
  useForecast,
  useLocalTime,
  useNow,
  useReducedMotion,
  zoneName,
  type Condition
} from "../../site";

import { paint, readInks, subscribeToScheme } from "./dither";
import { cx } from "./parts";
import { skyFrame, type Sky } from "./sky";

/*
 * Denver: local time and weather
 * ==================================================
 * The header clock opens a popover with the time in Denver and live
 * weather there, like Mech's atmospheric scan, as a page of field notes:
 * the clock in the display serif, readings in monospace, and the sky drawn
 * in moving stipple for the current conditions.
 */

type Location = ProfileModel["location"];

// Sky inks: sage, then midtones, then full ink
const SKY_INKS = ["--st-sage", "--st-dot-mid", "--st-dot-ink"];
const DOT = 2;
const FPS = 12;

const NOTES: Record<Condition, string> = {
  clear: "Clear skies over the Front Range",
  cloudy: "Clouds moving over the Front Range",
  fog: "Fog settled over the city",
  rain: "Rain coming down",
  snow: "Snow coming down",
  storm: "Thunderstorm overhead"
};

/** `07:05` from a local ISO time, as `7:05 AM` */
const twelveHour = (iso?: string) => {
  if (!iso) return "--:--";
  const [hours, minutes] = iso.slice(11, 16).split(":").map(Number);
  return `${hours % 12 || 12}:${pad(minutes)} ${hours < 12 ? "AM" : "PM"}`;
};

/** Draws the sky into a canvas, a dozen frames a second while it's shown */
function useSky(sky: Sky, night: boolean, shown: boolean) {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const still = useReducedMotion();

  useEffect(() => {
    const element = frame.current;
    const target = canvas.current;
    if (!shown || !element || !target) return;

    let inks = readInks(element, SKY_INKS);
    const draw = (time: number) => {
      const { width, height } = element.getBoundingClientRect();
      const columns = Math.ceil(width / DOT);
      const rows = Math.ceil(height / DOT);
      if (!columns || !rows) return;
      if (target.width !== columns || target.height !== rows) {
        target.width = columns;
        target.height = rows;
        target.style.width = `${columns * DOT}px`;
        target.style.height = `${rows * DOT}px`;
      }
      paint(
        target,
        skyFrame(columns, rows, sky, night, time),
        columns,
        rows,
        inks
      );
    };

    const start = performance.now();
    let request = 0;
    let drawnAt = 0;
    const loop = (now: number) => {
      if (now - drawnAt >= 1000 / FPS) {
        drawnAt = now;
        draw((now - start) / 1000);
      }
      request = requestAnimationFrame(loop);
    };

    // A still sky, part way in, when motion is reduced
    draw(still ? 1.5 : 0);
    if (!still) request = requestAnimationFrame(loop);

    const unsubscribe = subscribeToScheme(() => {
      inks = readInks(element, SKY_INKS);
      if (still) draw(1.5);
    });
    return () => {
      cancelAnimationFrame(request);
      unsubscribe();
    };
  }, [sky, night, shown, still]);

  return { frame, canvas };
}

/** A button that opens the notes; the header and the footer each have one */
export function DenverClock({
  notes,
  location,
  className
}: {
  /** The notes popover's id */
  notes: string;
  location: Location;
  className?: string;
}) {
  const time = useLocalTime();

  return (
    <button
      type="button"
      className={cx("st-clock", className)}
      popoverTarget={notes}
      aria-label={`${location.city} local time and weather`}
    >
      {time ?? "--:--"}
    </button>
  );
}

/** The popover: Denver's time, sky, and weather readings */
export function DenverNotes({
  id,
  location
}: {
  id: string;
  location: Location;
}) {
  const [open, setOpen] = useState(false);
  const now = useNow(open);
  const { forecast, readAt, status, refresh } = useForecast();

  const formats = useMemo(() => {
    const { timeZone } = location;
    return {
      clock: new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        timeZone
      }),
      reading: new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone
      }),
      date: new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone
      })
    };
  }, [location]);

  const current = forecast?.current;
  const [label, condition] = forecast ? conditionOf(forecast) : ["", undefined];
  const night = current?.is_day === 0;
  // A failed refresh keeps the last reading, marked as outdated
  const stale = status === "error" && !!current;

  const [tone, note] =
    status === "error"
      ? [
          "off",
          stale && readAt
            ? `Couldn’t refresh · Last reading ${formats.reading.format(readAt)}`
            : "Couldn’t reach the weather service"
        ]
      : condition
        ? [
            condition === "storm" ? "alert" : "on",
            night && condition === "clear"
              ? "Clear night over the Front Range"
              : NOTES[condition]
          ]
        : ["wait", "Reading the sky…"];

  const { frame, canvas } = useSky(condition ?? "unknown", night, open);

  const clock = now ? formats.clock.formatToParts(now) : [];
  const time = clock
    .filter((part) => part.type !== "dayPeriod")
    .map((part) => part.value)
    .join("")
    .trim();
  const period = clock.find((part) => part.type === "dayPeriod")?.value;
  const degrees = (value: number) => `${Math.round(value)}°`;

  return (
    <div
      id={id}
      popover="auto"
      className="st-den"
      role="dialog"
      aria-label={`${location.city} local time and weather`}
      data-condition={condition}
      onToggle={(event) => {
        const opening = event.newState === "open";
        setOpen(opening);
        if (opening) refresh();
      }}
    >
      <header className="st-den__head">
        <p>Field notes</p>
        <p>{location.short}</p>
        <button
          type="button"
          className="st-den__close"
          popoverTarget={id}
          popoverTargetAction="hide"
          aria-label="Close"
        >
          ×
        </button>
      </header>

      <div className="st-den__time">
        <p className="st-den__kicker">
          Local time
          {now && (
            <span>{`${zoneName(now, "short")} · ${zoneName(now, "offset")}`}</span>
          )}
        </p>
        <p className="st-den__clock">
          <time>{time || "--:--:--"}</time>
          {period && <span>{period}</span>}
        </p>
        <p className="st-den__date">{now ? formats.date.format(now) : " "}</p>
      </div>

      <div ref={frame} className="st-den__sky">
        <canvas ref={canvas} aria-hidden="true" />
        {current ? (
          <div className="st-den__reading">
            <p className="st-den__temp">
              {degrees(current.temperature_2m)}
              <span>F</span>
            </p>
            <p className="st-den__condition">
              {label}
              {night && condition === "clear" && " · Night"}
              <span>{`${celsius(current.temperature_2m)}°C`}</span>
            </p>
          </div>
        ) : (
          <p className="st-den__message">
            {status === "error" ? (
              <>
                Weather unavailable
                <button type="button" onClick={refresh}>
                  Retry
                </button>
              </>
            ) : (
              "Reading the sky…"
            )}
          </p>
        )}
      </div>

      {current && forecast && (
        <>
          <dl className="st-den__facts">
            <div>
              <dt>Feels like</dt>
              <dd>{degrees(current.apparent_temperature)}</dd>
            </div>
            <div>
              <dt>High</dt>
              <dd>{degrees(forecast.daily.temperature_2m_max[0])}</dd>
            </div>
            <div>
              <dt>Low</dt>
              <dd>{degrees(forecast.daily.temperature_2m_min[0])}</dd>
            </div>
            <div>
              <dt>Humidity</dt>
              <dd>{`${current.relative_humidity_2m}%`}</dd>
            </div>
            <div>
              <dt>Wind</dt>
              <dd>
                {Math.round(current.wind_speed_10m)}
                <small> mph </small>
                {compass(current.wind_direction_10m)}
              </dd>
            </div>
            <div>
              <dt>Elevation</dt>
              <dd>
                5,280<small> ft</small>
              </dd>
            </div>
          </dl>
          <p className="st-den__sun">
            <span>{`Sunrise ${twelveHour(forecast.daily.sunrise[0])}`}</span>
            <span>{`Sunset ${twelveHour(forecast.daily.sunset[0])}`}</span>
          </p>
        </>
      )}

      <p className="st-den__status" data-tone={tone}>
        <span className="st-den__dot" aria-hidden="true" />
        {note}
        {stale && (
          <button type="button" onClick={refresh}>
            Retry
          </button>
        )}
      </p>
      <p className="st-den__credit">
        Weather from <a href="https://open-meteo.com/">Open-Meteo</a> ·{" "}
        {coordinates(location)}
      </p>
    </div>
  );
}
