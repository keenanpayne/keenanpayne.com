import { useState, type CSSProperties } from "react";

import type { ProfileModel } from "../../../lib/types";
import {
  celsius,
  compass,
  coordinates,
  cx,
  degrees,
  localClock,
  localFormat,
  LocalTime,
  pad,
  useForecast,
  useNow,
  zoneName,
  type Condition
} from "../../site";

/*
 * Denver: local time and weather
 * ==================================================
 * The header clock opens a popover with the time in Denver and live weather
 * there, laid out as Stipple's field notes are, as a raised window: the
 * clock in the display sans, readings in outlined cells, and the sky drawn
 * as a line sketch on the grid.
 */

type Location = ProfileModel["location"];

const CLOCK: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit"
};
const READING: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit"
};
const DATE: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "long",
  day: "numeric"
};

const NOTES: Record<Condition, string> = {
  clear: "Clear skies over the Front Range",
  cloudy: "Clouds moving over the Front Range",
  fog: "Fog settled over the city",
  rain: "Rain coming down",
  snow: "Snow coming down",
  storm: "Thunderstorm overhead"
};

/** One of the forecast's local times (`…T07:05`) as `7:05 AM` */
function twelveHour(iso: string) {
  const { hours, minutes } = localClock(iso);
  return `${hours % 12 || 12}:${pad(minutes)} ${hours < 12 ? "AM" : "PM"}`;
}

/** A cloud's outline, its flat base at the origin */
const CLOUD =
  "M0 0h74a15 15 0 0 0 1-30a22 22 0 0 0-41-9a17 17 0 0 0-28 13A9 9 0 0 0 0 0z";

/** Falling marks (rain, snow) under a cloud, staggered */
const DROPS = [8, 22, 36, 50, 64].map((x, index) => ({ x, index }));

/**
 * The sky as a line sketch: the sun, the moon, clouds, and what's falling,
 * in ink with the light source in violet
 */
export function SkySketch({
  condition,
  night
}: {
  condition?: Condition;
  night: boolean;
}) {
  const falling =
    condition === "rain" || condition === "storm" || condition === "snow";
  const cloudy = condition === "cloudy" || falling;
  // Passing clouds sit low, so the sun or moon shows over them; rain and
  // snow clouds sit high, over what's falling
  const [far, near] =
    condition === "cloudy"
      ? ["translate(28 60) scale(0.7)", "translate(48 84)"]
      : ["translate(42 44) scale(0.7)", "translate(66 66)"];

  return (
    <svg
      className="gl-den__sketch"
      viewBox="0 0 160 110"
      aria-hidden="true"
      data-condition={condition ?? "unknown"}
    >
      {!condition && (
        <g className="gl-den__seek">
          <circle cx="112" cy="50" r="10" />
          <path d="M112 30v12M112 58v12M92 50h12M120 50h12" />
        </g>
      )}

      {(condition === "clear" || condition === "cloudy") &&
        (night ? (
          <g className="gl-den__moon">
            <path d="M122 26a18 18 0 1 0 14 30a14 14 0 0 1-14-30z" />
            <path className="gl-den__star" d="M84 22v6M81 25h6" />
            <path className="gl-den__star" d="M146 74v5M143.5 76.5h5" />
          </g>
        ) : (
          <g className="gl-den__sun">
            <circle cx="122" cy="40" r="13" />
            <g className="gl-den__rays">
              {Array.from({ length: 12 }, (_, index) => (
                <path
                  key={index}
                  d="M122 19v-6"
                  transform={`rotate(${index * 30} 122 40)`}
                />
              ))}
            </g>
          </g>
        ))}

      {cloudy && (
        <g className="gl-den__clouds">
          <path
            className="gl-den__cloud gl-den__cloud--far"
            d={CLOUD}
            transform={far}
          />
          <path className="gl-den__cloud" d={CLOUD} transform={near} />
        </g>
      )}

      {condition === "fog" && (
        <g className="gl-den__fog">
          {[38, 52, 66, 80].map((y, index) => (
            <path
              key={y}
              d={`M${index % 2 ? 46 : 58} ${y}h${index % 2 ? 96 : 88}`}
              style={{ "--gl-i": index } as CSSProperties}
            />
          ))}
        </g>
      )}

      {falling && (
        <g
          className={cx(
            "gl-den__fall",
            condition === "snow" && "gl-den__fall--snow"
          )}
          transform="translate(70 74)"
        >
          {DROPS.map(({ x, index }) =>
            condition === "snow" ? (
              <circle
                key={x}
                cx={x}
                cy="6"
                r="1.75"
                style={{ "--gl-i": index } as CSSProperties}
              />
            ) : (
              <path
                key={x}
                d={`M${x} 2l-4 9`}
                style={{ "--gl-i": index } as CSSProperties}
              />
            )
          )}
        </g>
      )}

      {condition === "storm" && (
        <path
          className="gl-den__bolt"
          d="M108 70l-8 14h8l-5 13l14-18h-8l5-9z"
        />
      )}
    </svg>
  );
}

