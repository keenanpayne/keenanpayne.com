import { useRef, useState } from "react";

import type { ProfileModel } from "../../../lib/types";
import {
  celsius,
  compass,
  coordinates,
  degrees,
  localFormat,
  clockParts,
  LocalTime,
  useForecast,
  useNow,
  twelveHour,
  zoneName
} from "../../site";

import { cx } from "./parts";
import { useScene } from "./scene";
import { skyFrame, skyView, type Sky } from "./sky";

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

const DATE: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "long",
  day: "numeric"
};

/** Draws the sky into a canvas, a dozen frames a second while it's shown */
function useSky(sky: Sky, night: boolean) {
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useScene({
    frame,
    canvas,
    inks: SKY_INKS,
    source: `${sky} ${night}`,
    // A still sky, part way in
    hold: 1.5,
    build: skyView,
    draw: (view, seconds) => skyFrame(view, sky, night, seconds)
  });

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
  return (
    <button
      type="button"
      className={cx("st-clock", className)}
      popoverTarget={notes}
      aria-label={`${location.city} local time and weather`}
    >
      <LocalTime />
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
  const {
    forecast,
    current,
    label,
    condition,
    night,
    stale,
    status,
    tone,
    note,
    refresh
  } = useForecast();

  const { frame, canvas } = useSky(condition ?? "unknown", night);

  const { time, period } = clockParts(now);

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
        <p className="st-den__date">
          {now ? localFormat(DATE).format(now) : " "}
        </p>
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
                {location.elevationFeet.toLocaleString("en-US")}
                <small> ft</small>
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
