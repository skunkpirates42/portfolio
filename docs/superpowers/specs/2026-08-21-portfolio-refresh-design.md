# Portfolio Refresh — Design

Date: 2026-08-21
Repo: github.com/skunkpirates42/portfolio
Live: https://www.peterramos.dev (Netlify)

## Problem

The site was last committed 2021-11-10. It presents Peter as a bootcamp-era
"Full Stack Developer" and shows three student projects. Two of those projects
are dead links (Tip Tracks 360 returns 404 after Heroku killed free dynos;
Portuguese Palavras fails to connect). The embedded resume is a Cloudinary-hosted
PNG screenshot from 2021 that stops at "Recharge Payments, Feb 2021 - Present".

Roughly five years of career is missing from the site, and the work that is
shown is student work. The resume link has been removed from the actual resume
until this is fixed.

## Goal

A site that can sit next to GitHub and LinkedIn on the resume of a senior
engineer running an active job hunt.

Primary audience: recruiters and hiring managers, skimming for under a minute,
usually with the resume already open.

### Success criteria

- Seniority is legible within 3 seconds of load.
- Concrete impact numbers are visible without scrolling past the first screen.
- Resume PDF reachable in one click from the top of the page.
- Zero dead links.
- Peter puts the peterramos.dev link back on his resume.

### Non-goals

- Blog, CMS, newsletter, analytics dashboard.
- A new flagship side project built to showcase.
- Rewriting or re-designing the resume PDF itself. It is current (2026-08-19)
  and well written. It is the input, not the output.

## Content source of truth

`~/Downloads/Peter Ramos Resume 8:26.pdf`, dated 2026-08-19. Where this spec and
the resume disagree, the resume wins.

Positioning: Senior Full-Stack Engineer. 7+ years building product-facing
features at scale. 5+ years in a remote distributed org at Recharge, the Shopify
subscription platform behind $42B GMV, 20,000 brands, 100M subscribers. Early
adopter of agentic engineering workflows: spec-driven, context-aware, focused on
clean maintainable output.

Experience:

| Role | Company | Dates |
|---|---|---|
| Senior Frontend Software Engineer | Recharge (remote) | May 2023 - Aug 2026 |
| Senior Full-Stack Software Engineer | Stay.AI (remote) | Nov 2022 - May 2023 |
| Frontend Software Engineer | Recharge (remote) | Feb 2021 - Oct 2022 |
| Software Developer | Covetrus (Portland ME / remote) | Apr 2019 - Feb 2021 |

Education: 2012 B.Sc Jazz Studies, SUNY New Paltz.

Skills: React, Remix, Vue, TypeScript, ES6, Node.js, Express, HTML5, CSS3,
Vercel, Docker, GraphQL, MongoDB, MySQL, PostgreSQL, Snowflake, Git, Claude,
Cursor, MCP, coding agents.

## Architecture

Astro + TypeScript + Tailwind. Static output. Stays on Netlify (no hosting
migration, no DNS change).

Astro ships zero JS by default, which is the relevant flex for a frontend
specialist being evaluated on craft. React islands are used only where
interaction earns them. Case studies are MDX so that adding a fourth is a file,
not a refactor.

    src/
      pages/index.astro          single page, anchored sections
      components/                Astro components, presentational only
      content/case-studies/      MDX, one file per case study
      content/timeline.ts        story chapters as data
      styles/tokens.css          color + type scale as custom properties
      layouts/

Business logic and content stay out of components. Timeline chapters and case
study frontmatter are plain data; components take props and render.

## Page structure

Single page, anchored nav, ordered by what a skimming reviewer needs first.

1. **Hero** — Name, "Senior Full-Stack Engineer", 7+ years, one line of
   positioning. Resume / GitHub / LinkedIn / email. Availability is explicit and
   prominent: "Available for senior frontend / full-stack roles." Deliberate
   choice for an active hunt; revisit once a role is signed.
