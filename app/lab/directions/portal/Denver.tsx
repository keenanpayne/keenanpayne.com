import { useMemo, useState, type CSSProperties } from "react";

import type { ProfileModel } from "../../../lib/types";
import {
  celsius,
  compass,
  coordinates,
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

import { cx, Icon, Sprite } from "./parts";
import {
  BOLT,
  cloud,
  DROP,
  FLAKE,
  MOON,
  RANGE,
  RAYS,
  SUN,
  TWINKLE
} from "./sprites";

/*
 * Denver: local time and weather
 * ==================================================
 * The strip's clock chip opens a popover with the time in Denver and live
 * weather there, as one of the portal's own panels: the clock on the
 * mascot's green screen, the sky as a pixel level over the Front Range, and
 * the readings as stat tiles.
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

/** Where falling things start, across the cloud, staggered */
const DROPS = [0, 1, 2, 3, 4, 5].map((index) => ({
  index,
  style: { "--pt-i": index } as CSSProperties
}));

/** Stars in the night sky, as percentages across and down */
const STARS = [
  [8, 20],
  [30, 12],
  [46, 34],
  [62, 10]
].map(([x, y], index) => ({
  key: index,
  style: { left: `${x}%`, top: `${y}%`, "--pt-i": index } as CSSProperties
}));

/**
 * The sky as a pixel level: the sun, the moon, clouds, and what's falling,
 * over the Front Range
 */
export function SkyLevel({
  condition,
  night
}: {
  condition?: Condition;
  night: boolean;
}) {
  const falling =
    condition === "rain" || condition === "storm" || condition === "snow";
  const cloudy = condition === "cloudy" || falling;
  const dark = falling;
  const art = useMemo(() => cloud(dark), [dark]);

  return (
    <div
      className="pt-den__level"
      aria-hidden="true"
      data-condition={condition ?? "unknown"}
      data-night={night || undefined}
    >
      {night &&
        (condition === "clear" || condition === "cloudy") &&
        STARS.map(({ key, style }) => (
          <span key={key} className="pt-den__star" style={style}>
            <Sprite art={TWINKLE} scale={2} />
          </span>
        ))}

      {!condition && (
        <span className="pt-den__seek">
          <Icon name="question" />
        </span>
      )}

      {(condition === "clear" || condition === "cloudy") &&
        (night ? (
          <Sprite art={MOON} scale={3} className="pt-den__moon" />
        ) : (
          <span className="pt-den__sun">
            <Sprite art={RAYS[0]} scale={3} className="pt-den__rays" />
            <Sprite art={RAYS[1]} scale={3} className="pt-den__rays" />
            <Sprite art={SUN} scale={3} />
          </span>
        ))}

      {cloudy && (
        <>
          <Sprite
            art={art}
            scale={2}
            className="pt-den__cloud pt-den__cloud--far"
          />
          <Sprite art={art} scale={3} className="pt-den__cloud" />
        </>
      )}

      {condition === "fog" && (
        <span className="pt-den__fog">
          {[0, 1, 2].map((index) => (
            <i key={index} style={{ "--pt-i": index } as CSSProperties} />
          ))}
        </span>
      )}

      {falling && (
        <span
          className={cx(
            "pt-den__fall",
            condition === "snow" && "pt-den__fall--snow"
          )}
        >
          {DROPS.map(({ index, style }) => (
            <span key={index} style={style}>
              <Sprite art={condition === "snow" ? FLAKE : DROP} scale={3} />
            </span>
          ))}
        </span>
      )}

      {condition === "storm" && (
        <Sprite art={BOLT} scale={3} className="pt-den__bolt" />
      )}

      <Sprite art={RANGE} scale={3} className="pt-den__range" />
    </div>
  );
}

/** The strip's clock chip: a button that opens the forecast */
export function DenverClock({
  forecast,
  location,
  className
}: {
  /** The forecast popover's id */
  forecast: string;
  location: Location;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cx("pt-clock", className)}
      popoverTarget={forecast}
      aria-label={`${location.city} local time and weather`}
    >
      <span className="pt-clock__well">
        <Icon name="clock" />
      </span>
      {location.city}
      <span className="pt-clock__time">
        <LocalTime placeholder="--:--" />
      </span>
    </button>
  );
}

/** The popover: Denver's time, sky, and weather readings */
export function DenverForecast({
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
      className="pt-den"
      role="dialog"
      aria-label={`${location.city} local time and weather`}
      onToggle={(event) => {
        const opening = event.newState === "open";
        setOpen(opening);
        if (opening) refresh();
      }}
    >
      <header className="pt-den__bar">
        <span className="pt-title__dots" aria-hidden="true" />
        <p className="pt-den__title">{location.short}</p>
        <button
          type="button"
          className="pt-den__close"
          popoverTarget={id}
          popoverTargetAction="hide"
          aria-label="Close"
        >
          <svg viewBox="0 0 7 7" shapeRendering="crispEdges" aria-hidden="true">
            <path d="M0 0h2v1h1v1h1V1h1V0h2v2H6v1H5v1h1v1h1v2H5V6H4V5H3v1H2v1H0V5h1V4h1V3H1V2H0z" />
          </svg>
        </button>
      </header>

      <div className="pt-den__screen">
        <p className="pt-den__kicker">
          <span>Local time</span>
          {now && (
            <span>{`${zoneName(now, "short")} · ${zoneName(now, "offset")}`}</span>
          )}
        </p>
        <p className="pt-den__clock">
          <time>{time || "--:--:--"}</time>
          {period && <span>{period}</span>}
        </p>
        <p className="pt-den__date">
          {now ? localFormat(DATE).format(now) : " "}
        </p>
      </div>

      <div className="pt-den__sky">
        <SkyLevel condition={condition} night={night} />
        {current ? (
          <div className="pt-den__reading">
            <p className="pt-den__temp">
              {degrees(current.temperature_2m)}
              <span>F</span>
            </p>
            <p className="pt-den__condition">
              {label}
              {night && condition === "clear" && " · Night"}
              <span>{`${celsius(current.temperature_2m)}°C`}</span>
            </p>
          </div>
        ) : (
          <p className="pt-den__message">
            {status === "error" ? (
              <>
                Weather unavailable
                <button type="button" className="pt-go" onClick={refresh}>
                  <span>Retry</span>
                  <Icon name="arrowRight" />
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
          <dl className="pt-den__facts">
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
          <p className="pt-den__daylight">
            <span>{`Sunrise ${twelveHour(forecast.daily.sunrise[0])}`}</span>
            <Icon name="arrowRight" />
            <span>{`Sunset ${twelveHour(forecast.daily.sunset[0])}`}</span>
          </p>
        </>
      )}

      <p className="pt-den__status" data-tone={tone}>
        <span className="pt-den__led" aria-hidden="true" />
        {note}
        {stale && (
          <button type="button" className="pt-go" onClick={refresh}>
            <span>Retry</span>
            <Icon name="arrowRight" />
          </button>
        )}
      </p>
      <p className="pt-den__credit">
        Weather from <a href="https://open-meteo.com/">Open-Meteo</a> ·{" "}
        {coordinates(location)}
      </p>
    </div>
  );
}
