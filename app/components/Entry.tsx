import { Link } from "react-router";

import { canonicalPath } from "../lib/site";
import type { EntryModel } from "../lib/types";

export function Entry({ entry }: { entry: EntryModel }) {
  const url = entry.url ? canonicalPath(entry.url) : undefined;

  return (
    <article className="collections-item">
      <div className="collections-content">
        {entry.cover && (
          <Link to={url ?? ""} title={entry.heading}>
            <div
              className="collections-image"
              style={{
                background: `url('${entry.cover}') no-repeat center center / cover`,
                backgroundSize: "cover"
              }}
            ></div>
          </Link>
        )}

        <div className="collections-text">
          {entry.heading && (
            <h2 className="collections-heading _text-h4">
              {url ? (
                <Link className="-underline-hover" to={url}>
                  {entry.heading}
                </Link>
              ) : (
                entry.heading
              )}
            </h2>
          )}

          {entry.lede && (
            <p
              className="collections-description _text-h6"
              dangerouslySetInnerHTML={{ __html: entry.lede }}
            />
          )}

          {url && entry.linkText && (
            <Link className="more collections-link" to={url}>
              {`${entry.linkText} →`}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
