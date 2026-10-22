import type { ProfileModel } from "../../../lib/types";
import {
  celsius,
  compass,
  coordinates,
  degrees,
  LocalTime,
  twelveHour,
  useForecast
} from "../../site";

/*
 * Local time and weather
 * ==================================================
 * Every direction's Shell has a clock that opens a popover with the time
 * where the owner is and the weather there, read the same way everywhere
 * (`useForecast()` in `site/weather.ts`). This is it with nothing but the
 * readings, in the order every direction shows them.
 */

type Location = ProfileModel["location"];

/** The button that opens the weather */
export function DenverClock({
  popover,
  location
}: {
  /** The weather popover's id */
  popover: string;
  location: Location;
}) {
  return (
    <button
      type="button"
      className="wireframe-clock"
      popoverTarget={popover}
      aria-label={`${location.city} local time and weather`}
    >
      {`${location.city} `}
      <LocalTime />
    </button>
  );
}

/** The popover: the local time, then the forecast once it loads */
export function DenverWeather({
  id,
  location
}: {
  id: string;
  location: Location;
}) {
  const { forecast, current, label, stale, status, refresh } = useForecast();

  return (
    <div
      id={id}
      popover="auto"
      className="wireframe-weather"
      role="dialog"
      aria-label={`${location.city} local time and weather`}
      onToggle={(event) => {
        if (event.newState === "open") refresh();
      }}
    >
      <h2>
        {`${location.name} · `}
        <LocalTime seconds />
      </h2>

      {current && forecast ? (
        <dl className="wireframe-facts">
          {[
            [
              "Now",
              `${degrees(current.temperature_2m)}F (${celsius(current.temperature_2m)}°C) · ${label}`
            ],
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
      ) : (
        <p role="status">
          {status === "error" ? "Weather unavailable" : "Loading the weather…"}
        </p>
      )}

      {(status === "error" || stale) && (
        <p>
          <button type="button" onClick={refresh}>
            Retry
          </button>
        </p>
      )}

      <p className="wireframe-meta">
        Weather from <a href="https://open-meteo.com/">Open-Meteo</a> ·{" "}
        {coordinates(location)}
      </p>
    </div>
  );
}
