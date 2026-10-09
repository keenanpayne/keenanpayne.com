/**
 * Weather where Keenan is
 * ==================================================
 * Live conditions in Denver from Open-Meteo (https://open-meteo.com/, free,
 * no key), read the same way for every direction that shows them. A
 * direction decides how the weather looks; this decides what it is.
 */

import { useEffect, useRef, useState } from "react";

import { profile } from "../../data/profile";

const { latitude, longitude, timeZone } = profile.location;

const FORECAST_URL = `https://api.open-meteo.com/v1/forecast?${new URLSearchParams(
  {
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day",
    daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    timezone: timeZone,
    forecast_days: "1"
  }
)}`;

// A reading is reused (across pages, too) for this long
const STALE_MS = 10 * 60_000;
// A reading that takes longer than this is given up on
const TIMEOUT_MS = 8000;

export type Condition = "clear" | "cloudy" | "fog" | "rain" | "snow" | "storm";

/** Open-Meteo reports WMO weather codes */
export const WEATHER_CODES: Record<
  number,
  [label: string, condition: Condition]
> = {
  0: ["Clear sky", "clear"],
  1: ["Mainly clear", "clear"],
  2: ["Partly cloudy", "cloudy"],
  3: ["Overcast", "cloudy"],
  45: ["Fog", "fog"],
  48: ["Freezing fog", "fog"],
  51: ["Light drizzle", "rain"],
  53: ["Drizzle", "rain"],
  55: ["Heavy drizzle", "rain"],
  56: ["Freezing drizzle", "rain"],
  57: ["Freezing drizzle", "rain"],
  61: ["Light rain", "rain"],
  63: ["Rain", "rain"],
  65: ["Heavy rain", "rain"],
  66: ["Freezing rain", "rain"],
  67: ["Freezing rain", "rain"],
  71: ["Light snow", "snow"],
  73: ["Snow", "snow"],
  75: ["Heavy snow", "snow"],
  77: ["Snow grains", "snow"],
  80: ["Light showers", "rain"],
  81: ["Showers", "rain"],
  82: ["Violent showers", "rain"],
  85: ["Snow showers", "snow"],
  86: ["Heavy snow showers", "snow"],
  95: ["Thunderstorm", "storm"],
  96: ["Thunderstorm with hail", "storm"],
  99: ["Thunderstorm with heavy hail", "storm"]
};

export interface Forecast {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    is_day: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    /** Local time, e.g. `2026-10-09T07:05` */
    sunrise: string[];
    sunset: string[];
  };
}

/** A forecast's label and kind of weather, e.g. `["Overcast", "cloudy"]` */
export const conditionOf = (forecast: Forecast) =>
  WEATHER_CODES[forecast.current.weather_code] ??
  (["Unknown", "cloudy"] as [string, Condition]);

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

/** A wind direction in degrees as a compass point, e.g. `NW` */
export const compass = (degrees: number) =>
  COMPASS[Math.round(degrees / 45) % 8];

export const celsius = (fahrenheit: number) =>
  Math.round(((fahrenheit - 32) * 5) / 9);

const zoneFormats = {
  short: new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "short"
  }),
  shortOffset: new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset"
  })
};

/** Denver's time zone right now, e.g. `MDT`, or `UTC−6` as an offset */
export function zoneName(now: Date, style: "short" | "offset") {
  const name =
    zoneFormats[style === "short" ? "short" : "shortOffset"]
      .formatToParts(now)
      .find((part) => part.type === "timeZoneName")?.value ?? "";
  return style === "short"
    ? name
    : name.replace("GMT", "UTC").replace("-", "−");
}

type Status = "idle" | "loading" | "ready" | "error";

// The last reading, kept between pages (each lab page mounts afresh)
let last: { forecast: Forecast; readAt: Date } | undefined;

/**
 * Loads the forecast on demand (e.g. when a popover opens), reusing a
 * reading for ten minutes. A failed refresh keeps the last reading, so a
 * direction can show it as outdated.
 */
export function useForecast() {
  const [reading, setReading] = useState(last);
  const [status, setStatus] = useState<Status>(last ? "ready" : "idle");
  const request = useRef<AbortController>(null);

  // Cancels a reading on unmount and forgets it, so a remount (e.g. React's
  // development double mount) can start another
  useEffect(
    () => () => {
      request.current?.abort();
      request.current = null;
    },
    []
  );

  const refresh = () => {
    if (request.current) return;
    if (last && Date.now() - last.readAt.getTime() < STALE_MS) {
      setReading(last);
      setStatus("ready");
      return;
    }

    const controller = new AbortController();
    request.current = controller;
    setStatus("loading");

    // Gives up on a slow reading. Unlike an abort on unmount, that's an
    // error. (Not `AbortSignal.any`, which iOS 16 Safari lacks.)
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    fetch(FORECAST_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<Forecast>;
      })
      .then((forecast) => {
        last = { forecast, readAt: new Date() };
        setReading(last);
        setStatus("ready");
      })
      .catch(() => {
        if (timedOut || !controller.signal.aborted) setStatus("error");
      })
      .finally(() => {
        clearTimeout(timeout);
        if (request.current === controller) request.current = null;
      });
  };

  return {
    forecast: reading?.forecast,
    readAt: reading?.readAt,
    status,
    refresh
  };
}
