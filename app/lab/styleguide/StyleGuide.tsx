/**
 * Style guide
 * ==================================================
 * Every direction's foundations, components, and chrome on one page, two
 * ways: one direction with all of its sections (`/lab/styleguide/<slug>/`),
 * or one section across every direction (`/lab/styleguide/compare/<id>/`).
 * Switching directions keeps the section in view, and switching modes
 * keeps the section too, so either axis is a click away.
 */

import {
  Component,
  use,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type ReactNode
} from "react";
import { Link, useNavigate } from "react-router";

import type { LabContent } from "../../lib/types";
import { loadDirection } from "../directions";
import { rebaseLinks } from "../links";
import {
  directions,
  getDirection,
  labPath,
  type DirectionInfo,
  type DirectionSlug
} from "../registry";
import { BaseContext, type Direction } from "../site";

import {
  comparePath,
  getSection,
  GROUPS,
  sectionPath,
  STYLE_SECTIONS,
  styleguidePath,
  type StyleGuideMode,
  type StyleSectionId
} from "./sections";
import {
  Colors,
  Overview,
  ShellSpecimen,
  Typefaces,
  type ShellSample
} from "./shared";
import type { DirectionTokens } from "./tokens.server";

export interface StyleGuideData {
  content: LabContent;
  /** HTML */
  prose: string;
  tokens: Record<string, DirectionTokens>;
  shell: ShellSample;
}

type Data = Omit<StyleGuideData, "tokens">;

const LAST_DIRECTION_KEY = "lab-styleguide-direction";
const HIDDEN_KEY = "lab-styleguide-hidden";

// Remembered per viewer when storage is available, and in memory until the
// next page load when it isn't; listeners re-render on a change
const storeListeners = new Set<() => void>();
const memory = new Map<string, string | null>();

function readStored(key: string) {
  if (memory.has(key)) return memory.get(key) ?? null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    // Not persisted; it still applies until the next page load
  }
  storeListeners.forEach((listener) => listener());
}

function subscribeStored(listener: () => void) {
  storeListeners.add(listener);
  return () => storeListeners.delete(listener);
}

const useStored = (key: string) =>
  useSyncExternalStore(
    subscribeStored,
    () => readStored(key),
    () => null
  );

function parseHidden(saved: string | null): string[] {
  try {
    const slugs: unknown = JSON.parse(saved ?? "[]");
    return Array.isArray(slugs)
      ? slugs.filter((slug) => typeof slug === "string" && getDirection(slug))
      : [];
  } catch {
    return [];
  }
}

const cx = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(" ");

/** Every direction's chunk, started together so none waits on another */
const loadAll = () =>
  directions.map((direction) => loadDirection(direction.slug));

/* Stage
   ========================================================================== */

/** Plain clicks on a specimen's links stay put; modified clicks still open */
function holdLinks(event: MouseEvent) {
  const link = (event.target as Element).closest("a[href]");
  if (
    !link ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return;
  }
  event.preventDefault();
}

class Boundary extends Component<
  { name: string; children: ReactNode },
  { error?: Error }
> {
  state: { error?: Error } = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="sg-error" role="alert">
        <strong>{`${this.props.name} couldn’t render this section.`}</strong>
        <code>{this.state.error.message}</code>
      </div>
    );
  }
}

/**
 * Where a direction's specimens render: inside its root class (or, for
 * `frame`, its whole Shell), with its links pointed at its mockups
 */
function Stage({
  info,
  skin,
  tokens,
  frame,
  children
}: {
  info: DirectionInfo;
  skin: Direction;
  tokens: DirectionTokens;
  frame?: boolean;
  children: ReactNode;
}) {
  return (
    <BaseContext.Provider value={labPath(info.slug).slice(0, -1)}>
      <div
        className={cx("sg-stage", frame && "sg-stage--frame")}
        style={tokens.paper && { background: `var(${tokens.paper.name})` }}
        onClickCapture={holdLinks}
        onSubmitCapture={(event) => event.preventDefault()}
      >
        <Boundary name={info.name}>
          {frame ? (
            children
          ) : (
            <div className={`${skin.specimens.root} sg-stage__root`}>
              {children}
            </div>
          )}
        </Boundary>
      </div>
    </BaseContext.Provider>
  );
}

/** The content and samples with every internal link rebased for a direction */
const rebased = (slug: string, data: Data) =>
  rebaseLinks(data, labPath(slug).slice(0, -1));

