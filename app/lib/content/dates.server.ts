// Dates are formatted in UTC, like the Eleventy filters were.
const format = (date: Date, options: Intl.DateTimeFormatOptions) =>
  date.toLocaleDateString("en-US", { timeZone: "UTC", ...options });

/** e.g. "Apr 25, 2022" */
export const readableDate = (date: Date) =>
  format(date, { month: "short", day: "2-digit", year: "numeric" });

/** e.g. "Monday, April 25, 2022" */
export const longDate = (date: Date) =>
  format(date, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

/** e.g. "2022" */
export const postYear = (date: Date) => String(date.getUTCFullYear());

/** https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string */
export const htmlDateString = (date: Date) => date.toISOString().slice(0, 10);

/** RFC 3339, as Atom and JSON Feed require, e.g. "2022-04-25T00:00:00Z" */
export const rfc3339Date = (date: Date) =>
  `${date.toISOString().split(".")[0]}Z`;
