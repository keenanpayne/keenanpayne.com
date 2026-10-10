/**
 * Shared sections
 * ==================================================
 * The style guide sections drawn the same way for every direction: from
 * its tokens (read from its stylesheet), its web fonts, and its Shell.
 */

import type { CSSProperties } from "react";
import { Link } from "react-router";

import { labPath, SAMPLE_PAGES, type DirectionInfo } from "../registry";
import type { Direction, NavItem, View } from "../site";
import type { LabContent } from "../../lib/types";

import { styleguidePath } from "./sections";
import type { DirectionTokens, Token } from "./tokens.server";

/* Tokens
   ========================================================================== */

/** A token's value in light and in dark */
function bySchemes(
  { value, alt }: { value: string; alt?: string },
  scheme: DirectionTokens["scheme"]
) {
  const other = alt ?? value;
  return scheme === "light"
    ? { light: value, dark: other }
    : { light: other, dark: value };
}

/** Fills a chip with a color over the page color, so alphas read true */
const over = (color: string, paper = "transparent"): CSSProperties => ({
  background: `linear-gradient(${color}, ${color}), ${paper}`
});

function Chip({ token, tokens }: { token: Token; tokens: DirectionTokens }) {
  const color = bySchemes(token, tokens.scheme);
  const paper = tokens.paper && bySchemes(tokens.paper, tokens.scheme);

  return (
    <span className="sg-chip" aria-hidden="true">
      <span style={over(color.light, paper?.light)} />
      <span style={over(color.dark, paper?.dark)} />
    </span>
  );
}

const colorsOf = (tokens: DirectionTokens) =>
  tokens.tokens.filter((token) => token.kind === "color");

function Values({ token, tokens }: { token: Token; tokens: DirectionTokens }) {
  const { light, dark } = bySchemes(token, tokens.scheme);
  return light === dark ? (
    <span className="sg-value" title={light}>
      {light}
    </span>
  ) : (
    <>
      <span className="sg-value" title={light}>
        <abbr title="Light">L</abbr> {light}
      </span>
      <span className="sg-value" title={dark}>
        <abbr title="Dark">D</abbr> {dark}
      </span>
    </>
  );
}

