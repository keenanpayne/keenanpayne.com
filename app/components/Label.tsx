import { Link } from "react-router";

import { canonicalPath } from "../lib/site";
import type { LinkModel } from "../lib/types";

interface LabelProps {
  text?: string | number;
  className?: string;
  readMore?: LinkModel;
}

export function Label({ text, className, readMore }: LabelProps) {
  if (!text) return null;

  return (
    <p className={className ? `_label ${className}` : "_label"}>
      <span>{text}</span>

      {readMore && (
        <Link to={canonicalPath(readMore.url)} className="_font-smoothing">
          {readMore.text}
        </Link>
      )}
    </p>
  );
}
