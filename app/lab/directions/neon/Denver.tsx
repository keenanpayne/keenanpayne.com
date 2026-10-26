import type { ProfileModel } from "../../../lib/types";
import {
  celsius,
  clockParts,
  compass,
  coordinates,
  degrees,
  LocalTime,
  twelveHour,
  useNow,
  zoneName,
  type Condition,
  type Readout
} from "../../site";

import { Emblem, type EmblemKind } from "./emblems";
import { KANA } from "./parts";

/*
 * Local time and weather
 * ==================================================
 * The header's clock is an LED panel under a little 営業中 ("open") sign;
 * it opens a holographic readout with the time to the second, the
 * conditions under an emblem for the weather, and every reading in a grid
 * of lit cells. Both are wired by `useReadout()` in the Shell.
 */

type Location = ProfileModel["location"];

/** An emblem for each kind of weather */
export const SKY: Record<Condition, EmblemKind> = {
  clear: "burst",
  cloudy: "waves",
  fog: "stripes",
  rain: "bars",
  snow: "mesh",
  storm: "pinwheel"
};

/** The button that opens the weather */
export function DenverClock({
  button,
  location
}: {
  button: Readout["button"];
  location: Location;
}) {
  return (
    <button {...button} className="neon-clock">
      <span className="neon-clock__open" aria-hidden="true">
        {KANA.open}
      </span>
      <span className="neon-clock__city">{location.city}</span>
      <span className="neon-clock__time">
        <LocalTime />
      </span>
    </button>
  );
}

/** The popover: the local time, then the forecast once it loads */
export function DenverWeather({
  readout,
  location
}: {
  readout: Readout;
  location: Location;
}) {
  const {
    popover,
    close,
    open,
    credit,
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
  } = readout;
  const now = useNow(open);
  const { time, period } = clockParts(now);

  return (
    <div {...popover} className="neon-weather">
      <header className="neon-weather__head">
        <p className="neon-weather__eyebrow">
          <span aria-hidden="true">{KANA.weather} · </span>
          {location.name}
        </p>
        <button {...close} className="neon-weather__close">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      </header>

      <div className="neon-weather__clock">
        <Emblem
          kind={condition ? SKY[condition] : "rings"}
          className="neon-weather__emblem"
        />
        <p className="neon-weather__time">
          {time || "--:--:--"}
          <span className="neon-weather__period">{period}</span>
        </p>
        <p className="neon-weather__zone">
          {now ? `${zoneName(now, "short")} · ${zoneName(now, "offset")}` : " "}
          {night ? " · Night" : ""}
        </p>
      </div>

      {current && forecast ? (
        <>
          <p className="neon-weather__now">
            <span className="neon-weather__temp">
              {degrees(current.temperature_2m)}F
            </span>
            <span className="neon-weather__alt">
              {celsius(current.temperature_2m)}°C
            </span>
            <span className="neon-weather__label">{label}</span>
          </p>
          <dl className="neon-weather__grid">
            {[
              ["Feels like", degrees(current.apparent_temperature)],
              ["High", degrees(forecast.daily.temperature_2m_max[0])],
              ["Low", degrees(forecast.daily.temperature_2m_min[0])],
              ["Humidity", `${current.relative_humidity_2m}%`],
              [
                "Wind",
                `${Math.round(current.wind_speed_10m)} mph ${compass(current.wind_direction_10m)}`
              ],
              [
                "Elevation",
                `${location.elevationFeet.toLocaleString("en-US")} ft`
              ],
              ["Sunrise", twelveHour(forecast.daily.sunrise[0])],
              ["Sunset", twelveHour(forecast.daily.sunset[0])]
            ].map(([term, detail]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <p className="neon-weather__wait" role="status">
          {status === "error" ? "Weather unavailable" : "Loading the weather…"}
        </p>
      )}

      <p className={`neon-weather__status neon-weather__status--${tone}`}>
        {note}
        {(status === "error" || stale) && (
          <button
            type="button"
            className="neon-weather__retry"
            onClick={refresh}
          >
            Retry
          </button>
        )}
      </p>

      <p className="neon-weather__credit">
        Weather from <a href={credit.href}>{credit.text}</a> ·{" "}
        {coordinates(location)}
      </p>
    </div>
  );
}