/** One section of one direction (`data` rebased for it) */
function SectionBody({
  id,
  info,
  index,
  skin,
  tokens,
  data,
  compact
}: {
  id: StyleSectionId;
  info: DirectionInfo;
  index: number;
  skin: Direction;
  tokens: DirectionTokens;
  data: Data;
  compact?: boolean;
}) {
  const { content, prose, shell } = data;
  // A fresh error boundary for each direction and section
  const key = `${info.slug}:${id}`;

  switch (id) {
    case "overview":
      return (
        <Overview info={info} index={index} tokens={tokens} compact={compact} />
      );
    case "color":
      return (
        <Stage key={key} info={info} skin={skin} tokens={tokens}>
          <Colors tokens={tokens} />
        </Stage>
      );
    case "typefaces":
      return (
        <Stage key={key} info={info} skin={skin} tokens={tokens}>
          <Typefaces tokens={tokens} stylesheets={skin.stylesheets} />
        </Stage>
      );
    case "shell":
      return (
        <Stage key={key} info={info} skin={skin} tokens={tokens} frame>
          <ShellSpecimen skin={skin} shell={shell} content={content} />
        </Stage>
      );
    default: {
      const Specimen = skin.specimens.sections[id];
      return (
        <Stage key={key} info={info} skin={skin} tokens={tokens}>
          <Specimen content={content} prose={prose} />
        </Stage>
      );
    }
  }
}

const Stylesheets = ({ skins }: { skins: Direction[] }) =>
  skins
    .flatMap((skin) => skin.stylesheets)
    .map((href) => (
      <link key={href} rel="stylesheet" href={href} precedence="default" />
    ));

/* Chrome
   ========================================================================== */

function useKeys(previous: () => void, next: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target instanceof Element ? event.target : null;
      if (
        target?.closest("input, textarea, select, [contenteditable], .sg-stage")
      ) {
        return;
      }
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [previous, next]);
}

