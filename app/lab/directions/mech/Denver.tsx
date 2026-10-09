import { useId, type ReactNode } from "react";

import { profile } from "../../../data/profile";
import {
  celsius,
  compass,
  conditionOf,
  coordinates,
  useForecast,
  useNow,
  zoneName,
  type Condition
} from "../../site";

/*
 * Denver clock and weather
 * ==================================================
 * The header clock opens a popover with the local time and live weather
 * (see `site/weather.ts`). The sky readout is restyled for the current
 * conditions: sun or stars, drifting cloud, fog, rain, snow, or a red storm
 * alert.
 */

const { city, short, timeZone: ZONE } = profile.location;

const clockFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: ZONE
});
const readingFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: ZONE
});
const dateFormat = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: ZONE
});

const STATUS: Record<Condition, [tone: string, text: string]> = {
  clear: ["green", "Condition green · Visibility nominal"],
  cloudy: ["amber", "Cloud cover · Sensors partly obscured"],
  fog: ["amber", "Low visibility"],
  rain: ["cyan", "Precipitation detected"],
  snow: ["cyan", "Frozen precipitation detected"],
  storm: ["red", "警報 · Thunderstorm detected"]
};

/** Line-art weather glyphs in a 64×64 box */
function Glyph({ condition, night }: { condition: Condition; night: boolean }) {
  const cloud = (
    <path d="M18 44h28a10 10 0 0 0 0-20 14 14 0 0 0-27-3 11 11 0 0 0-1 23Z" />
  );
  const svg = (children: ReactNode, className?: string) => (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {children}
    </svg>
  );

  return (
    <span className="mc-den__glyph" aria-hidden="true">
      {condition === "clear" && !night && (
        <>
          {svg(
            <>
              <circle cx="32" cy="32" r="11" />
              {Array.from({ length: 8 }, (_, i) => (
                <line
                  key={i}
                  x1="32"
                  y1="13"
                  x2="32"
                  y2="17"
                  transform={`rotate(${i * 45} 32 32)`}
                />
              ))}
            </>
          )}
          {svg(
            <circle cx="32" cy="32" r="24" strokeDasharray="3 6" />,
            "mc-den__ring"
          )}
        </>
      )}
      {condition === "clear" &&
        night &&
        svg(
          <>
            <path d="M40 14a18 18 0 1 0 10 30 15 15 0 0 1-10-30Z" />
            <path d="M14 14v6M11 17h6M50 50v4M48 52h4" strokeWidth="1.5" />
          </>
        )}
      {condition === "cloudy" && svg(cloud)}
      {condition === "fog" &&
        svg(
          <path
            d="M10 24h44M16 32h38M10 40h40M18 48h30"
            strokeDasharray="20 4"
          />
        )}
      {condition === "rain" &&
        svg(
          <>
            {cloud}
            <path d="M24 50l-3 7M34 50l-3 7M44 50l-3 7" />
          </>
        )}
      {condition === "snow" &&
        svg(
          <>
            {cloud}
            <path d="M24 52v6M21 55h6M38 52v6M35 55h6" strokeWidth="1.5" />
          </>
        )}
      {condition === "storm" &&
        svg(
          <>
            {cloud}
            <path
              d="m35 40-8 12h7l-4 10 10-14h-7l4-8Z"
              fill="currentColor"
              stroke="none"
            />
          </>
        )}
    </span>
  );
}

/** The header clock, and the popover it opens */
export function DenverStatus() {
  const id = useId();
  const now = useNow();
  const { forecast, readAt, status, refresh } = useForecast();

  const current = forecast?.current;
  const [label, condition] = forecast ? conditionOf(forecast) : ["", undefined];
  const night = current?.is_day === 0;
  // A failed refresh keeps the last reading on screen, marked as outdated
  const stale = status === "error" && !!current;
  const [tone, statusText] =
    status === "error"
      ? [
          "amber",
          stale && readAt
            ? `Telemetry offline · Last reading ${readingFormat.format(readAt)}`
            : "Telemetry offline · Weather unavailable"
        ]
      : condition
        ? STATUS[condition]
        : ["amber", "Acquiring telemetry"];

  const fahrenheit = (value: number) => `${Math.round(value)}°`;
  const time = (iso?: string) => iso?.slice(11) ?? "--:--";

  return (
    <>
      <button
        type="button"
        className="mc-hud__clock"
        popoverTarget={id}
        aria-label={`${city} local time and weather`}
      >
        <span>{city.slice(0, 3)}</span>
        <time>{now ? clockFormat.format(now) : "--:--:--"}</time>
      </button>

      <div
        id={id}
        popover="auto"
        className="mc-panel mc-den"
        role="dialog"
        aria-label={`${city} local time and weather`}
        data-condition={condition}
        data-night={night ? "" : undefined}
        onToggle={(event) => event.newState === "open" && refresh()}
      >
        <div className="mc-panel__head">
          <span className="mc-panel__label">Atmospheric scan</span>
          <span className="mc-panel__code">{short}</span>
          <button
            type="button"
            className="mc-den__close"
            popoverTarget={id}
            popoverTargetAction="hide"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mc-den__time">
          <p className="mc-den__kicker">
            Local time
            {now && (
              <span>
                {zoneName(now, "short")} · {zoneName(now, "offset")}
              </span>
            )}
          </p>
          <p className="mc-den__clock">
            <time>{now ? clockFormat.format(now) : "--:--:--"}</time>
          </p>
          <p className="mc-den__date">{now ? dateFormat.format(now) : " "}</p>
        </div>

        <div className="mc-den__sky">
          <span className="mc-den__fx" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          {current && condition ? (
            <>
              <Glyph condition={condition} night={night} />
              <div className="mc-den__reading">
                <p className="mc-den__temp">
                  {fahrenheit(current.temperature_2m)}
                  <span>F</span>
                  <small>{celsius(current.temperature_2m)}°C</small>
                </p>
                <p className="mc-den__condition">
                  {label}
                  {night && condition === "clear" && " · Night"}
                </p>
              </div>
            </>
          ) : (
            <p className="mc-den__message">
              {status === "error" ? (
                <>
                  Telemetry offline
                  <button type="button" onClick={refresh}>
                    Retry
                  </button>
                </>
              ) : (
                "Acquiring telemetry…"
              )}
            </p>
          )}
        </div>

        {current && forecast && (
          <>
            <dl className="mc-den__readouts">
              <div>
                <dt>Feels like</dt>
                <dd>{fahrenheit(current.apparent_temperature)}</dd>
              </div>
              <div>
                <dt>High</dt>
                <dd>{fahrenheit(forecast.daily.temperature_2m_max[0])}</dd>
              </div>
              <div>
                <dt>Low</dt>
                <dd>{fahrenheit(forecast.daily.temperature_2m_min[0])}</dd>
              </div>
              <div>
                <dt>Humidity</dt>
                <dd>{current.relative_humidity_2m}%</dd>
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
            <p className="mc-den__sun">
              <span>Sunrise {time(forecast.daily.sunrise[0])}</span>
              <span>Sunset {time(forecast.daily.sunset[0])}</span>
            </p>
          </>
        )}

        <p className="mc-den__status" data-tone={tone}>
          <span className="mc-dot" aria-hidden="true" />
          {statusText}
          {stale && (
            <button type="button" onClick={refresh}>
              Retry
            </button>
          )}
        </p>
        <p className="mc-den__credit">
          Weather data: <a href="https://open-meteo.com/">Open-Meteo</a> ·{" "}
          {coordinates(profile.location)}
        </p>
      </div>
    </>
  );
}
