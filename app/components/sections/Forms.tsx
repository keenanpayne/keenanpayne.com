import type { ComponentProps } from "react";

import { inquiryBudgets, inquiryServices } from "../../data/inquiry";
import { FORM_SUCCESS_PATH } from "../../lib/endpoints";

// Netlify Forms: the pre-rendered markup is detected at deploy time. The
// hidden `form-name` input is what Netlify would otherwise inject, so it's
// rendered here to keep the server and hydrated markup identical.
const SUBJECT =
  "New %{formName} form submission on keenanpayne.com — (%{submissionId})";

// Shared by both forms
const NAME = {
  type: "text",
  name: "Name",
  placeholder: "First and last name",
  required: true
};
const EMAIL = {
  type: "email",
  name: "Email",
  placeholder: "email@company.com",
  required: true
};

function Field({
  label,
  full,
  ...input
}: { label: string; full?: boolean } & ComponentProps<"input">) {
  return (
    <p className={full ? "ContactForm-item -full" : "ContactForm-item"}>
      <label>
        {label}
        <input className="ContactForm-input" {...input} />
      </label>
    </p>
  );
}

export function Contact() {
  return (
    <form
      className="ContactForm _container"
      name="Contact"
      data-netlify="true"
      action={FORM_SUCCESS_PATH}
      method="POST"
    >
      <input type="hidden" name="form-name" value="Contact" />

      <div className="ContactForm-inner">
        <input type="hidden" name="subject" value={SUBJECT} />

        <Field full label="Name" {...NAME} />
        <Field full label="Email" {...EMAIL} />

        <p className="ContactForm-item -full">
          <label>
            What would you like to share?
            <textarea className="ContactForm-input" name="Message" rows={5} />
          </label>
        </p>

        <p className="ContactForm-item -full">
          <button type="submit" className="button -primary ContactForm-button">
            Submit
          </button>
        </p>
      </div>
    </form>
  );
}

function Checkbox({ name, label }: { name: string; label: string }) {
  return (
    <label className="ContactForm-checkbox">
      <input className="ContactForm-input" type="checkbox" name={name} />
      <span>{label}</span>
    </label>
  );
}

export function ProjectInquiry() {
  return (
    <form
      className="ContactForm _container"
      name="Project Inquiry"
      data-netlify="true"
      action={FORM_SUCCESS_PATH}
      method="POST"
    >
      <input type="hidden" name="form-name" value="Project Inquiry" />
      <input type="hidden" name="subject" value={SUBJECT} />

      <Field label="Name" {...NAME} />
      <Field label="Email" {...EMAIL} />
      <Field
        label="Company"
        type="text"
        name="Company"
        placeholder="Company name"
      />
      <Field
        label="Website"
        type="url"
        name="Website"
        placeholder="If you have one"
      />

      <p className="ContactForm-item">
        What services are you interested in?
        {inquiryServices.map(({ name, label }) => (
          <Checkbox key={name} name={name} label={label} />
        ))}
      </p>

      <p className="ContactForm-item">
        <label>
          Please tell me about your company and project
          <textarea
            className="ContactForm-input"
            name="Message About Company and Project"
            rows={10}
            placeholder={
              "What does your company do? \nWhat do you hope to do? \nHow can I help you reach your goals?"
            }
          />
        </label>
      </p>

      <Field label="Ideal launch date" type="date" name="Ideal Launch Date" />

      <p className="ContactForm-item">
        Is your launch date flexible?
        <Checkbox name="Flexible Launch Date — Yes" label="Yes" />
        <Checkbox name="Flexible Launch Date — No" label="No" />
      </p>

      <p>
        <label>
          Project budget
          <select className="ContactForm-input" name="Project Budget">
            {inquiryBudgets.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
        </label>
      </p>

      <p className="ContactForm-item -full">
        <button type="submit" className="button -primary ContactForm-button">
          Submit
        </button>
      </p>
    </form>
  );
}
