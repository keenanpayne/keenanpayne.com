// Where the forms post to. The CSP (`security-headers.ts`) and the Netlify
// build config (`vite.config.ts`) allow exactly these, so they live here with
// no imports: Vite's config loader can't follow the JSON import in `site.ts`.

/** Newsletter host (buttondown.email 302s here, which drops the POST body) */
export const BUTTONDOWN_ORIGIN = "https://buttondown.com";

/** Where Netlify Forms send visitors after a submission */
export const FORM_SUCCESS_PATH = "/form-submission-success";
