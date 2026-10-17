import { getDirection } from "../registry";
import type { Direction, Specimens } from "../site";

/**
 * Loads something once per key and returns the same promise every time
 * after, so it can be passed to `use()`
 */
function once<T>(
  cache: Map<string, Promise<T>>,
  key: string,
  load: () => Promise<T>
) {
  let promise = cache.get(key);
  if (!promise) {
    promise = load();
    // A load that fails (e.g. a stale chunk after a deploy) can be retried
    promise.catch(() => cache.delete(key));
    cache.set(key, promise);
  }
  return promise;
}

const skins = new Map<string, Promise<Direction>>();
const specimens = new Map<string, Promise<Specimens>>();

/** A direction's skin, by its slug in `../registry.ts` */
export const loadDirection = (slug: string) =>
  once(skins, slug, () => {
    const direction = getDirection(slug);
    if (!direction) throw new Error(`No direction is registered as "${slug}"`);
    return direction.load().then((module) => module.default);
  });

/** A direction's style guide specimens, which only the style guide loads */
export const loadSpecimens = (slug: string) =>
  once(specimens, slug, () =>
    loadDirection(slug)
      .then((skin) => skin.specimens())
      .then((module) => module.default)
  );
