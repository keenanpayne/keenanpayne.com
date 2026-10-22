// The contact and project inquiry forms, and the newsletter sign-up: their
// copy, their questions field by field, and where each sends its answers.
// Directions style each kind of field their own way; the questions and the
// destinations stay the same everywhere (`useSubmission()` wires them).

import { inquiryBudgets, inquiryServices } from "../../data/inquiry";
import { FORM_SUCCESS_PATH, NEWSLETTER_ACTION } from "../../lib/endpoints";
import { SITE_ORIGIN } from "../../lib/site";

export type FormField = {
  name: string;
  label: string;
  /** The form can't be sent without an answer */
  required?: boolean;
  /** Spans the full width of a two-column form */
  wide?: boolean;
} & (
  | {
      kind: "input";
      type: "text" | "email" | "url" | "date";
      placeholder?: string;
    }
  | { kind: "textarea"; rows: number; placeholder?: string }
  | {
      kind: "choices";
      /** Pick any (checkbox) or one (radio) */
      type: "checkbox" | "radio";
      options: string[];
    }
);

export interface Form {
  /** Its name at Netlify Forms, which files its submissions under it */
  name: string;
  /** What the form is, e.g. above its page's title */
  title: string;
  /** The submit button's label */
  submit: string;
  fields: FormField[];
  /** The other form, offered beside this one */
  alternate: { text: string; path: string };
}

const name: FormField = {
  kind: "input",
  name: "name",
  label: "Name",
  type: "text",
  placeholder: "First and last name",
  required: true
};

const email: FormField = {
  kind: "input",
  name: "email",
  label: "Email",
  type: "email",
  placeholder: "email@company.com",
  required: true
};

const FORMS: Record<"contact" | "inquiry", Form> = {
  contact: {
    name: "Contact",
    title: "Contact",
    submit: "Send message",
    alternate: {
      text: "Start a project inquiry instead",
      path: "/project-inquiry/"
    },
    fields: [
      name,
      email,
      {
        kind: "textarea",
        name: "message",
        label: "What would you like to share?",
        rows: 6,
        wide: true
      }
    ]
  },
  inquiry: {
    name: "Project Inquiry",
    title: "Project inquiry",
    submit: "Send inquiry",
    alternate: { text: "Just saying hello?", path: "/contact/" },
    fields: [
      name,
      email,
      {
        kind: "input",
        name: "company",
        label: "Company",
        type: "text",
        placeholder: "Company name"
      },
      {
        kind: "input",
        name: "website",
        label: "Website",
        type: "url",
        placeholder: "If you have one"
      },
      {
        kind: "choices",
        name: "services",
        label: "What services are you interested in?",
        type: "checkbox",
        options: inquiryServices,
        wide: true
      },
      {
        kind: "textarea",
        name: "project",
        label: "Please tell me about your company and project",
        rows: 7,
        placeholder:
          "What does your company do?\nWhat do you hope to do?\nHow can I help you reach your goals?",
        wide: true
      },
      {
        kind: "input",
        name: "launch-date",
        label: "Ideal launch date",
        type: "date"
      },
      {
        kind: "choices",
        name: "flexible",
        label: "Is your launch date flexible?",
        type: "radio",
        options: ["Yes", "No"]
      },
      {
        kind: "choices",
        name: "budget",
        label: "Project budget",
        type: "radio",
        options: inquiryBudgets,
        wide: true
      }
    ]
  }
};

/** The contact or the project inquiry form */
export const formOf = (kind: "contact" | "inquiry") => FORMS[kind];

/**
 * The newsletter sign-up, on every page that asks for it (`hasNewsletter()`,
 * or a post's `newsletter`): one email field
 */
export const newsletterForm = {
  title: "Newsletter",
  text: "New articles and tutorials, sent when they’re published.",
  submit: "Subscribe",
  field: email
} as const;

export type SubmissionKind = "contact" | "inquiry" | "newsletter";

/** Where a form sends its answers: what its `<form>` carries */
export interface Submission {
  attributes: {
    /** The contact and inquiry forms, as Netlify Forms files them */
    name?: string;
    method: "POST" | "post";
    action: string;
    /** The newsletter sign-up posts into the popup `useSubmission()` opens */
    target?: string;
    /** Marks the form for Netlify Forms, which reads it off the built page */
    "data-netlify"?: "true";
  };
  /** Hidden fields inside the form, which the submission carries along */
  hidden: { name: string; value: string }[];
}

// The subject line of Netlify's notification, with its placeholders
const SUBJECT = `New %{formName} form submission on ${new URL(SITE_ORIGIN).host} — (%{submissionId})`;

/**
 * Where each form sends, on the live site. The contact and inquiry forms
 * post to Netlify Forms under their `name` (the hidden `form-name` field
 * says which, as the markup is rendered by React), and on to the success
 * page; the newsletter sign-up posts to Buttondown. `useSubmission()` gives
 * a direction's form these there, and nothing of them in the lab, where the
 * form is a mockup.
 */
export function submissionOf(kind: SubmissionKind): Submission {
  if (kind === "newsletter") {
    return {
      attributes: {
        method: "post",
        action: NEWSLETTER_ACTION,
        target: "popupwindow"
      },
      hidden: []
    };
  }
  const { name } = FORMS[kind];
  return {
    attributes: {
      name,
      method: "POST",
      action: FORM_SUCCESS_PATH,
      "data-netlify": "true"
    },
    hidden: [
      { name: "form-name", value: name },
      { name: "subject", value: SUBJECT }
    ]
  };
}
