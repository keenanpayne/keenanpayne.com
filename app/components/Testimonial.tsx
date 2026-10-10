import { useState } from "react";

import type { TestimonialModel } from "../lib/types";

export function Testimonial({
  testimonial
}: {
  testimonial: TestimonialModel;
}) {
  const [expanded, setExpanded] = useState(false);
  const { content, truncated, person } = testimonial;

  return (
    <blockquote className="testimonial">
      {content && (
        <div className="testimonial-content">
          {truncated ? (
            <>
              <p
                className={`testimonial-text _type-my-voice testimonial-text-trimmed${expanded ? " _a11y-hidden" : ""}`}
              >
                <span dangerouslySetInnerHTML={{ __html: truncated }} />{" "}
                <button
                  className="testimonial-toggle"
                  onClick={() => setExpanded(true)}
                >
                  Read more
                </button>
              </p>

              <p
                className={`testimonial-text _type-my-voice testimonial-text-full ${expanded ? "_a11y-visible" : "_a11y-hidden"}`}
              >
                <span dangerouslySetInnerHTML={{ __html: content }} />{" "}
                <button
                  className="testimonial-toggle"
                  onClick={() => setExpanded(false)}
                >
                  Read less
                </button>
              </p>
            </>
          ) : (
            <p className="testimonial-text _type-my-voice">
              <span dangerouslySetInnerHTML={{ __html: content }} />
            </p>
          )}
        </div>
      )}

      {person && (
        <cite className="testimonial-cite">
          {person.image && (
            <img
              className="testimonial-image"
              src={person.image}
              alt={person.name}
            />
          )}

          <p className="testimonial-author">
            {person.name && (
              <span className="testimonial-name _text-h5">{person.name}</span>
            )}
            {person.position && (
              <span className="testimonial-position">{person.position}</span>
            )}
          </p>
        </cite>
      )}
    </blockquote>
  );
}
