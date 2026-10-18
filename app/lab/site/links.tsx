import { createContext, useContext, type CSSProperties } from "react";

/**
 * URL prefix for the direction being rendered (e.g. `/lab/mech`), so links a
 * direction writes itself stay inside it. Loader data is rebased already.
 * Empty on the live site, where the direction renders at the site root.
 */
export const BaseContext = createContext("");

/**
 * True inside a style guide specimen, where controls show their states but
 * don't navigate (the guide's stage holds plain link clicks the same way)
 */
export const PreviewContext = createContext(false);

export const usePreview = () => useContext(PreviewContext);

/**
 * True on the live site, where the direction renders at the site root; false
 * in the lab's mockups and the style guide's previews
 */
export function useIsLive() {
  const base = useContext(BaseContext);
  const preview = usePreview();
  return base === "" && !preview;
}

/** Builds a link to a site path inside the current direction */
export function useTo() {
  const base = useContext(BaseContext);
  return (path: string) => `${base}${path}`;
}

/** Renders an HTML string from the content (intros, ledes, quotes, …) */
export const Html = ({
  as: Tag = "div",
  className,
  html,
  id,
  style
}: {
  as?: "div" | "p" | "span" | "h1" | "h2" | "h3" | "blockquote";
  className?: string;
  html: string;
  id?: string;
  style?: CSSProperties;
}) => (
  <Tag
    className={className}
    id={id}
    style={style}
    dangerouslySetInnerHTML={{ __html: html }}
  />
);
