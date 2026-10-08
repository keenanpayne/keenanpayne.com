import { useEffect, useSyncExternalStore } from "react";
import { Link, useNavigate } from "react-router";

import { directions, getDirection, labPath } from "./registry";

type Theme = "auto" | "light" | "dark";
const THEMES: Theme[] = ["auto", "light", "dark"];
const STORAGE_KEY = "lab-theme";

// The chosen color scheme lives in localStorage (when available), so it
// carries across directions; listeners re-render the switcher on change.
const listeners = new Set<() => void>();
let memoryTheme: Theme | undefined;

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (THEMES as string[]).includes(saved)) return saved as Theme;
  } catch {
    // Storage can be unavailable (private mode); fall back to "auto"
  }
  return "auto";
}

function writeTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Not persisted; the choice still applies until the next page load
  }
  memoryTheme = theme;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => memoryTheme ?? readTheme();
const getServerSnapshot = (): Theme => "auto";

/** Floating switcher shared by every lab page */
export function LabBar({ current, path }: { current?: string; path?: string }) {
  const navigate = useNavigate();
  const pages = getDirection(current)?.pages ?? [];
  const isListed = pages.some((page) => page.path === path);
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "auto") delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);

  const cycleTheme = () =>
    writeTheme(THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]);

  return (
    <nav className="labBar" aria-label="Design lab">
      <Link className="labBar__home" to="/lab/">
        Lab
      </Link>
      <select
        className="labBar__select"
        aria-label="Direction"
        value={current ?? ""}
        onChange={(event) =>
          navigate(event.target.value ? `/lab/${event.target.value}/` : "/lab/")
        }
      >
        {!current && <option value="">Choose a direction…</option>}
        {directions.map((direction) => (
          <option key={direction.slug} value={direction.slug}>
            {direction.name}
          </option>
        ))}
      </select>
      {current && pages.length > 0 && (
        <select
          className="labBar__select"
          aria-label="Page"
          value={isListed ? path : ""}
          onChange={(event) => navigate(labPath(current, event.target.value))}
        >
          {!isListed && <option value="">{path}</option>}
          {pages.map((page) => (
            <option key={page.path} value={page.path}>
              {page.label}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        className="labBar__theme"
        onClick={cycleTheme}
        aria-label={`Color scheme: ${theme}. Switch scheme.`}
      >
        {theme === "auto" ? "◐ Auto" : theme === "light" ? "○ Light" : "● Dark"}
      </button>
      {/* Full page load so no lab styles linger on the live site */}
      <a className="labBar__exit" href="/">
        Exit
      </a>
    </nav>
  );
}