/** The section in view while scrolling through a direction */
function useSectionInView(enabled: boolean) {
  // Read once mounted, as the server can't know the scroll position or hash
  const [current, setCurrent] = useState<StyleSectionId>("overview");

  useEffect(() => {
    if (!enabled) return;
    const update = () => {
      const sections = STYLE_SECTIONS.flatMap(
        ({ id }) => document.getElementById(id) ?? []
      );
      // The last section whose top has passed a line a third down the
      // screen, or the last of all once the page can't scroll further
      const line = innerHeight / 3;
      const atEnd =
        innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
      const passed = sections.filter(
        (section) => section.getBoundingClientRect().top <= line
      );
      const section = atEnd ? sections.at(-1) : (passed.at(-1) ?? sections[0]);
      if (section) setCurrent(section.id as StyleSectionId);
    };
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, [enabled]);

  return current;
}

interface SectionLinks {
  current: StyleSectionId;
  hrefFor: (id: StyleSectionId) => string;
}

/** The sections down the side, on wide screens */
function SectionNav({ current, hrefFor }: SectionLinks) {
  return (
    <nav className="sg-sidebar" aria-label="Sections">
      {GROUPS.map((group) => (
        <div key={group} className="sg-sidebar__group">
          <p className="sg-sidebar__label">{group}</p>
          <ul>
            {STYLE_SECTIONS.filter((section) => section.group === group).map(
              (section) => (
                <li key={section.id}>
                  <Link
                    to={hrefFor(section.id)}
                    aria-current={section.id === current ? "true" : undefined}
                    preventScrollReset={hrefFor(section.id).startsWith("#")}
                  >
                    {section.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** The sections as a menu in the toolbar, on narrow screens */
function SectionPicker({ current, hrefFor }: SectionLinks) {
  const navigate = useNavigate();

  return (
    <label className="sg-picker">
      <span className="sg-visually-hidden">Section</span>
      <select
        value={current}
        onChange={(event) =>
          navigate(hrefFor(event.target.value as StyleSectionId))
        }
      >
        {GROUPS.map((group) => (
          <optgroup key={group} label={group}>
            {STYLE_SECTIONS.filter((section) => section.group === group).map(
              (section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              )
            )}
          </optgroup>
        ))}
      </select>
    </label>
  );
}

function Toolbar({
  mode,
  section,
  lastSlug,
  hidden,
  setHidden,
  picker
}: {
  mode: StyleGuideMode;
  section: StyleSectionId;
  lastSlug: string;
  hidden: string[];
  setHidden: (hidden: string[]) => void;
  picker: ReactNode;
}) {
  const byDirection = mode.kind === "direction";
  const only = byDirection ? mode.only : undefined;

  return (
    <div className="sg-toolbar">
      <div className="sg-modes" role="group" aria-label="View">
        <Link
          to={styleguidePath(byDirection ? mode.slug : lastSlug, section)}
          aria-current={byDirection ? "page" : undefined}
        >
          By direction
        </Link>
        <Link
          to={comparePath(section)}
          aria-current={byDirection ? undefined : "page"}
        >
          By component
        </Link>
      </div>

      {picker}

      {byDirection ? (
        <nav className="sg-tabs" aria-label="Directions">
          {directions.map((direction) => (
            <Link
              key={direction.slug}
              to={
                only
                  ? sectionPath(direction.slug, only)
                  : styleguidePath(direction.slug, section)
              }
              aria-current={direction.slug === mode.slug ? "page" : undefined}
              preventScrollReset
            >
              {direction.name}
            </Link>
          ))}
        </nav>
      ) : (
        <div className="sg-tabs" role="group" aria-label="Directions shown">
          {directions.map((direction) => {
            const shown = !hidden.includes(direction.slug);
            return (
              <button
                key={direction.slug}
                type="button"
                aria-pressed={shown}
                // Keep at least one direction on screen
                disabled={shown && hidden.length === directions.length - 1}
                onClick={() =>
                  setHidden(
                    shown
                      ? [...hidden, direction.slug]
                      : hidden.filter((slug) => slug !== direction.slug)
                  )
                }
              >
                {direction.name}
              </button>
            );
          })}
        </div>
      )}

      <span className="sg-toolbar__hint" aria-hidden="true">
        <kbd>←</kbd>
        <kbd>→</kbd>
        {byDirection ? " direction" : " section"}
      </span>
    </div>
  );
}

function SectionHeading({
  id,
  as: Tag = "h2",
  aside
}: {
  id: StyleSectionId;
  as?: "h1" | "h2";
  aside?: ReactNode;
}) {
  const section = getSection(id)!;
  return (
    <header className="sg-heading">
      <div>
        <Tag className="sg-heading__title">{section.label}</Tag>
        <p className="sg-heading__blurb">{section.blurb}</p>
      </div>
      {aside && <div className="sg-heading__aside">{aside}</div>}
    </header>
  );
}

/* Views
   ========================================================================== */

/** One direction, every section */
function DirectionView({
  slug,
  only,
  tokens,
  data
}: {
  slug: DirectionSlug;
  only?: StyleSectionId;
  tokens: DirectionTokens;
  data: Data;
}) {
  const info = getDirection(slug)!;
  const index = directions.findIndex((direction) => direction.slug === slug);
  const skin = use(loadDirection(slug));
  const own = useMemo(() => rebased(slug, data), [slug, data]);

  return (
    <>
      <Stylesheets skins={[skin]} />
      {STYLE_SECTIONS.filter(({ id }) => !only || id === only).map(({ id }) => (
        <section key={id} id={id} className="sg-section">
          <SectionHeading
            id={id}
            as={only ? "h1" : "h2"}
            aside={
              <>
                <Link
                  className="sg-button sg-button--quiet"
                  to={only ? styleguidePath(slug, id) : sectionPath(slug, id)}
                >
                  {only ? "All sections" : "On its own"}
                </Link>
                <Link
                  className="sg-button sg-button--quiet"
                  to={comparePath(id)}
                >
                  Compare directions
                </Link>
              </>
            }
          />
          <SectionBody
            id={id}
            info={info}
            index={index}
            skin={skin}
            tokens={tokens}
            data={own}
          />
        </section>
      ))}
    </>
  );
}

/** One section, every direction */
function CompareView({
  section,
  tokens,
  data,
  hidden
}: {
  section: StyleSectionId;
  tokens: Record<string, DirectionTokens>;
  data: Data;
  hidden: string[];
}) {
  const promises = loadAll();
  const skins: Direction[] = [];
  for (const promise of promises) skins.push(use(promise));
  const each = useMemo(
    () =>
      Object.fromEntries(
        directions.map(({ slug }) => [slug, rebased(slug, data)])
      ),
    [data]
  );

  const at = STYLE_SECTIONS.findIndex(({ id }) => id === section);
  const previous = STYLE_SECTIONS[at - 1];
  const next = STYLE_SECTIONS[at + 1];
  const shown = directions
    .map((info, index) => ({ info, index, skin: skins[index] }))
    .filter(({ info }) => !hidden.includes(info.slug));

  return (
    <>
      <Stylesheets skins={shown.map(({ skin }) => skin)} />
      <SectionHeading
        id={section}
        as="h1"
        aside={
          <>
            {previous && (
              <Link
                className="sg-button sg-button--quiet"
                to={comparePath(previous.id)}
              >
                {`← ${previous.label}`}
              </Link>
            )}
            {next && (
              <Link
                className="sg-button sg-button--quiet"
                to={comparePath(next.id)}
              >
                {`${next.label} →`}
              </Link>
            )}
          </>
        }
      />
      <div className={section === "overview" ? "sg-cards" : "sg-rows"}>
        {shown.map(({ info, index, skin }) =>
          section === "overview" ? (
            <SectionBody
              key={info.slug}
              id={section}
              info={info}
              index={index}
              skin={skin}
              tokens={tokens[info.slug]}
              data={each[info.slug]}
              compact
            />
          ) : (
            <article key={info.slug} className="sg-row">
              <header className="sg-row__head">
                <h2 className="sg-row__name">
                  <span className="sg-overview__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {info.name}
                </h2>
                <Link to={styleguidePath(info.slug, section)}>
                  {`All of ${info.name}`}
                </Link>
                <Link to={labPath(info.slug)}>Open mockup ↗</Link>
              </header>
              <SectionBody
                id={section}
                info={info}
                index={index}
                skin={skin}
                tokens={tokens[info.slug]}
                data={each[info.slug]}
              />
            </article>
          )
        )}
      </div>
    </>
  );
}

/* Page
   ========================================================================== */

export function StyleGuide({
  mode,
  data: loaderData
}: {
  mode: StyleGuideMode;
  data: StyleGuideData;
}) {
  const { tokens } = loaderData;
  const data = useMemo(
    () => ({
      content: loaderData.content,
      prose: loaderData.prose,
      shell: loaderData.shell
    }),
    [loaderData]
  );
  const navigate = useNavigate();
  const byDirection = mode.kind === "direction";
  const only = byDirection ? mode.only : undefined;
  const inView = useSectionInView(byDirection && !only);
  const section = only ?? (byDirection ? inView : mode.section);

  // The last direction viewed, and directions hidden from comparisons
  const storedSlug = useStored(LAST_DIRECTION_KEY);
  const lastSlug =
    storedSlug && getDirection(storedSlug) ? storedSlug : directions[0].slug;
  const storedHidden = useStored(HIDDEN_KEY);
  const hidden = useMemo(() => parseHidden(storedHidden), [storedHidden]);
  const setHidden = (next: string[]) =>
    writeStored(HIDDEN_KEY, JSON.stringify(next));

  useEffect(() => {
    if (mode.kind === "direction") writeStored(LAST_DIRECTION_KEY, mode.slug);
  }, [mode]);

  // Moving to another direction keeps the section in view
  const slug = byDirection ? mode.slug : undefined;
  useLayoutEffect(() => {
    const id = location.hash.slice(1);
    if (slug && getSection(id)) {
      document.getElementById(id)?.scrollIntoView({ block: "start" });
    }
  }, [slug]);

  // Start loading every direction, so switching to one is quick
  useEffect(() => {
    loadAll();
  }, []);

  const step = (by: number) => () => {
    if (mode.kind === "direction") {
      const at = directions.findIndex(
        (direction) => direction.slug === mode.slug
      );
      const next =
        directions[(at + by + directions.length) % directions.length];
      navigate(
        only
          ? sectionPath(next.slug, only)
          : styleguidePath(next.slug, section),
        { preventScrollReset: !only }
      );
    } else {
      const at = STYLE_SECTIONS.findIndex(({ id }) => id === mode.section);
      const next = STYLE_SECTIONS[at + by];
      if (next) navigate(comparePath(next.id));
    }
  };
  useKeys(step(-1), step(1));

  const hrefFor = (id: StyleSectionId) =>
    mode.kind === "compare"
      ? comparePath(id)
      : only
        ? sectionPath(mode.slug, id)
        : `#${id}`;

  return (
    <div className="sg">
      <header className="sg-masthead">
        <p className="lab__eyebrow">
          <Link to="/lab/">keenanpayne.com / lab</Link> / style guide
        </p>
        {byDirection && !only ? (
          <h1 className="sg-masthead__title">
            {getDirection(mode.slug)!.name}
          </h1>
        ) : byDirection ? (
          <p className="sg-masthead__title">{getDirection(mode.slug)!.name}</p>
        ) : (
          <p className="sg-masthead__title">Style guide</p>
        )}
      </header>

      <Toolbar
        mode={mode}
        section={section}
        lastSlug={lastSlug}
        hidden={hidden}
        setHidden={setHidden}
        picker={<SectionPicker current={section} hrefFor={hrefFor} />}
      />

      <div className="sg-body">
        <SectionNav current={section} hrefFor={hrefFor} />
        <main className="sg-main">
          {mode.kind === "direction" ? (
            <DirectionView
              slug={mode.slug as DirectionSlug}
              only={only}
              tokens={tokens[mode.slug]}
              data={data}
            />
          ) : (
            <CompareView
              section={mode.section}
              tokens={tokens}
              data={data}
              hidden={hidden}
            />
          )}
        </main>
      </div>
    </div>
  );
}
