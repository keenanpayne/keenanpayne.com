# Working on this site

The site is one design direction from the design lab, rendered at the root. `README.md` explains the project; `app/lab/AGENTS.md` has the rules for changing a direction, and applies to any change to how the site looks.

## Accessibility

Every page is held to WCAG 2.2 AAA. For any change that affects what a page renders (a direction, the shared layers in `app/lab/site/`, the Markdown pipeline in `app/lib/content/`, `app/root.tsx`, or content):

- Measure a color before it goes in: `npm run a11y:contrast -- "<color>" "<background>"`.
- Before you finish, run `npm run validate` and `npm run a11y` (or `npm run a11y -- -g <Name>` for the one direction you changed). Both must pass, and CI runs both.
- Never add a line to `app/lab/accessibility/gaps.ts` or `app/lab/conformance/gaps.ts`, or loosen a check, to make them pass. Delete a line you've closed.
- What the tools can't check (hover and focus states, motion, 200% text, a screen reader pass) is listed in `app/lab/README.md` under “Making a design change”; check what your change touches, and say which in your summary.
