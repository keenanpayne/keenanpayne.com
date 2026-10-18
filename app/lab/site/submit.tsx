import {
  useState,
  type FormEvent,
  type FormHTMLAttributes,
  type ReactNode
} from "react";

import { NEWSLETTER_PAGE } from "../../lib/endpoints";
import { submissionOf, type SubmissionKind } from "./forms";
import { useIsLive } from "./links";

/** What a mockup form says instead of sending, before and after a submit */
export const MOCKUP_STATUS = {
  idle: "Mockup only — this form doesn’t send anything.",
  sent: "Mockup only — nothing was sent."
};

export interface FormSubmission {
  /**
   * Attributes for the `<form>`: where it sends (`submissionOf(kind)`), and
   * in the lab, the handler that holds the submit instead
   */
  props: FormHTMLAttributes<HTMLFormElement> & { "data-netlify"?: "true" };
  /** The hidden fields a submission needs, to render inside the form */
  hidden: ReactNode;
  /**
   * In the lab, where the form is a mockup, its note (`MOCKUP_STATUS`).
   * Nothing on the live site, where the form sends.
   */
  status?: string;
  /** In the lab, whether the mockup has been submitted */
  sent: boolean;
}

/**
 * What a direction's `<form>` needs to send the contact form, the project
 * inquiry, or the newsletter sign-up: spread `props` onto it and render
 * `hidden` inside it. On the live site the form sends for real, to Netlify
 * Forms or to Buttondown; in the lab and the style guide the same form is a
 * mockup, so the submit is held and `status` says so. A direction words
 * its own note from `sent` if it likes.
 */
export function useSubmission(kind: SubmissionKind): FormSubmission {
  const live = useIsLive();
  const [sent, setSent] = useState(false);
  const { attributes, hidden } = submissionOf(kind);

  const onSubmit = !live
    ? (event: FormEvent) => {
        event.preventDefault();
        setSent(true);
      }
    : kind === "newsletter"
      ? // Buttondown's embed: the form posts into a popup of its own page
        () => window.open(NEWSLETTER_PAGE, attributes.target)
      : undefined;

  return {
    props: { ...attributes, onSubmit },
    hidden: hidden.map(({ name, value }) => (
      <input key={name} type="hidden" name={name} value={value} />
    )),
    status: live ? undefined : sent ? MOCKUP_STATUS.sent : MOCKUP_STATUS.idle,
    sent
  };
}