/** A button that opens the readout; the header and the footer each have one */
export function DenverClock({
  readout,
  location,
  className,
  label
}: {
  /** The readout popover's id */
  readout: string;
  location: Location;
  className?: string;
  /** Shown before the time, e.g. the city */
  label?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      popoverTarget={readout}
      aria-label={`${location.city} local time and weather`}
    >
      {label && <span>{label}</span>}
      <LocalTime />
    </button>
  );
}

/** The popover: Denver's time, sky, and weather readings */
export function DenverReadout({
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
    readAt,
    status,
    refresh
  } = useForecast();

  const [tone, note] =
    status === "error"
      ? [
          "off",
          stale && readAt
            ? `Couldn’t refresh · Last reading ${localFormat(READING).format(readAt)}`
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

  const clock = now ? localFormat(CLOCK).formatToParts(now) : [];
  const time = clock
    .filter((part) => part.type !== "dayPeriod")
    .map((part) => part.value)
    .join("")
    .trim();
  const period = clock.find((part) => part.type === "dayPeriod")?.value;

  return (
    <div
      id={id}
      popover="auto"
      className="gl-den"
      role="dialog"
      aria-label={`${location.city} local time and weather`}
      onToggle={(event) => {
        const opening = event.newState === "open";
        setOpen(opening);
        if (opening) refresh();
      }}
    >
      <header className="gl-den__bar">
        <span className="gl-window__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <p>Local readout</p>
        <p>{location.short}</p>
        <button
          type="button"
          className="gl-den__close"
          popoverTarget={id}
          popoverTargetAction="hide"
          aria-label="Close"
        >
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </header>

      <div className="gl-den__time">
        <p className="gl-den__kicker">
          <span>Local time</span>
          {now && (
            <span>{`${zoneName(now, "short")} · ${zoneName(now, "offset")}`}</span>
          )}
        </p>
        <p className="gl-den__clock">
          <time>{time || "--:--:--"}</time>
          {period && <span>{period}</span>}
        </p>
        <p className="gl-den__date">
          {now ? localFormat(DATE).format(now) : " "}
        </p>
      </div>

      <div className="gl-den__sky" data-night={night || undefined}>
        <SkySketch condition={condition} night={night} />
        {current ? (
          <div className="gl-den__reading">
            <p className="gl-den__temp">
              {degrees(current.temperature_2m)}
              <span>F</span>
            </p>
            <p className="gl-den__condition">
              {label}
              {night && condition === "clear" && " · Night"}
              <span>{`${celsius(current.temperature_2m)}°C`}</span>
            </p>
          </div>
        ) : (
          <p className="gl-den__message">
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
          <dl className="gl-den__facts">
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
          <p className="gl-den__sun">
            <span>{`Sunrise ${twelveHour(forecast.daily.sunrise[0])}`}</span>
            <span>{`Sunset ${twelveHour(forecast.daily.sunset[0])}`}</span>
          </p>
        </>
      )}

      <p className="gl-den__status" data-tone={tone}>
        <span className="gl-den__dot" aria-hidden="true" />
        {note}
        {stale && (
          <button type="button" onClick={refresh}>
            Retry
          </button>
        )}
      </p>
      <p className="gl-den__credit">
        Weather from <a href="https://open-meteo.com/">Open-Meteo</a> ·{" "}
        {coordinates(location)}
      </p>
    </div>
  );
}
