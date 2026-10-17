import { useState, type ReactNode } from "react";

import type { TestimonialModel } from "../lib/types";

/** A testimonial's text, followed by its "Read more/less" toggle if any */
function TestimonialText({
  html,
  modifiers,
  children
}: {
  /** HTML */
  html: string;
  modifiers?: string;
  children?: ReactNode;
}) {
  return (
    <p
      className={
        modifiers
          ? `testimonial-text _type-my-voice ${modifiers}`
          : "testimonial-text _type-my-voice"
      }
    >
      <span dangerouslySetInnerHTML={{ __html: html }} />
      {children && <> {children}</>}
    </p>
  );
}

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
              <TestimonialText
                html={truncated}
                modifiers={`testimonial-text-trimmed${expanded ? " _a11y-hidden" : ""}`}
              >
                <button
                  className="testimonial-toggle"
                  onClick={() => setExpanded(true)}
                >
                  Read more
                </button>
              </TestimonialText>

              <TestimonialText
                html={content}
                modifiers={`testimonial-text-full ${expanded ? "_a11y-visible" : "_a11y-hidden"}`}
              >
                <button
                  className="testimonial-toggle"
                  onClick={() => setExpanded(false)}
                >
                  Read less
                </button>
              </TestimonialText>
            </>
          ) : (
            <TestimonialText html={content} />
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
