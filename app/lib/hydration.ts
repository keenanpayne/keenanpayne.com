import { useEffect } from "react";

let hydrated = false;

/** Call once from the root component; flips after the initial hydration. */
export function useMarkHydrated() {
  useEffect(() => {
    hydrated = true;
  }, []);
}

/**
 * Whether the app finished hydrating. Effects of components that mount during
 * hydration run before the root's, so this is `false` for server-rendered
 * markup and `true` for anything rendered by a client-side navigation.
 */
export const isHydrated = () => hydrated;