export function Colors({ tokens }: { tokens: DirectionTokens }) {
  const colors = colorsOf(tokens);
  const others = tokens.tokens.filter((token) => token.kind === "other");

  return (
    <div className="sg-colors">
      <p className="sg-note">
        {`${colors.length} colors, ${tokens.scheme} by default.`}
      </p>
      <ul className="sg-swatches">
        {colors.map((token) => (
          <li key={token.name} className="sg-swatch">
            <Chip token={token} tokens={tokens} />
            <code className="sg-swatch__name">{token.name}</code>
            <Values token={token} tokens={tokens} />
          </li>
        ))}
      </ul>

      {others.length > 0 && (
        <table className="sg-tokens">
          <caption className="sg-caption__label">Other tokens</caption>
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">Light</th>
              <th scope="col">Dark</th>
            </tr>
          </thead>
          <tbody>
            {others.map((token) => {
              const { light, dark } = bySchemes(token, tokens.scheme);
              return (
                <tr key={token.name}>
                  <th scope="row">
                    <code>{token.name}</code>
                  </th>
                  <td>
                    <span className="sg-value" title={light}>
                      {light}
                    </span>
                  </td>
                  <td>
                    <span className="sg-value" title={dark}>
                      {dark === light ? "Same" : dark}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* Typefaces
   ========================================================================== */

interface FaceStyle {
  weight: number;
  italic: boolean;
}

/** The styles each Google Fonts family is loaded in, by family name */
function webFonts(stylesheets: string[]) {
  const families = new Map<string, { styles: FaceStyle[]; range?: string }>();

  for (const href of stylesheets) {
    if (!href.startsWith("https://fonts.googleapis.com/")) continue;
    for (const spec of new URL(href).searchParams.getAll("family")) {
      const [name, axisSpec] = spec.split(":");
      if (!axisSpec) {
        families.set(name, { styles: [{ weight: 400, italic: false }] });
        continue;
      }

      const [axisList, tupleList] = axisSpec.split("@");
      const axes = axisList.split(",");
      const weightAt = axes.indexOf("wght");
      const italicAt = axes.indexOf("ital");
      const styles: FaceStyle[] = [];
      let range: string | undefined;

      for (const tuple of tupleList.split(";").map((t) => t.split(","))) {
        const italic = italicAt >= 0 && tuple[italicAt] === "1";
        const weight = weightAt >= 0 ? tuple[weightAt] : "400";
        // A variable range, e.g. `100..900`: sample across it
        const [low, high] = weight.split("..").map(Number);
        if (high) range = `${low}–${high}`;
        const weights = high
          ? [...new Set([low, 400, 700, high])].filter(
              (w) => w >= low && w <= high
            )
          : [low];
        styles.push(...weights.map((w) => ({ weight: w, italic })));
      }

      families.set(name, {
        styles: styles
          .filter(
            (style, index) =>
              styles.findIndex(
                (other) =>
                  other.weight === style.weight && other.italic === style.italic
              ) === index
          )
          .sort(
            (a, b) => Number(a.italic) - Number(b.italic) || a.weight - b.weight
          ),
        range
      });
    }
  }

  return families;
}

export const familyOf = (stack: string) =>
  stack.split(",")[0].replace(/["']/g, "").trim();

const fontsOf = (tokens: DirectionTokens) =>
  tokens.tokens.filter((token) => token.kind === "font");

const WEIGHT_NAMES: Record<number, string> = {
  100: "Thin",
  200: "Extra light",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semibold",
  700: "Bold",
  800: "Extra bold",
  900: "Black"
};

export function Typefaces({
  tokens,
  stylesheets
}: {
  tokens: DirectionTokens;
  stylesheets: string[];
}) {
  const loaded = webFonts(stylesheets);

  return (
    <ul className="sg-faces">
      {fontsOf(tokens).map((token) => {
        const family = familyOf(token.value);
        const web = loaded.get(family);
        const styles = web?.styles ?? [
          { weight: 400, italic: false },
          { weight: 700, italic: false }
        ];

        return (
          <li key={token.name} className="sg-face">
            <span
              className="sg-face__glyphs"
              style={{ fontFamily: token.value }}
              aria-hidden="true"
            >
              Aa
            </span>
            <div className="sg-face__about">
              <span className="sg-face__name">{family}</span>
              <span className="sg-caption__note">
                <code>{token.name}</code> ·{" "}
                {web
                  ? `Google Fonts${web.range ? `, variable ${web.range}` : ""}`
                  : "System font"}
              </span>
              <span className="sg-value" title={token.value}>
                {token.value}
              </span>
            </div>
            <ul className="sg-face__styles">
              {styles.map((style) => (
                <li
                  key={`${style.weight}${style.italic}`}
                  style={{
                    fontFamily: token.value,
                    fontWeight: style.weight,
                    fontStyle: style.italic ? "italic" : undefined
                  }}
                >
                  <span className="sg-face__weight">
                    {`${style.weight} ${WEIGHT_NAMES[style.weight] ?? ""}${style.italic ? " italic" : ""}`}
                  </span>
                  Sphinx of black quartz, judge my vow
                </li>
              ))}
            </ul>
            <span className="sg-face__set" style={{ fontFamily: token.value }}>
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
              <br />
              abcdefghijklmnopqrstuvwxyz
              <br />
              0123456789 &amp;@#?!%*()[]“”‘’—–·→
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* Overview
   ========================================================================== */

export function Overview({
  info,
  index,
  tokens,
  compact
}: {
  info: DirectionInfo;
  index: number;
  tokens: DirectionTokens;
  /** In the comparison: link to the direction's guide, skip page links */
  compact?: boolean;
}) {
  const colors = colorsOf(tokens);

  return (
    <article className="sg-overview">
      <header className="sg-overview__head">
        <span className="sg-overview__number">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="sg-overview__name">
          {compact ? (
            <Link to={styleguidePath(info.slug)}>{info.name}</Link>
          ) : (
            info.name
          )}
        </h3>
        <span className="sg-caption__note">{`Started ${info.date}`}</span>
      </header>

      <p className="sg-overview__summary">{info.summary}</p>
      <p className="sg-caption__note">{`Ref. ${info.reference}`}</p>

      <div className="sg-strip" aria-label={`${colors.length} colors`}>
        {colors.map((token) => {
          const { light, dark } = bySchemes(token, tokens.scheme);
          const paper = tokens.paper && bySchemes(tokens.paper, tokens.scheme);
          return (
            <span key={token.name} title={token.name}>
              <span style={over(light, paper?.light)} />
              <span style={over(dark, paper?.dark)} />
            </span>
          );
        })}
      </div>

      <ul className="sg-overview__faces">
        {fontsOf(tokens).map((token) => (
          <li key={token.name}>
            <span style={{ fontFamily: token.value }} aria-hidden="true">
              Aa
            </span>
            {familyOf(token.value)}
          </li>
        ))}
      </ul>

      <p className="sg-overview__links">
        {compact && (
          <Link className="sg-button" to={styleguidePath(info.slug)}>
            Style guide
          </Link>
        )}
        <Link className="sg-button sg-button--quiet" to={labPath(info.slug)}>
          Open mockup ↗
        </Link>
      </p>

      {!compact && (
        <ul className="sg-pills" aria-label={`${info.name} pages`}>
          {SAMPLE_PAGES.map((page) => (
            <li key={page.path}>
              <Link to={labPath(info.slug, page.path)}>{page.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

/* Shell
   ========================================================================== */

export interface ShellSample {
  path: string;
  view: View;
  navigation: NavItem[];
}

export function ShellSpecimen({
  skin,
  shell,
  content
}: {
  skin: Direction;
  shell: ShellSample;
  content: LabContent;
}) {
  const { Shell } = skin;

  return (
    <Shell {...shell} content={content}>
      <div className="sg-placeholder">
        <span>Page template</span>
      </div>
    </Shell>
  );
}
