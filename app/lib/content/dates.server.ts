import { DateTime } from "luxon";

const utc = (date: Date) =>
  DateTime.fromJSDate(date, { zone: "utc" }).setLocale("en-US");

/** e.g. "Apr 25, 2022" */
export const readableDate = (date: Date) => utc(date).toFormat("LLL dd, yyyy");

/** e.g. "Monday, April 25, 2022" */
export const longDate = (date: Date) => utc(date).toFormat("DDDD");

/** e.g. "2022" */
export const postYear = (date: Date) => utc(date).toFormat("yyyy");

/** https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string */
export const htmlDateString = (date: Date) => utc(date).toFormat("yyyy-LL-dd");

/** RFC 3339, as Atom and JSON Feed require, e.g. "2022-04-25T00:00:00Z" */
export const rfc3339Date = (date: Date) =>
  `${date.toISOString().split(".")[0]}Z`;
