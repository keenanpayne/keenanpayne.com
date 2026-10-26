/*
 * Moving stipple
 * ==================================================
 * The animated art (the home hero's groundwork, the About page's strata,
 * the contact page's Front Range, the field notes' sky) each build a scene
 * for a frame of cells and draw it one frame at a time; this runs them. It
 * sizes the canvas to its frame, steps a dozen frames a second while the
 * frame is on screen and pauses off it, builds the scene again when the
 * frame resizes, reads the inks again when the color scheme changes, and
 * holds one frame when motion is reduced. Nothing moves on its own for
 * more than five seconds (WCAG 2.2.2): a scene comes to rest after its
 * first five, and moves again while the pointer is over it, or for five
 * more after a tap.
 */

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  type RefObject
} from "react";

import { useReducedMotion } from "../../site";

import { DOT, paint, readInks, subscribeToScheme, type Levels } from "./dither";

const FPS = 12;
/** Seconds a scene takes to dissolve in, like the other dot art */
const DEVELOP = 0.9;
/** A hidden tab pauses the loop; the scene picks up where it left off */
const MAX_STEP = 0.25;
/** Milliseconds a scene moves on its own, or after a tap, before it rests */
const RUN = 5000;

/** What a scene gets while it's mounted, for anything beyond its frames */
export interface SceneControls<State> {
  element: HTMLElement;
  target: HTMLCanvasElement;
  /** Whether motion is reduced, so the scene holds one frame */
  still: boolean;
  /** The scene as last built, or null until the frame first comes into view */
  state(): State | null;
  /** Paints a frame now, e.g. once a hover changes what the scene shows */
  repaint(): void;
  /** Builds the scene again when this element resizes too, as for the frame */
  watch(element: Element): void;
}

export interface SceneOptions<State extends { width: number; height: number }> {
  frame: RefObject<HTMLElement | null>;
  canvas: RefObject<HTMLCanvasElement | null>;
  /** The inks, as custom properties, for levels 1 and up */
  inks: string[];
  /** What's drawn; a new source (by identity) starts over */
  source: unknown;
  /**
   * The scene for a frame of `columns` × `rows` cells (and the frame itself,
   * for art that measures around it); built again when the frame resizes
   */
  build(columns: number, rows: number, element: HTMLElement): State;
  /** One frame of the scene, `seconds` in; `still` while motion is reduced */
  draw(state: State, seconds: number, still: boolean): Levels;
  /** Seconds in at which a still scene holds; its first frame by default */
  hold?: number;
  /** Dissolves in like the other dot art */
  develop?: boolean;
  /** Anything else the scene needs, e.g. pointer handlers; returns its cleanup */
  attach?(scene: SceneControls<State>): () => void;
}

/**
 * Runs a scene in a canvas that fills `frame`. Returns a function that
 * paints a frame now, for when what the scene shows changes between frames.
 */
export function useScene<State extends { width: number; height: number }>({
  frame,
  canvas,
  inks: palette,
  source,
  build,
  draw,
  hold = 0,
  develop = false,
  attach
}: SceneOptions<State>) {
  const still = useReducedMotion();
  // The scene's own functions read their latest props without starting over
  const buildNow = useEffectEvent(build);
  const levelsAt = useEffectEvent(draw);
  const attachNow = useEffectEvent(attach ?? (() => () => {}));
  const painter = useRef<() => void>(null);
  // When it comes to rest, unless the pointer is over it; kept when the
  // scene starts over, so a new source doesn't move for five more seconds
  const rest = useRef({ until: 0, woken: false });
  const paletteKey = palette.join(" ");

  useEffect(() => {
    const element = frame.current;
    const target = canvas.current;
    if (!element || !target) return;

    let state: State | null = null;
    let inks = readInks(element, paletteKey.split(" "));
    let seconds = still ? hold : 0;
    let request = 0;
    let drawnAt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const wake = rest.current;
    let pointer = false;
    // At rest, it shows the frame it holds when motion is reduced
    let resting = false;
    const quiet = () => still || resting;

    const rebuild = () => {
      const { width, height } = element.getBoundingClientRect();
      const columns = Math.ceil(width / DOT);
      const rows = Math.ceil(height / DOT);
      if (!columns || !rows) return;
      state = buildNow(columns, rows, element);
      target.width = columns;
      target.height = rows;
      target.style.width = `${columns * DOT}px`;
      target.style.height = `${rows * DOT}px`;
    };

    const repaint = () => {
      if (!state) return;
      const progress =
        quiet() || !develop ? 1 : Math.min(1, seconds / DEVELOP) ** 0.7;
      paint(
        target,
        levelsAt(state, seconds, quiet()),
        state.width,
        state.height,
        inks,
        progress
      );
    };
    painter.current = repaint;

    const settle = () => {
      resting = true;
      seconds = hold;
      repaint();
    };
    const loop = (now: number) => {
      if (!pointer && now > wake.until) {
        request = 0;
        settle();
        return;
      }
      request = requestAnimationFrame(loop);
      const elapsed = (now - drawnAt) / 1000;
      if (elapsed < 1 / FPS) return;
      drawnAt = now;
      seconds += Math.min(elapsed, MAX_STEP);
      repaint();
    };
    const start = () => {
      if (still || request) return;
      if (!pointer && performance.now() > wake.until) {
        if (!resting) settle();
        return;
      }
      resting = false;
      drawnAt = performance.now();
      request = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(request);
      request = 0;
    };

    const intersection = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return stop();
        if (!state) rebuild();
        repaint();
        if (!wake.woken) {
          wake.woken = true;
          wake.until = performance.now() + RUN;
        }
        start();
      },
      { rootMargin: "200px 0px" }
    );
    intersection.observe(element);

    const resize = new ResizeObserver(() => {
      if (!state) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        rebuild();
        repaint();
      }, 150);
    });
    resize.observe(element);

    const unsubscribe = subscribeToScheme(() => {
      inks = readInks(element, paletteKey.split(" "));
      repaint();
    });

    // Moving again: while the pointer is over it, or for a while after a tap
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer = true;
      start();
    };
    const leave = () => {
      pointer = false;
    };
    const tap = () => {
      wake.until = performance.now() + RUN;
      start();
    };
    element.addEventListener("pointerenter", enter);
    element.addEventListener("pointerleave", leave);
    element.addEventListener("pointerdown", tap);

    const detach = attachNow({
      element,
      target,
      still,
      state: () => state,
      repaint,
      watch: (other) => resize.observe(other)
    });

    return () => {
      element.removeEventListener("pointerenter", enter);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("pointerdown", tap);
      detach();
      stop();
      intersection.disconnect();
      resize.disconnect();
      unsubscribe();
      clearTimeout(timer);
      painter.current = null;
    };
  }, [frame, canvas, paletteKey, source, hold, develop, still]);

  return useCallback(() => painter.current?.(), []);
}
