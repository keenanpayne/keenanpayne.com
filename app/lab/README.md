# Design lab

Every direction at `/lab/<slug>/` is a **skin over one site**: the same content and the same pages, in a different visual language. The site’s content and information architecture live in shared layers; a direction only decides how they look. One of them is **live**: `live.ts` names it, and `app/routes/page.tsx` renders every page of the site with it, at the site root (see [Taking a direction live](#taking-a-direction-live)).

## Layers

| Layer | Lives in | Owns |
| --- | --- | --- |
| Content | `content/*.md`, `app/data/` (`profile.ts`, `inquiry.ts`, `portfolio/`, `testimonials.ts`, …) | What the site says |
| Content model | `getLabContent()` in `app/lib/content/content.server.ts`, typed as `LabContent`; shipped once, as `virtual:lab-content` (`vite.config.ts`), read through `content.ts` | The shape every direction receives |
| Information arch. | `site/ia.ts` | The kinds of page (`View`), which URL is which kind, the navigation, the sample pages |
| Direction contract | `site/direction.tsx` | `Direction`: `stylesheets`, a `root` class, a `Shell`, one template per kind of page, and its style guide `specimens` |
| Shared helpers | `site/` (`helpers.ts`, `hooks.ts`, `forms.ts`, `submit.tsx`, `comments.tsx`, `links.tsx`, `time.ts`, `weather.ts`, `readout.ts`, `isometric.ts`, `page.server.ts`) | Reading the content the same way everywhere: intros, years, reading time, clocks, forms and where they send, comments, Denver's time and weather and the clock popover that shows them; the isometric pen the service illustrations are drawn with; and how a site path becomes a page for the live site, the lab, and the checks alike |
| Directions | `directions/<slug>/`, registered in `registry.ts` | How it looks: the Shell, the templates, and the specimens, in React |
| Stylesheets | [`@keenanpayne/forma-ui`](https://github.com/keenanpayne/forma-ui), read through `forma.server.ts` | Each direction's CSS (with the document reset beneath every skin) and its fonts, as a package any site can use; its demo shows every direction's components with their markup, written from this site's rendered pages by `npm run forma:samples` |
| Live direction | `live.ts` | Which direction the site runs; the rest stay in the lab |
| Conformance | `conformance/` | Checks that every direction has the same features, pages, and foundations (see [Guardrails](#guardrails)) |
| Accessibility | `accessibility/` | The WCAG 2.2 AAA audit of every direction in a browser, and the contrast math (see [Accessibility](#accessibility)) |

A request for `/lab/mech/about/` runs through the route in `app/routes/lab.$direction.tsx`: the loader resolves `/about/` to a `View` (`{ kind: "about", page }`), marks the current navigation item, and rebases every internal link onto `/lab/mech/`. The `LabContent` is the same on every page, so it isn’t in the loader data: it ships once, as a module (`virtual:lab-content`, serialized at build time by the plugin in `vite.config.ts`), and `useLabContent(base)` in `content.ts` rebases its links in the browser. `DirectionPage` then renders the direction’s `Shell` around `templates[view.kind]`.

## A direction

```
directions/<slug>/
├── index.tsx    # The Direction: its stylesheet and fonts (from @keenanpayne/forma-ui), root class, Shell, and a template for every kind of page
├── Shell.tsx    # Header, navigation, footer
├── Denver.tsx   # The local time and weather popover the Shell opens
├── pages/       # One template per kind of page (some directions share one across kinds)
├── parts.tsx    # The direction’s own building blocks
└── specimens.tsx # Its parts, laid out for the style guide (loaded only there)
```

Its styles are `src/directions/<slug>/<slug>.css` in [forma-ui](https://github.com/keenanpayne/forma-ui), scoped to its root class, with its fonts in the manifest beside it; `index.tsx` links the built stylesheet from the package. To work on them, link a checkout (`npm link` there, `npm link @keenanpayne/forma-ui` here) and run `npm run watch` there; the dev server serves the linked files.

The `Direction` type requires a template for every kind in `View`, so a direction can’t skip a page, and adding a kind of page is a type error in each direction until it has one.

### Rules

- **Content comes from props, never from the direction.** Read facts, copy, photos, and links from `content` (`profile`, `socials`, `posts`, `work`, `services`, `testimonials`) and the template’s `page`. Don’t restate them: not the owner’s name, initials, email, domain, role, city, or years, even in flavor copy.
- **Read the content the shared way:** a page’s title is `titleOf(page)` and its label `labelOf(page)`; Home shows at least `HOME.posts` posts, exactly the case studies in `HOME.work` (`homeWork(content)`) and no others, and every service and testimonial; a page’s quotes are `quotesOf(page, content)`.
- **Voice is the direction’s.** Relabeling a fact (`relabel(facts, { location: "Base" })`), naming sections in the skin’s language, and flavor copy that only makes sense in one skin (Portal’s mascot lines, Mech’s episode numbers) belong to the direction.
- **Links:** URLs in the content are already rebased. For fixed site paths, use `useTo()`: `to("/contact/")`.
- **Forms:** render `formOf("contact" | "inquiry")`: its `title`, `fields` (marking the `required` ones), `submit` label, and the `alternate` form it links to, so every direction asks the same questions. The newsletter sign-up is `newsletterForm`, on the pages that ask for it (`hasNewsletter(page)`, a post’s `newsletter`). Wire each `<form>` with `useSubmission(kind)`: spread its `props`, render its `hidden` fields inside, and show its `status` when there is one. On the live site the forms send for real (the contact and inquiry forms to Netlify Forms, the sign-up to Buttondown: `submissionOf(kind)`); in the lab and the style guide the same forms are mockups that carry no destination and can’t send even before the page’s script runs, and `status` says so.
- **Clock:** wire the Shell’s clock and its popover with `useReadout(profile.location)`, called once in the Shell: spread its `button` on the clock (on each one, if there are several), its `popover` on the readout, and its `close` on a Close button if there is one; read the forecast from the rest and link `credit` inside. It describes the clock and names the popover for the conformance checks (the clock’s name is what it shows, so it must show text: the time, say), refreshes the forecast as the popover opens, and says whether it’s `open`, so a clock inside can tick only then (`useNow(open)`). The clock’s face and the readout’s layout are the direction’s.
- **Comments:** a post or case study that asks for them (`page.comments`) shows `Comments` with its `page.meta.canonical`, and one that doesn’t shows none. On the live site it loads the Disqus thread; in the lab and the style guide it marks the thread’s place and says so. The heading and surroundings are the direction’s.
- **Styles are scoped.** A direction’s stylesheet stays loaded after the lab navigates to another direction, so prefix every class, custom property, and `@keyframes` name with the root class (`mc-`, `--mc-`), and scope every selector under it, print styles included. (forma-ui’s `docs/tokens.md` and `docs/creating-a-direction.md` have the stylesheet rules in full; its `npm run check` enforces them, as `lab:check` does here.)
- **Page-wide effects skip the style guide.** A rule that reaches past the direction for something a visitor opens (locking the page’s scroll, hiding the lab bar) must not match it inside the style guide’s previews: `:root:has(.mc-deck:not([hidden], .sg-stage *))`.
- **Light and dark:** define tokens on `:root`, then override them under `@media (prefers-color-scheme: dark)` with `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]` (the lab bar’s switch), identically. A skin that’s dark by default (Mech) does the same the other way around.
- **Accessible:** every direction is held to WCAG 2.2 AAA (see [Accessibility](#accessibility)). Check a color before it goes in (`npm run a11y:contrast`), and audit the direction before you finish (`npm run a11y -- -g <Name>`).
- **Foundations:** name the same roles on `:root`, whatever their values: `--<root>-paper`, `-ink`, `-muted`, `-line`, `-surface`, `-accent`, `-focus`, `-selection`, `-selection-ink`, `-font-display`, `-font-body`, and `-font-mono` (`conformance/foundations.ts`). An alias of a token the skin already has is fine (`--mc-paper: var(--mc-void)`), but a custom property resolves where it’s declared: a scope that re-declares the tokens a role aliases (Gridline’s inverted bands) re-declares the role too. Then paint the page in `-paper` (`body:has(.<root>)`), draw focus rings in `-focus`, color `::selection` with `-selection` and `-selection-ink`, and stop every animation and transition under `prefers-reduced-motion: reduce` with one rule on `.<root> *`. Every other token is the skin’s own.

## Common changes

| To… | Change |
| --- | --- |
| Edit a fact, the bio, a photo, a step | `app/data/profile.ts`: every direction updates |
| Edit a page’s copy | Its Markdown in `content/` |
| Add a form question | `site/forms.ts` |
| Change Home’s case studies | `HOME.work` in `site/ia.ts`: every direction follows, and the conformance checks hold them to it |
| Add a navigation item | `NAVIGATION` (and `SECTIONS`, for the pages beneath it) in `site/ia.ts` |
| Add a feature or a page section | The shared layers and `conformance/requirements.ts`, then Wireframe, then every direction (see [Feature or motif?](#feature-or-motif)) |
| Add something to the content model | `LabContent` in `app/lib/types.ts` and `getLabContent()` |
| Add a kind of page | `View`, `resolveView()`, and `SAMPLE_PAGES` in `site/ia.ts`, then `npm run typecheck` lists every direction that needs a template |
| Restyle a direction | Its folder here (templates), and its folder in forma-ui (the stylesheet) |
| Start a direction | `npm run lab:new -- <slug> ["Display name"]`, which copies Wireframe, renames it, and registers it; and `npm run new -- <slug>` in forma-ui for its stylesheet |
| Share a direction’s markup | `npm run build && npm run forma:samples`: writes every direction’s rendered pages and specimens into the forma-ui checkout |
| Launch a direction | `live.ts` (see [Taking a direction live](#taking-a-direction-live)) |
| Check your work | `npm run lab:check`: types, conformance, and lint for the lab; then `npm run a11y -- -g <Name>` for the direction you changed |
| Pick a color | `npm run a11y:contrast -- "<color>" "<background>"`, or `-- <slug>` for a direction’s role pairs (`--all` for every token) |
| Show a new part in the style guide | Its direction’s `specimens.tsx` |
| Retire a direction | Delete its folder and its entry in `registry.ts` |

## Style guide

`/lab/styleguide/` shows every direction’s foundations, components, and chrome, two ways: one direction with all of its sections (`/lab/styleguide/<slug>/`, or one section alone at `/lab/styleguide/<slug>/<section>/`), or one section across every direction (`/lab/styleguide/compare/<section>/`). The sections are listed in `styleguide/sections.ts`. A third view, **Conformance** (`/lab/styleguide/conformance/`), shows how every direction measures up to the [guardrails](#guardrails).

- **Shared sections** draw themselves for every direction: Color reads the custom properties straight from the package’s `<slug>.css` (`styleguide/tokens.server.ts`), Typefaces reads the font tokens and the Google Fonts URL in `stylesheets`, and Shell renders the direction’s `Shell` around a placeholder. They need nothing from a direction beyond following the light and dark rule above.
- **Specimens** are the rest (type scale, motifs, imagery, page header, buttons, labels, panels, cards, lists, testimonials, forms, wayfinding, prose). A direction’s `specimens.tsx` gives each one a component that renders its own parts with real `content`, laid out with `styleguide/kit.tsx`: `SpecimenGrid`, `Specimen` (a captioned example), `TypeSample` (measures and prints a style’s specs), and `Note`. They render inside the direction’s `root` class, and receive the `navigation` as the Shell section shows it; `prose` is an article body with every element the Markdown can produce, run through the real pipeline. The style guide alone loads `specimens.tsx`, so a mockup page doesn’t carry it.
- When a direction gains a part or a variant, add it to its specimens. Adding a section is one entry in `STYLE_SECTIONS`, then `npm run typecheck` lists every direction that needs a specimen for it.

**Wireframe** is the baseline: every kind of page with all of its content, and every feature, in plain, semantic HTML. It meets every requirement in `conformance/`, so it’s the quickest way to see what a page has to offer, and new directions start as a copy of it.

## Guardrails

Every direction has the same features, pages, and foundations, so a person or an agent can write or edit one without checking the others. Three layers hold them to it, and `npm run lab:check` runs them all (`npm test` runs the conformance checks too). CI (`.github/workflows/ci.yml`) runs them on every push and pull request, so a change to any direction, or to the shared layers beneath them, that falls short fails the build:

1. **Types.** `Direction` needs a template for every kind of page, and `Specimens` one specimen for every style guide section.
2. **Conformance** (`conformance/`). The tests render every direction’s sample pages the way the lab route does, plus the pages with sections no sample has (`conformance/pages.ts`; a test makes sure every kind of page and every section the requirements read is among them), then check:
   - **Requirements** (`requirements.ts`): the feature set and information architecture, checked the way a visitor would find them (text, links, images, landmarks), so any skin can meet them. The Shell has a skip link to `<main>`, the owner’s name linking home, the navigation with the current item marked, a footer with `© {year} {name}`, every social profile, the feed, and the local time and weather popover, with a clock that stays on screen on phones (`viewport.ts` reads the stylesheet at a phone’s width for that); it links nowhere the navigation doesn’t lead, and holds no forms. Every page has one `<h1>` (its `titleOf()`), links that lead somewhere, and `alt` on its images. Then each kind of page has its content: Home its intro, latest posts, exactly its case studies, and every service and testimonial; a post its breadcrumbs, date, reading time, tags, whole body, neighbors, and comments; a form its questions and copy, sending the shared way; and so on.
   - **Foundations** (`foundations.ts`): the role tokens, both schemes, their contrast (`css.contrast`: text roles at 7:1 on the paper and surface, the accent and focus ring at 3:1, in both schemes), the page color, focus ring, selection, reduced motion, and the prefix on every selector, custom property, and keyframe. Read from the installed package’s source stylesheet (`forma.server.ts`); forma-ui runs the same checks before a release.
   - **Source** (`source.ts`): no fact about the owner spelled out in a direction’s code.
3. **Known gaps** (`conformance/gaps.ts`): what each direction fell short of when the checks were written. It only shrinks. The tests fail when a direction falls short of anything not listed, and when it meets something listed, so the line comes off. To close one, delete its line and run `npm run lab:check`; the failure says what’s missing, page by page. Never add a line to make a check pass.

A failure names the direction, the requirement and its rule, and what’s missing on which page. The style guide’s Conformance page (`/lab/styleguide/conformance/`) shows the same results for every direction at once: a score for each, every check across all of them, and each known gap or regression with what’s missing, page by page. `conformance/report.server.ts` runs the checks for both, so the page and the tests never disagree; in development the page runs them afresh each time you open it.

A fourth layer, the [accessibility audit](#accessibility), renders the same pages in a browser; it’s slower, so it runs on its own (`npm run a11y`) and as its own CI job.

### Feature or motif?

A direction can add anything that only changes how the shared content looks: ornament, illustration, animation, flavor copy in its own voice, its own labels, another presentation of the same items (a ticker of the same posts, a table and a grid of the same work). That’s a motif, and it stays in the direction’s folder.

Anything that changes what the site _has_ is a feature: a page section, a control (search, a filter, a sign-up), a link to a page the navigation doesn’t lead to, a fact, a count. Features are shared, so they go in this order:

1. The shared layers: the content model, `site/ia.ts`, `site/forms.ts`, or a helper in `site/`; and a requirement in `conformance/requirements.ts` (a foundation in `foundations.ts`).
2. Wireframe, plainly. Wireframe must meet every requirement.
3. Every other direction. `npm run lab:check` lists the ones that don’t have it yet.

When a direction has something the others don’t, either it’s a motif, or it’s a feature the others are missing: make it shared, or take it out.

## Accessibility

Every direction is held to **WCAG 2.2 AAA**, the live one first. Four tools hold them to it, from quickest to most thorough:

| Tool | Run | Checks |
| --- | --- | --- |
| Contrast calculator | `npm run a11y:contrast -- "#6b6b6b" "#fff"` | Any two CSS colors: the ratio, and whether it’s enough for body text (7:1), large text (4.5:1), and borders, icons, and focus rings (3:1). `-- <slug>` measures a direction’s role pairs in both schemes, `--all` every color token on its paper and surface. |
| Lint | `npm run lint` | The markup in every `.tsx` file ([jsx-a11y](https://github.com/es-tooling/eslint-plugin-jsx-a11y-x), strict): names, roles, labels, alt text, keyboard handlers. A deliberate exception is disabled on its line, with the reason above it. |
| Token contrast | `npm run lab:check` | The `css.contrast` foundation: the role tokens against each other, before anything renders. |
| Browser audit | `npm run a11y` (`-- -g Gridline` for one direction) | Every checked page (`conformance/pages.ts`) of every direction, light and dark, on a desktop and a 320px-wide phone, in Chromium: every axe rule for WCAG 2.0–2.2 at A, AA, and AAA (contrast at 7:1, link purpose, names, structure…), plus `accessibility/checks.ts` for what axe doesn’t measure: 44px targets (2.5.5), line spacing of 1.5, lines of 80 characters or fewer, and no justified text (1.4.8), reflow at 320px (1.4.10), and, tabbing through every page, a focus ring of 2px at 3:1 (2.4.13) that nothing fixed or sticky covers (2.4.12). |

The audit starts a dev server of its own (port 4343), so it always audits this checkout; `A11Y_URL=<url> npm run a11y` audits a running one, or a deploy preview, instead. It takes a few minutes for every direction, a minute or two for one. A failure names each element that falls short, what it measured, and on which pages, schemes, and widths; `test-results/a11y-findings/<slug>.json` has every finding, the known gaps’ included, and what axe couldn’t decide on (`review`: contrast over an image, say), and `npm run a11y:report` opens the last run.

**Known gaps** (`accessibility/gaps.ts`) work like the conformance checks’ ones: what each direction fell short of when the audit was first run, by check. It only shrinks. The audit fails when a direction falls short of anything not listed, and when it meets something listed, so the line comes off. To close one, delete its line and run `npm run a11y -- -g <Name>`; the failure lists every element, page by page. Never add a line to make the audit pass.

### Making a design change

1. Before a color goes in, measure it with `npm run a11y:contrast` against everything it sits on, in both schemes, including its hover, active, and visited states (the audit only sees the page at rest).
2. Run `npm run lab:check`, then `npm run a11y -- -g <Name>`. Fix what they name; don’t loosen a check or add a gap.
3. Check by hand what no tool can:
   - Hover and focus states, and anything drawn over an image, a gradient, or a pseudo-element’s fill: its contrast, focus rings included (axe lists such text under `review`; the focus check measures a ring against the nearest flat background color only).
   - Motion that starts on its own (WCAG 2.2.2): it stops within 5 seconds, or can be paused, or lives in something the visitor opened and can close (the weather popover).
   - Content that appears on hover or focus (tooltips, popovers): it can be dismissed with Escape, hovered over, and stays until then (1.4.13).
   - Flashing: nothing flashes more than three times a second (2.3.2).
   - At 200% text size, and with WCAG’s text spacing (1.4.12), nothing is cut off or overlaps.
   - With a screen reader (VoiceOver: ⌘F5), the page reads in order, and every control says what it is and does.
   - Copy: headings that say what’s under them (2.4.10), abbreviations spelled out (3.1.4), and plain language (3.1.5).

## Taking a direction live

The site is one direction rendered at its root. `live.ts` names it (Gridline, since 2026-10-18), and `app/routes/page.tsx` renders every page with it: the loader resolves the path to a `View` as the lab route does, the shared `LabContent` comes with nothing rebased (`base=""`), and `meta` comes from the page’s own model. Directions don’t know which of them is live: `useTo()` builds root-relative links, and `useSubmission()` tells a form to send for real rather than hold the submit (`useIsLive()`). The lab keeps mocking up the live direction at `/lab/<slug>/` beside the others.

To launch another direction, point `live.ts` at its folder. Nothing else changes, because `npm run lab:check` has held it to the same features, pages, and foundations all along; look it over on the style guide’s Conformance page first. The old `app/components/` and `app/styles/` of the site before the lab are gone, so there’s no other look to fall back to.
