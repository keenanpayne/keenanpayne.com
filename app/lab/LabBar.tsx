import { useEffect } from "react";
import { Link, useNavigate } from "react-router";

import { directions, labPath, SAMPLE_PAGES } from "./registry";
import { useStored, writeStored } from "./stored";
import { STYLEGUIDE_PATH, styleguidePath } from "./styleguide/sections";

type Theme = "auto" | "light" | "dark";
const THEMES: Theme[] = ["auto", "light", "dark"];
// The chosen color scheme is remembered, so it carries across directions
const STORAGE_KEY = "lab-theme";

/** Floating switcher shared by every lab page */
export function LabBar({
  current,
  path,
  guide
}: {
  current?: string;
  path?: string;
  /** On the style guide */
  guide?: boolean;
}) {
  const navigate = useNavigate();
  const isListed = SAMPLE_PAGES.some((page) => page.path === path);
  const saved = useStored(STORAGE_KEY);
  const theme = THEMES.find((candidate) => candidate === saved) ?? "auto";

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "auto") delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);

  const cycleTheme = () =>
    writeStored(
      STORAGE_KEY,
      THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length]
    );

  return (
    <nav className="labBar" aria-label="Design lab">
      <Link className="labBar__home" to="/lab/">
        Lab
      </Link>
      <Link
        to={current ? styleguidePath(current) : STYLEGUIDE_PATH}
        aria-current={guide ? "page" : undefined}
      >
        Guide
      </Link>
      <select
        className="labBar__select"
        aria-label="Direction"
        value={current ?? ""}
        // Every direction skins the same pages, so stay on this one
        onChange={(event) =>
          navigate(
            event.target.value ? labPath(event.target.value, path) : "/lab/"
          )
        }
      >
        {!current && <option value="">Choose a direction…</option>}
        {directions.map((direction) => (
          <option key={direction.slug} value={direction.slug}>
            {direction.name}
          </option>
        ))}
      </select>
      {current && (
        <select
          className="labBar__select"
          aria-label="Page"
          value={isListed ? path : ""}
          onChange={(event) => navigate(labPath(current, event.target.value))}
        >
          {!isListed && <option value="">{path}</option>}
          {SAMPLE_PAGES.map((page) => (
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
