import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode
} from "react";

import { useReducedMotion } from "../../site";

import {
  BRUSHES,
  SIZES,
  SYMMETRIES,
  useGridSettings,
  type BrushId,
  type SymmetryId
} from "./blueprint";

/* Icons, drawn on a 16px grid in the toolbar's ink */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round"
} as const;

const Icon = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    {children}
  </svg>
);

/** The cells of a glider, Life's best-known traveler, on a 3×3 grid */
const GLIDER = [
  [1, 0],
  [2, 1],
  [0, 2],
  [1, 2],
  [2, 2]
];

const ICONS = {
  grid: (
    <path
      {...stroke}
      strokeWidth={1.25}
      d="M2.5 2.5h11v11h-11zM6.17 2.5v11M9.83 2.5v11M2.5 6.17h11M2.5 9.83h11"
    />
  ),
  eraser: (
    <path
      {...stroke}
      d="M8.5 13.5h5M2.6 9.4l5.8-5.8a1.4 1.4 0 0 1 2 0l2.5 2.5a1.4 1.4 0 0 1 0 2L8.4 12.6l-.9.9H5.9zM5.2 6.8l4.5 4.5"
    />
  ),
  glider: GLIDER.map(([column, row]) => (
    <rect
      key={`${column}${row}`}
      x={2 + column * 4.25}
      y={2 + row * 4.25}
      width="3.5"
      height="3.5"
      rx="0.5"
      fill="currentColor"
    />
  )),
  pause: <path fill="currentColor" d="M4 3h3v10H4zM9 3h3v10H9z" />,
  scatter: (
    <>
      <rect {...stroke} x="2.5" y="2.5" width="11" height="11" rx="2.5" />
      <circle fill="currentColor" cx="5.5" cy="5.5" r="1.1" />
      <circle fill="currentColor" cx="8" cy="8" r="1.1" />
      <circle fill="currentColor" cx="10.5" cy="10.5" r="1.1" />
    </>
  ),
  clear: (
    <path
      {...stroke}
      d="M2.5 4.5h11M6.5 4.5V2.75h3V4.5M4 4.5l.75 9h6.5l.75-9M6.75 7v4M9.25 7v4"
    />
  ),
  // Corners pushed out to the edges, and drawn back in
  expand: (
    <path
      {...stroke}
      d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10"
    />
  ),
  shrink: (
    <path
      {...stroke}
      d="M6 2.5V6H2.5M13.5 6H10V2.5M10 13.5V10h3.5M2.5 10H6v3.5"
    />
  ),
  hide: <path {...stroke} d="m4 6 4 4 4-4" />,
  // A cell picked out, as in a design tool (the Selection mark)
  show: (
    <>
      <path
        {...stroke}
        strokeLinecap="butt"
        d="M2 5.5V2h3.5M10.5 2H14v3.5M14 10.5V14h-3.5M5.5 14H2v-3.5"
      />
      <rect fill="currentColor" x="5.5" y="5.5" width="5" height="5" />
    </>
  )
};

/** Symmetry, by mode: the squares a stroke fills about the dashed axes */
const SYMMETRY_ICONS: Record<SymmetryId, ReactNode> = {
  off: (
    <>
      <path {...stroke} strokeDasharray="1.5 2" d="M8 1.5v13" />
      <rect fill="currentColor" x="2.5" y="6" width="4" height="4" />
      <rect
        {...stroke}
        strokeWidth={1}
        opacity="0.45"
        x="10"
        y="6.5"
        width="3"
        height="3"
      />
    </>
  ),
  mirror: (
    <>
      <path {...stroke} strokeDasharray="1.5 2" d="M8 1.5v13" />
      <rect fill="currentColor" x="2.5" y="6" width="4" height="4" />
      <rect fill="currentColor" x="9.5" y="6" width="4" height="4" />
    </>
  ),
  kaleidoscope: (
    <>
      <path
        {...stroke}
        strokeWidth={1}
        strokeDasharray="1.25 1.75"
        d="M8 1v14M1 8h14M3 3l10 10M13 3 3 13"
      />
      <rect fill="currentColor" x="5" y="1.5" width="2.5" height="2.5" />
      <rect fill="currentColor" x="8.5" y="1.5" width="2.5" height="2.5" />
      <rect fill="currentColor" x="5" y="12" width="2.5" height="2.5" />
      <rect fill="currentColor" x="8.5" y="12" width="2.5" height="2.5" />
    </>
  )
};

