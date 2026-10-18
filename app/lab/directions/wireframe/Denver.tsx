import type { ProfileModel } from "../../../lib/types";
import {
  celsius,
  compass,
  coordinates,
  degrees,
  LocalTime,
  twelveHour,
  type Readout
} from "../../site";

/*
 * Local time and weather
 * ==================================================
 * Every direction's Shell has a clock that opens a popover with the time
 * where the owner is and the weather there, wired the same way everywhere
 * (`useReadout()` in `site/readout.ts`: the Shell calls it once and hands
 * the result to both parts). This is it with nothing but the readings, in
 * the order every direction shows them.
 */

type Location = ProfileModel["location"];

/** The button that opens the weather */
export function DenverClock({
  button,
  location
}: {
  button: Readout["button"];
  location: Location;
}) {
  return (
    <button {...button} className="wireframe-clock">
      {`${location.city} `}
      <LocalTime />
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
  const { popover, credit, forecast, current, label, stale, status, refresh } =
    readout;

  return (
    <div {...popover} className="wireframe-weather">
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
        Weather from <a href={credit.href}>{credit.text}</a> ·{" "}
        {coordinates(location)}
      </p>
    </div>
  );
}