2. **Impact strip** — 3-4 hard numbers pulled from the resume: 20,000+ merchants,
   $42B GMV platform, 100M subscribers, 7+ years. Not decorative; this is the
   section that answers "is this person senior".
3. **Case study: Recharge merchant analytics** — the headline. Problem,
   constraints, architecture across two generations (canned reports with
   pre-selected metrics and dimensions, then fully customizable reports),
   collaboration with backend and data engineers, outcome.
4. **Case study: Stay.AI customer portal** — led architectural design and
   development of the rebuild. React, Zustand, Material UI, Node, Express,
   Redis, PostgreSQL, Twilio.
5. **Agentic engineering** — its own section, not a skills bullet. Spec-driven
   workflow, how it changes what ships. Deliberately prominent: this is a
   current differentiator and was specifically called out as such by a former
   manager reviewing the resume.
6. **The story** — animated timeline, five chapters. See below.
7. **Selected work** — three entries, framed as recent side work rather than
   portfolio pieces. Links go to specific repos, never to the GitHub profile
   root. See "Side projects" below.
8. **Contact** — available now, resume PDF, email, GitHub, LinkedIn.

## The story section

Five chapters, one continuous vertical spine:

1. 2012 — B.Sc Jazz Studies, SUNY New Paltz. Senior project: picked the
   musicians, led rehearsals and promotion, played an hour-long set live.
2. 2013-2017, Colorado — moved out to ski and mountain bike. Managed the
   kitchen at a pizza / bar and grill while there. One chapter, not two.
3. 2018 — Learned to code. Thinkful engineering immersion, Nov 2018.
4. 2019 — Covetrus intern, converted to full-time after six weeks.
5. 2021-2026 — Recharge, Stay.AI, senior.

Mechanics: each chapter's content slides in as it enters the viewport, driven by
CSS `animation-timeline: view()`. No scroll-jacking; the page scrolls normally.
IntersectionObserver only as fallback where scroll-driven animations are
unsupported.

Degradation is mandatory, not optional: with no JS, or under
`prefers-reduced-motion: reduce`, the section renders as a clean static timeline
with all content present. The animation is additive.

Markup is authored so that a later upgrade to full-viewport cinematic chapters
changes the animation layer only, not the DOM. That upgrade is explicitly out of
scope for this build.

## Theming

Light and dark, both first-class. Palette defined once as CSS custom properties
in `tokens.css`; Tailwind consumes the tokens.

- Defaults to `prefers-color-scheme`, with a manual toggle that overrides and
  persists to `localStorage`.
- Inline head script applies the stored choice before first paint to avoid a
  flash of the wrong theme.
- Every color has a definition in the base light palette. Dark redefines tokens
  only.

### Case study image framing

The Recharge marketing screenshots have mismatched backgrounds — one periwinkle,
one near-white, one black-on-grid. Bleeding them to the page background looks
broken in at least one theme.

All case study images render inside a consistent surface card: neutral
background, subtle border, padding, rounded corners. Images are never
CSS-inverted or hue-shifted — that would misrepresent a real product's UI.

## Assets and the NDA boundary

Peter's strongest work is proprietary. The rule for this build:

- **Allowed:** screenshots and imagery from public marketing pages of products
  he worked on (getrecharge.com, stay.ai).
- **Not allowed:** internal application screenshots, anything containing real
  merchant or customer data, internal metrics not published publicly, and any
  architecture detail not inferable from the public product.

Confirmed available (already captured, public Recharge marketing):

1. Recurring-revenue dashboard — "Subscription recurring $469,245.83" with
   Items / Orders / Avg Sales tiles and an "Activity over time" stacked bar
   chart.
2. Churn benchmarking chart — "Your store" against 25th / median / 75th
   percentile, with an open drill-down tooltip.
3. Custom report view — "Subscription checkout order items", report controls bar
   (date range, compare-to, monthly, grouping) and a "Grouping: By Product"
   callout. Best of the three: it directly illustrates the customizable reports
   product he was primary frontend engineer on.

