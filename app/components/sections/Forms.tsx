// Netlify Forms: the pre-rendered markup is detected at deploy time. The
// hidden `form-name` input is what Netlify would otherwise inject, so it's
// rendered here to keep the server and hydrated markup identical.
const SUBJECT =
  "New %{formName} form submission on keenanpayne.com — (%{submissionId})";

export function Contact() {
  return (
    <form
      className="ContactForm _container"
      name="Contact"
      data-netlify="true"
      action="/form-submission-success"
      method="POST"
    >
      <input type="hidden" name="form-name" value="Contact" />

      <div className="ContactForm-inner">
        <input type="hidden" name="subject" value={SUBJECT} />

        <p className="ContactForm-item -full">
          <label>
            Name
            <input
              className="ContactForm-input"
              type="text"
              name="Name"
              placeholder="First and last name"
              required
            />
          </label>
        </p>

        <p className="ContactForm-item -full">
          <label>
            Email
            <input
              className="ContactForm-input"
              type="email"
              name="Email"
              placeholder="email@company.com"
              required
            />
          </label>
        </p>

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

const SERVICES = [
  ["Services — Website Design", "Website design"],
  ["Services — Website Development", "Website development"],
  ["Services — Web Application Development", "Web application development"],
  ["Services — UI Design", "User Interface (UI) design"],
  ["Services — UX Research", "User Experience (UX) research"],
  ["Services — Other", "Other"],
  ["Services — Not Sure", "Not sure yet"]
];

const BUDGETS = [
  "Less than $10,000",
  "$10,000 - $25,000",
  "$25,000 - $50,000",
  "More than $50,000"
];

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
      action="/form-submission-success"
      method="POST"
    >
      <input type="hidden" name="form-name" value="Project Inquiry" />
      <input type="hidden" name="subject" value={SUBJECT} />

      <p className="ContactForm-item">
        <label>
          Name
          <input
            className="ContactForm-input"
            type="text"
            name="Name"
            placeholder="First and last name"
            required
          />
        </label>
      </p>

      <p className="ContactForm-item">
        <label>
          Email
          <input
            className="ContactForm-input"
            type="email"
            name="Email"
            placeholder="email@company.com"
            required
          />
        </label>
      </p>

      <p className="ContactForm-item">
        <label>
          Company
          <input
            className="ContactForm-input"
            type="text"
            name="Company"
            placeholder="Company name"
          />
        </label>
      </p>

      <p className="ContactForm-item">
        <label>
          Website
          <input
            className="ContactForm-input"
            type="url"
            name="Website"
            placeholder="If you have one"
          />
        </label>
      </p>

      <p className="ContactForm-item">
        What services are you interested in?
        {SERVICES.map(([name, label]) => (
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

      <p className="ContactForm-item">
        <label>
          Ideal launch date
          <input
            className="ContactForm-input"
            type="date"
            name="Ideal Launch Date"
          />
        </label>
      </p>

      <p className="ContactForm-item">
        Is your launch date flexible?
        <Checkbox name="Flexible Launch Date — Yes" label="Yes" />
        <Checkbox name="Flexible Launch Date — No" label="No" />
      </p>

      <p>
        <label>
          Project budget
          <select className="ContactForm-input" name="Project Budget">
            {BUDGETS.map((budget) => (
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
