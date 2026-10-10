import { Link } from "react-router";

import type { PostNavModel } from "../lib/types";

export function PostNav({ nav }: { nav: PostNavModel | null }) {
  if (!nav) return null;

  return (
    <div className="postNav">
      <p className="postNav-next">
        {nav.next && (
          <>
            <span className="postNav-label _label-sans">Next Post</span>
            <Link className="-hover-background" to={nav.next.url}>
              {nav.next.text}
            </Link>
          </>
        )}
      </p>

      <p className="postNav-prev">
        {nav.previous && (
          <>
            <span className="postNav-label _label-sans">Previous Post</span>
            <Link className="-hover-background" to={nav.previous.url}>
              {nav.previous.text}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
