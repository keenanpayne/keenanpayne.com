import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { profile } from "../../data/profile";

/**
 * Ticking clock where Keenan is, e.g. `3:04 PM`, or `15:04:05` on a 24-hour
 * clock with seconds. Blank until hydrated so the server markup matches.
 */
export function useLocalTime({
  hour12 = true,
  seconds = false
}: { hour12?: boolean; seconds?: boolean } = {}) {
  const [time, setTime] = useState<string>();

  useEffect(() => {
    const format = new Intl.DateTimeFormat(hour12 ? "en-US" : "en-GB", {
      hour: hour12 ? "numeric" : "2-digit",
      minute: "2-digit",
      second: seconds ? "2-digit" : undefined,
      timeZone: profile.location.timeZone
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const timer = setInterval(tick, seconds ? 1000 : 15_000);
    return () => clearInterval(timer);
  }, [hour12, seconds]);

  return time;
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

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Whether the visitor asked for reduced motion, right now (browser only) */
export const prefersReducedMotion = () => matchMedia(REDUCED_MOTION).matches;

const subscribeToMotion = (onChange: () => void) => {
  const query = matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * Whether the visitor asked for reduced motion, kept up to date if they
 * change the setting while the page is open. `false` while rendering on the
 * server and hydrating, then corrected.
 */
export const useReducedMotion = () =>
  useSyncExternalStore(subscribeToMotion, prefersReducedMotion, () => false);

const subscribeToNothing = () => () => {};

/**
 * A query parameter as editable state, starting from the URL. Prerendered
 * markup has no query string, so the server (and hydration) reads it as "".
 */
export function useQueryParam(name: string) {
  const fromUrl = useSyncExternalStore(
    subscribeToNothing,
    () => new URLSearchParams(window.location.search).get(name) ?? "",
    () => ""
  );
  const [value, setValue] = useState<string>();

  return [value ?? fromUrl, setValue] as const;
}

/**
 * A phone menu that the navigation folds into while `wide`, a media query,
 * doesn't match. Escape closes it and hands focus back to its `toggle`;
 * widening past `wide` or moving to another `path` closes it too.
 */
export function useMenu(wide: string, path: string) {
  const toggle = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [openedOn, setOpenedOn] = useState(path);

  if (openedOn !== path) {
    setOpenedOn(path);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const query = matchMedia(wide);
    const close = () => setOpen(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      close();
      toggle.current?.focus();
    };
    query.addEventListener("change", close);
    document.addEventListener("keydown", onKey);
    return () => {
      query.removeEventListener("change", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, wide]);

  return { open, setOpen, toggle };
}
