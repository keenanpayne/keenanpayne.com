/**
 * Remembered settings
 * ==================================================
 * The lab's own settings (color scheme, the style guide's last direction),
 * kept per viewer in localStorage when it's available, and in memory until
 * the next page load when it isn't (private mode can refuse it). Listeners
 * re-render on a change.
 */

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const memory = new Map<string, string | null>();

function readStored(key: string) {
  if (memory.has(key)) return memory.get(key) ?? null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: string) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    // Not persisted; it still applies until the next page load
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** A remembered value; `null` when unset, and on the server */
export const useStored = (key: string) =>
  useSyncExternalStore(
    subscribe,
    () => readStored(key),
    () => null
  );
