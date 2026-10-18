// Where the forms post to. The CSP (`security-headers.ts`) and the Netlify
// build config (`vite.config.ts`) allow exactly these, so they live here with
// no imports: Vite's config loader can't follow the JSON import in `site.ts`.

/** Newsletter host (buttondown.email 302s here, which drops the POST body) */
export const BUTTONDOWN_ORIGIN = "https://buttondown.com";

/** Where the newsletter sign-up posts, and the page it opens to confirm */
export const NEWSLETTER_ACTION = `${BUTTONDOWN_ORIGIN}/api/emails/embed-subscribe/kp`;
export const NEWSLETTER_PAGE = `${BUTTONDOWN_ORIGIN}/kp`;

/** Where Netlify Forms send visitors after a submission */
export const FORM_SUCCESS_PATH = "/form-submission-success";
