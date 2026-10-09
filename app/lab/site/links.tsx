import { createContext, useContext, type CSSProperties } from "react";

/**
 * URL prefix for the direction being rendered (e.g. `/lab/mech`), so links a
 * direction writes itself stay inside it. Loader data is rebased already.
 */
export const BaseContext = createContext("");

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
