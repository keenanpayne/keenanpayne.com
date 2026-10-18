import { useEffect, useRef, useState, useSyncExternalStore } from "react";

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
 * widening past `wide` closes it too. (Every page mounts afresh, so moving
 * to another page closes it as well.)
 */
export function useMenu(wide: string) {
  const toggle = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const query = matchMedia(wide);
    const close = () => setOpen(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      // A popover opened from the menu takes the Escape first (the selector
      // throws where popovers aren't supported, and none is open there)
      try {
        if (document.querySelector(":popover-open")) return;
      } catch {
        // No popover support
      }
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

/**
 * Which of the sections with these ids is being read: the last whose top has
 * passed a line a third of the way down the screen, or the last of all once
 * the page can't scroll further. Measured at most once a frame. The first
 * until mounted, as the server can't know the scroll position.
 */
export function useActiveSection<Id extends string>(ids: readonly Id[]) {
  const [active, setActive] = useState<Id | undefined>(ids[0]);
  const key = ids.join(" ");

  useEffect(() => {
    const sections = key
      .split(" ")
      .flatMap((id) => document.getElementById(id) ?? []);
    if (sections.length === 0) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const line = innerHeight / 3;
      const atEnd =
        innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
      const passed = sections.filter(
        (section) => section.getBoundingClientRect().top <= line
      );
      const section = atEnd ? sections.at(-1) : (passed.at(-1) ?? sections[0]);
      setActive(section?.id as Id | undefined);
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };

    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [key]);

  return active;
}