Still needed: one Stay.AI customer portal image from stay.ai marketing.

## Side projects

Three entries, in descending order of evidentiary weight.

**stock-signal** — rule-based intraday trading signal engine in Python. Six
indicator votes with consensus thresholding, backtest replaying real Alpaca IEX
bars through the identical engine and exit logic as live, Flask dashboard,
SQLite persistence, nine test modules.

The centerpiece is the field report, not the repo: it documents a thin but real
gross edge, a conviction-threshold sweep that *failed* and why (the votes are
collinear), and an orthogonal relative-strength gate that clears the cost line.
It labels the result "a strong lead, not yet a validated result" and carries an
explicit not-investment-advice disclaimer.

This is the section's strongest asset. Disproving your own hypothesis in writing
and refusing to overclaim reads as engineering judgment, which is harder to
demonstrate than a feature list.

Currently local-only — not pushed to GitHub. Publishing it is a task in the
implementation plan. Pre-push check already done: `.gitignore` covers `.env` and
`*.db`, no secrets or database files tracked, config reads from environment.
A full staged-content review still runs before the first push.

**airbnb-research** — pnpm monorepo: Next.js 15 with Prisma/SQLite, a shared
types package, and an MV3 Chrome extension built with Vite. Captures listing and
review data, then runs Claude analysis asynchronously with the web UI polling for
completion.

Presented as a written description with **no repo link, repository stays
private**. It works by intercepting Airbnb's internal GraphQL API to capture
their rotating persisted-query hash — technically the sharper piece of
engineering, but publishing a scraper alongside a job application carries ToS and
perception risk that outweighs the marginal credit. The architecture and the
interceptor technique can be described in full without shipping the source.

**wc-predictions** — public already, most recent public repo (Jul 2026).
Lightest of the three; included because it is verifiable in one click.

All images served locally from `public/`, not hotlinked. Cloudinary dependency
is removed entirely.

## Content removals

- All three bootcamp projects (War of the Games, Tip Tracks 360, Portuguese
  Palavras). Two are dead links and all three undercut the senior claim.
- The Cloudinary-hosted resume PNG. Resume content becomes real HTML —
  indexable, accessible, responsive — with the PDF as a download.
- FontAwesome CDN and the two Google Fonts CDN links. Icons inline as SVG, fonts
  self-hosted or reduced to a system stack.
- 2019-era meta tags. Title, description, OG and Twitter cards all rewritten;
  new OG image generated.

## Accessibility and performance

- Lighthouse: 100 accessibility, 100 SEO, performance 95+ on mobile throttling.
- Keyboard reachable throughout; visible focus states in both themes.
- Contrast meets WCAG AA in both themes.
- `prefers-reduced-motion` honored everywhere, not just the timeline.
- Semantic landmarks and one `h1`.
- All images have real alt text describing the product surface shown.

## Open questions

1. Stay.AI portal image not yet captured. To be pulled from stay.ai marketing
   during implementation.

Resolved since first draft: Colorado years (2013-2017), side project selection
and publication strategy (see "Side projects"), and hero availability wording
(explicit and prominent). No blockers remain.

## Follow-up, tracked separately

Verify whether `airbnb-research`'s data collection actually conflicts with
Airbnb's current Terms of Service, and if so whether a compliant version is
possible via their official API or a partner program. If no compliant path
exists, the tool stays personal-use-only and the site describes it without
linking source — which is what this build does regardless. This investigation
does not gate the portfolio work.

## Out of scope

- Archiving the 2018-19 Thinkful repos on GitHub. Worth doing — a reviewer
  landing on the profile root currently sees `peter-node-shopping-list-v2` — but
  it is a GitHub account change, not a site change.
- Making `airbnb-research` public. Explicitly decided against; see "Side
  projects".
- Cinematic scroll upgrade for the story section.
- Any change to the resume PDF.
