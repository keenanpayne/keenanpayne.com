// The contact and project inquiry forms, field by field. Directions style
// each kind of field their own way; the questions stay the same everywhere.

import { inquiryBudgets, inquiryServices } from "../../data/inquiry";

export type FormField = {
  name: string;
  label: string;
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

const name: FormField = {
  kind: "input",
  name: "name",
  label: "Name",
  type: "text",
  placeholder: "First and last name"
};

const email: FormField = {
  kind: "input",
  name: "email",
  label: "Email",
  type: "email",
  placeholder: "email@company.com"
};

export const CONTACT_FIELDS: FormField[] = [
  name,
  email,
  {
    kind: "textarea",
    name: "message",
    label: "What would you like to share?",
    rows: 6,
    wide: true
  }
];

export const INQUIRY_FIELDS: FormField[] = [
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
    options: inquiryServices.map((service) => service.label),
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
];

export const formFields = (variant: "contact" | "inquiry") =>
  variant === "contact" ? CONTACT_FIELDS : INQUIRY_FIELDS;
