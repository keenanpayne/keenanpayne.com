/**
 * Time where Keenan is
 * ==================================================
 * Clocks and formats in Denver's time zone, read the same way for every
 * direction that shows one.
 */

import { useEffect, useState } from "react";

import { profile } from "../../data/profile";

const { timeZone } = profile.location;

const formats = new Map<string, Intl.DateTimeFormat>();

/**
 * A formatter in Denver's time zone, e.g.
 * `localFormat({ hour: "numeric", minute: "2-digit" }).format(now)`. Made
 * once for each set of options, as they're costly to build.
 */
export function localFormat(
  options: Intl.DateTimeFormatOptions,
  locale = "en-US"
) {
  const key = `${locale} ${JSON.stringify(options)}`;
  let format = formats.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, { ...options, timeZone });
    formats.set(key, format);
  }
  return format;
}

/** Denver's time zone right now, e.g. `MDT`, or `UTC−6` as an offset */
export function zoneName(now: Date, style: "short" | "offset") {
  const name =
    localFormat({ timeZoneName: style === "short" ? "short" : "shortOffset" })
      .formatToParts(now)
      .find((part) => part.type === "timeZoneName")?.value ?? "";
  return style === "short"
    ? name
    : name.replace("GMT", "UTC").replace("-", "−");
}

export interface LocalTimeOptions {
  /** `3:04 PM` rather than `15:04` */
  hour12?: boolean;
  seconds?: boolean;
}

/**
 * Ticking clock where Keenan is, e.g. `3:04 PM`, or `15:04:05` on a 24-hour
 * clock with seconds. Blank until hydrated so the server markup matches.
 */
export function useLocalTime({
  hour12 = true,
  seconds = false
}: LocalTimeOptions = {}) {
  const [time, setTime] = useState<string>();

  useEffect(() => {
    const format = localFormat(
      {
        hour: hour12 ? "numeric" : "2-digit",
        minute: "2-digit",
        second: seconds ? "2-digit" : undefined
      },
      hour12 ? "en-US" : "en-GB"
    );
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = setInterval(tick, seconds ? 1000 : 15_000);
    return () => clearInterval(timer);
  }, [hour12, seconds]);

  return time;
}

/**
 * `useLocalTime` as a leaf of its own, so each tick re-renders only the
 * clock's text and not the part showing it. Shows the `placeholder` (blank
 * digits, by default) until hydrated.
 */
export function LocalTime({
  placeholder,
  ...options
}: LocalTimeOptions & { placeholder?: string }) {
  return (
    useLocalTime(options) ??
    placeholder ??
    (options.seconds ? "--:--:--" : "--:--")
  );
}

const CLOCK: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit"
};

/**
 * A moment as a readout's clock: its digits (`3:04:05`) and its period
 * (`PM`), set apart so a direction can style them; blank before hydration
 */
export function clockParts(now: Date | undefined) {
  const parts = now ? localFormat(CLOCK).formatToParts(now) : [];
  return {
    time: parts
      .filter((part) => part.type !== "dayPeriod")
      .map((part) => part.value)
      .join("")
      .trim(),
    period: parts.find((part) => part.type === "dayPeriod")?.value
  };
}

/**
 * The current moment, ticking once a second while `active`. `undefined`
 * until hydrated, so the server markup matches.
 */
export function useNow(active = true) {
  const [now, setNow] = useState<Date>();

  useEffect(() => {
    if (!active) return;
    const tick = () => setNow(new Date());
    const first = setTimeout(tick);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [active]);

  return now;
}