const SYMMETRY_ORDER = Object.keys(SYMMETRIES) as SymmetryId[];

/** A brush's color, as a dot */
const Swatch = ({ brush }: { brush: BrushId }) => (
  <span className="gl-tools__swatch" data-brush={brush} aria-hidden="true" />
);

/** A toolbar button; `tip` labels it, and shows on hover and focus */
function Tool({
  tip,
  children,
  ...props
}: {
  tip: string;
  children: ReactNode;
} & Omit<ComponentProps<"button">, "type" | "aria-label">) {
  return (
    <button
      type="button"
      className="gl-tools__tool"
      aria-label={tip}
      data-tip={tip}
      {...props}
    >
      {children}
    </button>
  );
}

type Tray = "brush" | "size";

/**
 * The Blueprint panel's easter egg: a toolbar that comes out the first time
 * a square is filled. The brush's color and the tile size open a tray of
 * choices above it; the eraser, symmetry, and the Game of Life are toggles;
 * scatter and clear act at once. It can grow the grid to fill the screen
 * (Escape shrinks it again), and folds away to a single button.
 */
export function GridTools({
  playing,
  onLife,
  onScatter,
  onClear,
  empty,
  found,
  expanded,
  onExpand
}: {
  /** Whether the Game of Life is running */
  playing: boolean;
  onLife: () => void;
  onScatter: () => void;
  onClear: () => void;
  /** Whether there's nothing to clear */
  empty: boolean;
  /** Just found: says so for a moment */
  found: boolean;
  /** Whether the grid fills the screen */
  expanded: boolean;
  onExpand: (expanded: boolean) => void;
}) {
  const [settings, update] = useGridSettings();
  const reducedMotion = useReducedMotion();
  const [tray, setTray] = useState<Tray | null>(null);
  const [folded, setFolded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const brushTrigger = useRef<HTMLButtonElement>(null);
  const sizeTrigger = useRef<HTMLButtonElement>(null);
  const triggerOf = (which: Tray) =>
    which === "brush" ? brushTrigger : sizeTrigger;
  // Folding or unfolding by a button moves focus to its counterpart
  const refocus = useRef(false);
  const id = useId();

  // An open tray takes focus to its choice; Escape or a press elsewhere
  // closes it
  useEffect(() => {
    if (!tray) return;
    const node = root.current;
    const trigger = tray === "brush" ? brushTrigger : sizeTrigger;
    node
      ?.querySelector<HTMLButtonElement>(
        ".gl-tools__tray [aria-pressed='true']"
      )
      ?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      setTray(null);
      trigger.current?.focus();
    };
    const onPress = (event: PointerEvent) => {
      if (!node?.contains(event.target as Node)) setTray(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPress);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPress);
    };
  }, [tray]);

  // Escape shrinks a grid that fills the screen, once any tray is closed,
  // unless it's meant for something else: the header's menu or a popover
  useEffect(() => {
    if (!expanded || tray) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target as Node;
      const panel = root.current?.closest(".gl-blueprint");
      if (target !== document.body && !panel?.contains(target)) return;
      // The selector throws where popovers aren't supported, and none is
      // open there
      try {
        if (document.querySelector(":popover-open")) return;
      } catch {
        // No popover support
      }
      event.preventDefault();
      onExpand(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded, tray, onExpand]);

  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    root.current
      ?.querySelector<HTMLButtonElement>(
        folded ? ".gl-tools__unfold" : ".gl-tools__tool"
      )
      ?.focus();
  }, [folded]);

  const toggleTray = (which: Tray) =>
    setTray((open) => (open === which ? null : which));

  /** Picks a choice from the open tray, then closes it */
  const choose = (which: Tray, change: Parameters<typeof update>[0]) => {
    update(change);
    setTray(null);
    triggerOf(which).current?.focus();
  };

  const fold = (next: boolean) => {
    refocus.current = true;
    setTray(null);
    setFolded(next);
  };

  if (folded) {
    return (
      <div ref={root} className="gl-blueprint__tools">
        <button
          type="button"
          className="gl-tools__unfold"
          aria-label="Show grid tools"
          aria-expanded="false"
          onClick={() => fold(false)}
        >
          <Icon>{ICONS.show}</Icon>
        </button>
      </div>
    );
  }

  const symmetry =
    SYMMETRY_ORDER[
      (SYMMETRY_ORDER.indexOf(settings.symmetry) + 1) % SYMMETRY_ORDER.length
    ];
  const life = playing
    ? "Pause the Game of Life"
    : reducedMotion
      ? "Step the Game of Life"
      : "Play the Game of Life";

  return (
    <div
      ref={root}
      className="gl-blueprint__tools"
      data-tray={tray ?? undefined}
      data-found={found || undefined}
    >
      {found && (
        <span className="gl-tools__found" role="status">
          You found the grid tools
        </span>
      )}

      {tray === "brush" && (
        <div
          id={`${id}-tray`}
          className="gl-tools__tray"
          role="group"
          aria-label="Color"
        >
          {(Object.keys(BRUSHES) as BrushId[]).map((brush) => (
            <Tool
              key={brush}
              tip={BRUSHES[brush]}
              aria-pressed={brush === settings.brush}
              onClick={() => choose("brush", { brush, erase: false })}
            >
              <Swatch brush={brush} />
            </Tool>
          ))}
        </div>
      )}
      {tray === "size" && (
        <div
          id={`${id}-tray`}
          className="gl-tools__tray"
          role="group"
          aria-label="Tile size"
        >
          {SIZES.map((size) => (
            <Tool
              key={size}
              tip={`${size} pixels`}
              aria-pressed={size === settings.size}
              onClick={() => choose("size", { size })}
            >
              {size}
            </Tool>
          ))}
        </div>
      )}

      <div className="gl-tools__bar" role="group" aria-label="Grid tools">
        <Tool
          ref={brushTrigger}
          tip={`Color: ${BRUSHES[settings.brush]}`}
          aria-expanded={tray === "brush"}
          aria-controls={tray === "brush" ? `${id}-tray` : undefined}
          onClick={() => toggleTray("brush")}
        >
          <Swatch brush={settings.brush} />
        </Tool>
        <Tool
          ref={sizeTrigger}
          tip={`Tile size: ${settings.size} pixels`}
          aria-expanded={tray === "size"}
          aria-controls={tray === "size" ? `${id}-tray` : undefined}
          onClick={() => toggleTray("size")}
        >
          <Icon>{ICONS.grid}</Icon>
          <span className="gl-tools__size">{settings.size}</span>
        </Tool>

        <span className="gl-tools__rule" aria-hidden="true" />

        <Tool
          tip="Eraser"
          aria-pressed={settings.erase}
          onClick={() => update({ erase: !settings.erase })}
        >
          <Icon>{ICONS.eraser}</Icon>
        </Tool>
        <Tool
          tip={`Symmetry: ${SYMMETRIES[settings.symmetry]}`}
          data-on={settings.symmetry !== "off" || undefined}
          onClick={() => update({ symmetry })}
        >
          <Icon>{SYMMETRY_ICONS[settings.symmetry]}</Icon>
        </Tool>

        <span className="gl-tools__rule" aria-hidden="true" />

        <Tool tip={life} aria-pressed={playing} onClick={onLife}>
          <Icon>{playing ? ICONS.pause : ICONS.glider}</Icon>
        </Tool>
        <Tool tip="Scatter squares" onClick={onScatter}>
          <Icon>{ICONS.scatter}</Icon>
        </Tool>
        <Tool tip="Clear the grid" disabled={empty} onClick={onClear}>
          <Icon>{ICONS.clear}</Icon>
        </Tool>

        <span className="gl-tools__rule" aria-hidden="true" />

        <Tool
          tip={expanded ? "Shrink the grid" : "Fill the screen"}
          aria-pressed={expanded}
          data-expand=""
          onClick={() => onExpand(!expanded)}
        >
          <Icon>{expanded ? ICONS.shrink : ICONS.expand}</Icon>
        </Tool>
        <Tool tip="Hide grid tools" onClick={() => fold(true)}>
          <Icon>{ICONS.hide}</Icon>
        </Tool>
      </div>
    </div>
  );
}
