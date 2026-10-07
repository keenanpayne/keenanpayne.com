import type { CSSProperties } from "react";

function NewsletterForm() {
  return (
    <form
      action="https://buttondown.email/api/emails/embed-subscribe/kp"
      method="post"
      target="popupwindow"
      onSubmit={() => {
        window.open("https://buttondown.email/kp", "popupwindow");
      }}
      className="newsletter-form embeddable-buttondown-form"
    >
      <div className="newsletter-form-fields">
        <label className="_label-sans" htmlFor="bd-email">
          Enter your email
        </label>
        <input type="email" name="email" id="bd-email" />
        <input type="submit" value="Subscribe" />
      </div>
    </form>
  );
}

function Disclaimer() {
  return (
    <p className="_text-small">
      <em>
        Your email won’t be shared with anyone else. <br />
        You can unsubcribe at any time.
      </em>
    </p>
  );
}

/** Newsletter section used by Markdown pages (`type: newsletter`) */
export function Newsletter({ spacing }: { spacing?: string | number }) {
  return (
    <section
      id="newsletter"
      className="newsletter -pre-footer"
      style={{ "--top-margin": spacing ? spacing : 0 } as CSSProperties}
    >
      <div className="newsletter-container _container">
        <div className="newsletter-description">
          <h2 className="newsletter-title _h2">
            Subscribe to a darn good newsletter
          </h2>

          <p className="_text-h6">
            Get my semi-regular newsletter where I share new tutorials and
            articles to help you grow as a web developer.
          </p>
        </div>

        <div className="newsletter-cta">
          <NewsletterForm />
          <Disclaimer />
        </div>
      </div>
    </section>
  );
}

/** Larger newsletter block (subscribe page and the end of posts) */
export function NewsletterLarge({ modifiers }: { modifiers?: string }) {
  const standalone = modifiers === "-standalone";

  return (
    <section
      id="newsletter"
      className={modifiers ? `newsletter ${modifiers}` : "newsletter"}
    >
      <div
        className={`newsletter-container _container ${standalone ? "-small" : "_grid"}`}
      >
        <div className="newsletter-description">
          <h2
            className={
              standalone ? "newsletter-title _text-h1" : "newsletter-title"
            }
          >
            Subscribe to a darn good newsletter
          </h2>

          <p className="_text-h5">
            Get my semi-regular newsletter where I share new tutorials and
            articles to help you grow as a web developer.
          </p>
        </div>

        <div className="newsletter-cta">
          <NewsletterForm />
          <Disclaimer />
        </div>
      </div>
    </section>
  );
}
