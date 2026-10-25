# Design lab: working on a direction

Every direction in `directions/<slug>/` is a skin over one site: the same content, pages, features, and foundations, in its own look. One of them is live (`live.ts`): the site renders every page with it at the root, while the others are mockups at `/lab/<slug>/`. `README.md` explains the layers; these are the rules for changing them. When a request would make one direction differ from the others in anything but its look, say so and follow “Adding a feature” below instead.

## Always

- Run `npm run lab:check` before you finish. It must pass, and CI runs it on every push and pull request. A failure names the direction, the requirement, and what’s missing on which page. `/lab/styleguide/conformance/` shows the same results for every direction at once.
- Start from Wireframe (`directions/wireframe/`). It meets every requirement in plain HTML, so it shows what each page and the Shell must have.
- Never edit `conformance/gaps.ts` except to delete a line you’ve closed. Don’t add a line, or loosen a check in `conformance/`, to make a test pass.
- Every direction is held to WCAG 2.2 AAA. After any change to how a direction looks or behaves, run `npm run a11y -- -g <Name>` (its display name in `registry.ts`; a few minutes) and fix what it names. It must pass, and CI runs it for every direction. The same rule holds for `accessibility/gaps.ts` as for `conformance/gaps.ts`: delete a line you’ve closed, never add one, and never loosen `accessibility/checks.ts` or the audit to make it pass.

## Editing one direction

- Change only its folder. The shared layers (`site/`, `app/data/`, `content/`, `conformance/`) change only for a feature every direction gets.
- Read every fact, copy, photo, and link from `content` and the template’s `page`. Never type the owner’s name, initials, email, domain, role, city, or years, even in flavor copy; the source check fails on them.
- Use the shared readers: `titleOf(page)` for the `<h1>`, `labelOf(page)`, `HOME.posts`, `homeWork(content)` (Home’s case studies, and only those), `quotesOf(page, content)`, `formOf(kind)`, `newsletterForm`, `hasNewsletter(page)`, `useTo()` for fixed paths, `useReadout(location)` and `LocalTime` for the weather and clock.
- Wire every form with `useSubmission(kind)`: spread its `props` on the `<form>`, render its `hidden` fields inside, and show its `status` when there is one. That’s what makes the form send on the live site and hold as a mockup in the lab; never write your own `onSubmit`.
- Wire the clock and its popover with `useReadout(profile.location)`, once in the Shell: spread its `button` on the clock (on each one, if the Shell has several), its `popover` on the readout, and its `close` on a Close button if the skin has one; read the forecast from the rest (`current`, `label`, `tone`, `note`, …) and link `credit` inside. The clock’s name is what it shows, so it must show text (the time, say). That’s what describes and names them for the checks and refreshes the forecast as the popover opens; never write your own `popoverTarget`, `aria-label`, or `onToggle` for them.
- Show `Comments` (with `page.meta.canonical`) on every post and case study whose `page.comments` is set, and nowhere else, under a heading of your own. It loads the Disqus thread on the live site and marks its place in the lab.
- Keep the Shell’s features: a skip link to `<main id>`, the name linking home, the `navigation` prop as one `<nav>` with `aria-current`, the clock opening the weather popover (wired with `useReadout()`, crediting Open-Meteo), on screen on phones too, and a `<footer>` with `© {year} {name}`, every social profile, and the feed. A phone menu that repeats the navigation gets its own `aria-label`.
- Before a color goes in, measure it: `npm run a11y:contrast -- "<color>" "<background>"` against everything it sits on, in both schemes and every state (hover, active, visited, selected). Text needs 7:1 (4.5:1 at 24px, or 18.66px bold); borders a control needs, icons, and focus rings need 3:1. `-- <slug>` shows a direction’s role pairs.
- Keep what the audit holds to: targets of 44 by 44px (a link inside a sentence is exempt), text blocks at a line height of 1.5 and 80 characters a line or fewer, never justified, no sideways scrolling at 320px, a focus ring of at least 2px in `-focus` at 3:1 against what’s behind it, and nothing fixed or sticky covering a focused element. In markup, the strict jsx-a11y lint applies; disable a rule on one line only for a deliberate, keyboard-accessible pattern, with the reason above it.
- Then check by hand what the tools can’t (`README.md`, “Making a design change”), and say in your summary which of those you checked.
- In CSS: prefix every class, custom property, and `@keyframes` with the root class, and scope every selector under it; keep the role tokens on `:root` (`--<root>-paper`, `-ink`, `-muted`, `-line`, `-surface`, `-accent`, `-focus`, `-selection`, `-selection-ink`, `-font-display`, `-font-body`, `-font-mono`) and both color schemes, identically; stop motion under `prefers-reduced-motion` with one rule on `.<root> *`.
- Motifs are yours: ornament, illustration, animation, voice, labels, and other presentations of the same content. A new part or variant also goes in the direction’s `specimens.tsx`.

## Adding a feature or a page section

Anything that changes what the site has (a section, a control like search or a filter, a link to a page the navigation doesn’t lead to, a fact, a count) is shared:

1. Add it to the shared layers and write its requirement in `conformance/requirements.ts` (or `foundations.ts`).
2. Build it in Wireframe, plainly.
3. Build it in every other direction, until `npm run lab:check` passes.

## Starting a direction

`npm run lab:new -- <slug> ["Display name"]` copies Wireframe, so it passes every check from the start. Fill in its registry entry, then restyle it.
