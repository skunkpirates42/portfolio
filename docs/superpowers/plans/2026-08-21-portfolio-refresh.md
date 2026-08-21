# Portfolio Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 2021 vanilla-HTML portfolio at peterramos.dev with an Astro site that presents Peter Ramos as the senior full-stack engineer he currently is, built for recruiters skimming during an active job hunt.

**Architecture:** Astro 7 static site, single page with anchored sections, deployed to the existing Netlify site. Content lives as data and MDX, not markup: case studies are a content collection, story chapters are a typed array. Components are presentational and take props. Tailwind 4 via the Vite plugin, with a CSS custom property token layer so light and dark themes are one source of truth. React is not installed — nothing on this page needs it, and Astro's zero-JS default is the point.

**Tech Stack:** Astro 7, TypeScript, Tailwind CSS 4 (`@tailwindcss/vite`), MDX, Vitest, pnpm 10, Node 25, Netlify.

**Spec:** `docs/superpowers/specs/2026-08-21-portfolio-refresh-design.md`

## Global Constraints

- Package manager is **pnpm** (10.33.0 installed). Never npm or yarn.
- Node 25.9.0 installed. Installed stack is Astro 7.2.4, @astrojs/mdx 7.0.7, tailwindcss + @tailwindcss/vite 4.3.3 (verified in Task 1, not assumed).
- Branch is `redesign/2026-refresh`. Never commit to `master`. Never push without being asked.
- **Content source of truth is the resume** at `~/Downloads/Peter Ramos Resume 8:26.pdf` (2026-08-19). Where this plan and the resume disagree, the resume wins. Never invent an achievement, metric, employer, or date that is not on it.
- Job titles verbatim: "Senior Frontend Software Engineer" (Recharge, May 2023 - Aug 2026), "Senior Full-Stack Software Engineer" (Stay.AI, Nov 2022 - May 2023), "Frontend Software Engineer" (Recharge, Feb 2021 - Oct 2022), "Software Developer" (Covetrus, Apr 2019 - Feb 2021).
- Metrics verbatim, and only these: 7+ years experience; 5+ years remote/distributed at Recharge; $42B GMV; 20,000 brands / 20,000+ merchants; 100M subscribers; 100,000+ veterinary customers (Covetrus).
- **Image policy:** only imagery from public marketing pages of products Peter worked on. Never internal app screenshots, never real customer or merchant data. Images are served from `public/`, never hotlinked. Never CSS-invert or hue-shift a product screenshot.
- **No link may 404.** Every external link is verified in Task 15.
- Every color is defined in the base light palette; dark redefines tokens only. No color's sole definition lives in a media query.
- `prefers-reduced-motion: reduce` disables all motion, everywhere.
- Accessibility: WCAG AA contrast in both themes, one `h1`, semantic landmarks, visible focus states, real alt text on every image.
- No emojis anywhere in site copy.
- **No web fonts.** The old site loaded Nunito Sans and Roboto Slab from Google Fonts and all of FontAwesome from a CDN. The rebuild uses Tailwind's default system font stacks and inline SVG for any icon. This is both a privacy and a performance decision, and it is what makes the Task 15 performance target reachable.
- Do not modify the resume PDF. Do not touch `airbnb-research` or make it public.

## Testing strategy

This is a static content site, so be honest about what deserves a unit test. Three things carry real logic and get TDD: theme resolution, the content collection schema, and story timeline data integrity. Everything else is markup, and markup is verified by the build plus the automated audit in Task 15 (link check, axe, Lighthouse) — not by asserting that a heading exists.

Do not write unit tests that assert markup structure. They cost more than they catch.

## File structure

```
astro.config.mjs              Astro + Tailwind vite plugin + MDX
netlify.toml                  build command + publish dir (NEW - site had no build step)
tsconfig.json
package.json
src/
  content.config.ts           case-studies collection schema
  pages/index.astro           the single page, composes sections in skim order
  layouts/BaseLayout.astro    html shell, meta, theme script, nav, footer
  components/
    ThemeToggle.astro         button + inline script
    Nav.astro
    Hero.astro
    ImpactStrip.astro
    CaseStudy.astro           renders one collection entry
    ImageFrame.astro          consistent surface card for product screenshots
    AgenticSection.astro
    StoryTimeline.astro       renders chapters from data
    SelectedWork.astro
    ResumeSection.astro
    Contact.astro
    Footer.astro
  content/case-studies/
    recharge-analytics.mdx
    stay-ai-portal.mdx
  data/
    timeline.ts               story chapters, typed
    projects.ts               selected work entries, typed
    experience.ts             resume roles, typed
  lib/
    theme.ts                  resolveTheme() - pure, tested
  styles/
    global.css                @import tailwindcss + @theme tokens
public/
  images/case-studies/        local copies of marketing screenshots
  resume/peter-ramos-resume.pdf
  og.png
tests/
  theme.test.ts
  timeline.test.ts
  content.test.ts
```

---

### Task 1: Scaffold Astro and remove the 2021 site

Replaces the old static site wholesale. At the end of this task the site builds and deploys a near-empty page — that is intentional; it proves the Netlify pipeline works before any content depends on it.

**Files:**
- Create: `astro.config.mjs`, `netlify.toml`, `src/pages/index.astro`, `src/styles/global.css`, `.gitignore` (replace)
- Delete: `index.html`, `index.css`, `normalize.css`, `index.js`, `package-lock.json`
- Modify: `package.json` (replaced by scaffold)
- Preserve: `assets/resume-min.pdf` (moved in Task 13), `README.md`, `docs/`

**Interfaces:**
- Consumes: nothing
- Produces: a working `pnpm build` emitting `dist/`; `src/styles/global.css` importing Tailwind, which every later task's classes depend on.

- [ ] **Step 1: Confirm you are on the right branch**

```bash
cd /Users/peterr/dev/portfolio
git branch --show-current
```

Expected: `redesign/2026-refresh`. If not, stop and switch. Do not proceed on `master`.

- [ ] **Step 2: Save the resume PDF out of the way before deleting anything**

```bash
mkdir -p public/resume
git mv assets/resume-min.pdf public/resume/peter-ramos-resume.pdf
```

- [ ] **Step 3: Remove the old site files**

These are the 2021 vanilla site. The screenshots go too — two of the three projects they depict are dead links and all three are being removed per the spec.

```bash
git rm -r index.html index.css normalize.css index.js package-lock.json package.json assets/screenshots
git rm assets/favicon/favicon.ico
```

- [ ] **Step 4: Scaffold Astro into the existing directory**

Answer the prompts: "Empty" template, TypeScript "Strict", install dependencies **yes**, initialize git repository **no** (this is already a repo).

The directory is not empty — it still holds `.git`, `docs/`, `README.md` and `public/resume/`. Astro will warn about this and ask whether to continue. Continue. If it refuses outright, scaffold into a temporary directory and copy `src/`, `astro.config.mjs`, `package.json` and `tsconfig.json` across, leaving the preserved files untouched.

```bash
pnpm create astro@latest . -- --template minimal --typescript strict --install --no-git
```

- [ ] **Step 5: Add Tailwind 4**

`@astrojs/tailwind` is deprecated. This installs the Tailwind Vite plugin, which is the current supported path.

```bash
pnpm astro add tailwind --yes
pnpm astro add mdx --yes
```

- [ ] **Step 6: Verify the Tailwind import landed in global.css**

```bash
cat src/styles/global.css
```

Expected: contains `@import "tailwindcss";`. If the file does not exist, create it with exactly that line.

- [ ] **Step 7: Write the placeholder page**

```astro
---
import "../styles/global.css";
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Peter Ramos</title>
  </head>
  <body>
    <h1 class="text-3xl font-bold">Peter Ramos</h1>
  </body>
</html>
```

- [ ] **Step 8: Add the Netlify build config**

The old site had no build step — Netlify published the repo root as-is. Astro needs a build, so this file is required or the deploy will serve the raw source.

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```

- [ ] **Step 9: Build and verify**

```bash
pnpm build && ls dist/index.html
```

Expected: build completes with no errors, `dist/index.html` exists.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Replace 2021 static site with Astro scaffold

The previous site was hand-written HTML/CSS/JS last touched in Nov 2021,
published by Netlify straight from the repo root. Astro needs a build step,
so netlify.toml now sets the build command and publish directory.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 2: Theme tokens and light/dark switching

The one piece of this site with real branching logic, so it gets real tests.

**Files:**
- Create: `src/lib/theme.ts`, `tests/theme.test.ts`, `src/components/ThemeToggle.astro`
- Modify: `src/styles/global.css`, `package.json` (vitest)

**Interfaces:**
- Consumes: `src/styles/global.css` from Task 1
- Produces: `resolveTheme(stored: string | null, prefersDark: boolean): "light" | "dark"` from `src/lib/theme.ts`. CSS custom properties consumed by every later component: `--ground`, `--surface`, `--surface-2`, `--line`, `--ink`, `--muted`, `--faint`, `--accent`, `--accent-soft`. Tailwind utility names `bg-ground`, `bg-surface`, `text-ink`, `text-muted`, `text-faint`, `border-line`, `text-accent`.

- [ ] **Step 1: Install Vitest**

Buys real tests for theme resolution, content schema (Task 6) and timeline integrity (Task 10). Dev-only.

```bash
pnpm add -D vitest
```

- [ ] **Step 2: Add the test script to package.json**

Add to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 3: Write the failing test**

Create `tests/theme.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { resolveTheme } from "../src/lib/theme";

describe("resolveTheme", () => {
  it("honors an explicit stored choice over the system preference", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("falls back to the system preference when nothing is stored", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
  });

  it("ignores a stored value that is not a valid theme", () => {
    expect(resolveTheme("banana", true)).toBe("dark");
    expect(resolveTheme("", false)).toBe("light");
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm test`
Expected: FAIL — cannot resolve `../src/lib/theme`.

- [ ] **Step 5: Write the implementation**

Create `src/lib/theme.ts`:

```typescript
export type Theme = "light" | "dark";

export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === "light" || stored === "dark") return stored;
  return prefersDark ? "dark" : "light";
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm test`
Expected: PASS, 3 tests.

- [ ] **Step 7: Define the token palette**

Replace `src/styles/global.css`. Both palettes are complete; dark redefines the same names. `@theme inline` maps tokens to Tailwind utilities.

```css
@import "tailwindcss";

:root {
  --ground: #FBFAF8;
  --surface: #FFFFFF;
  --surface-2: #F1F0EC;
  --line: #E0DED7;
  --ink: #17181A;
  --muted: #5A5D63;
  --faint: #62666E;
  --accent: #6F4FCC;
  --accent-soft: #9B80E3;
  --accent-bg: rgba(111, 79, 204, 0.10);
}

:root[data-theme="dark"] {
  --ground: #0F1114;
  --surface: #171A1F;
  --surface-2: #1E222A;
  --line: #2B303A;
  --ink: #E8EAEE;
  --muted: #9AA1AC;
  --faint: #8E96A2;
  --accent: #A78BFA;
  --accent-soft: #C4B5FD;
  --accent-bg: rgba(167, 139, 250, 0.12);
}

@theme inline {
  --color-ground: var(--ground);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-line: var(--line);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-faint: var(--faint);
  --color-accent: var(--accent);
  --color-accent-soft: var(--accent-soft);
}

html {
  color-scheme: light dark;
  scroll-behavior: smooth;
}

body {
  background: var(--ground);
  color: var(--ink);
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 8: Build the theme toggle**

Create `src/components/ThemeToggle.astro`. The inline script is duplicated logic from `theme.ts` on purpose — it must run before first paint and cannot wait for a module import, which is what prevents the flash of wrong theme.

```astro
<button
  id="theme-toggle"
  type="button"
  class="rounded-md border border-line bg-surface px-3 py-2 text-sm text-muted hover:text-ink"
  aria-label="Toggle color theme"
>
  <span aria-hidden="true" data-theme-icon></span>
</button>

<script>
  const button = document.getElementById("theme-toggle");
  const icon = button?.querySelector("[data-theme-icon]");

  const paint = (theme: string) => {
    document.documentElement.dataset.theme = theme;
    if (icon) icon.textContent = theme === "dark" ? "Light" : "Dark";
  };

  paint(document.documentElement.dataset.theme ?? "light");

  button?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("theme", next);
    } catch {}
    paint(next);
  });
</script>
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Add theme tokens and light/dark switching

Palette is defined once as custom properties and mapped into Tailwind, so
both themes stay a single source of truth. resolveTheme is unit tested;
the pre-paint inline script duplicates it deliberately to avoid a flash of
the wrong theme.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 3: Base layout, metadata, nav and footer

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `ThemeToggle.astro` and the token classes from Task 2
- Produces: `BaseLayout` accepting props `{ title: string; description: string }` and a default slot. Every later section renders inside it. Section anchor ids that `Nav` links to: `#work`, `#agentic`, `#story`, `#resume`, `#contact`.

- [ ] **Step 1: Write the layout**

Create `src/layouts/BaseLayout.astro`. The no-flash script runs before body paint and mirrors `resolveTheme`.

```astro
---
import "../styles/global.css";
import Nav from "../components/Nav.astro";
import Footer from "../components/Footer.astro";

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site ?? "https://www.peterramos.dev");
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical.href} />

    <meta property="og:type" content="website" />
    <meta property="og:url" content={canonical.href} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={new URL("/og.png", canonical).href} />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={new URL("/og.png", canonical).href} />

    <script is:inline>
      (() => {
        let stored = null;
        try { stored = localStorage.getItem("theme"); } catch {}
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const theme = stored === "light" || stored === "dark" ? stored : prefersDark ? "dark" : "light";
        document.documentElement.dataset.theme = theme;
      })();
    </script>
  </head>
  <body class="bg-ground text-ink antialiased">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2"
    >
      Skip to content
    </a>
    <Nav />
    <main id="main">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Write the nav**

Create `src/components/Nav.astro`:

```astro
---
import ThemeToggle from "./ThemeToggle.astro";

const links = [
  { href: "#work", label: "Work" },
  { href: "#agentic", label: "Agentic" },
  { href: "#story", label: "Story" },
  { href: "#resume", label: "Resume" },
  { href: "#contact", label: "Contact" },
];
---

<header class="sticky top-0 z-40 border-b border-line bg-ground/85 backdrop-blur">
  <nav class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4" aria-label="Primary">
    <a href="#main" class="font-semibold tracking-tight">Peter Ramos</a>
    <div class="flex items-center gap-1">
      <ul class="hidden items-center gap-1 sm:flex">
        {links.map((link) => (
          <li>
            <a
              href={link.href}
              class="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <ThemeToggle />
    </div>
  </nav>
</header>
```

- [ ] **Step 3: Write the footer**

Create `src/components/Footer.astro`:

```astro
---
const year = new Date().getFullYear();
---

<footer class="border-t border-line">
  <div class="mx-auto max-w-5xl px-6 py-10 text-sm text-faint">
    <p>&#169; {year} Peter Ramos</p>
  </div>
</footer>
```

- [ ] **Step 4: Wire the page to the layout**

Replace `src/pages/index.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout
  title="Peter Ramos - Senior Full-Stack Engineer"
  description="Senior full-stack engineer with 7+ years building product-facing features at scale. Led frontend for Recharge's merchant analytics platform."
>
  <p class="mx-auto max-w-5xl px-6 py-20">Sections land here.</p>
</BaseLayout>
```

- [ ] **Step 5: Add the site URL to the Astro config**

In `astro.config.mjs`, add `site: "https://www.peterramos.dev"` to the config object. Canonical and OG URLs depend on it.

- [ ] **Step 6: Verify the build and check the theme script shipped**

```bash
pnpm build && grep -c "prefers-color-scheme" dist/index.html
```

Expected: build succeeds; grep returns at least `1` (the inline pre-paint script is present, not deferred).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add base layout, nav and footer

Metadata replaces the 2019-era tags that described Peter as a full stack
developer with a bootcamp-era portfolio.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 4: Hero

The first three seconds. Seniority, positioning, availability, and the four links a recruiter needs.

**Files:**
- Create: `src/components/Hero.astro`, `src/data/links.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `BaseLayout` from Task 3
- Produces: `src/data/links.ts` exporting `contactLinks: { label: string; href: string }[]`, reused by `Contact.astro` in Task 14.

- [ ] **Step 1: Create the shared links data**

Create `src/data/links.ts`. These exact URLs are from the resume — do not alter them.

```typescript
export interface ContactLink {
  label: string;
  href: string;
}

export const contactLinks: ContactLink[] = [
  { label: "Resume (PDF)", href: "/resume/peter-ramos-resume.pdf" },
  { label: "GitHub", href: "https://github.com/skunkpirates42" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/peterramos2/" },
  { label: "Email", href: "mailto:peterdramos02@gmail.com" },
];
```

- [ ] **Step 2: Write the hero**

Create `src/components/Hero.astro`. Availability is explicit and prominent per the spec — a deliberate choice for an active hunt.

```astro
---
import { contactLinks } from "../data/links";
---

<section class="mx-auto max-w-5xl px-6 pb-16 pt-20 sm:pt-28">
  <p
    class="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm text-muted"
  >
    <span class="h-2 w-2 rounded-full bg-accent" aria-hidden="true"></span>
    Available for senior frontend and full-stack roles
  </p>

  <h1 class="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl">
    Peter Ramos
  </h1>
  <p class="mt-3 text-xl text-accent sm:text-2xl">Senior Full-Stack Engineer</p>

  <p class="mt-6 max-w-2xl text-lg leading-relaxed text-muted text-pretty">
    Seven years building product-facing features at scale. Most recently I led frontend
    for the merchant analytics platform at Recharge, the Shopify subscription platform
    behind $42B in GMV, 20,000 brands and 100M subscribers.
  </p>

  <ul class="mt-8 flex flex-wrap gap-3">
    {
      contactLinks.map((link) => (
        <li>
          <a
            href={link.href}
            class="inline-block rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            {link.label}
          </a>
        </li>
      ))
    }
  </ul>
</section>
```

- [ ] **Step 3: Render it**

In `src/pages/index.astro`, import `Hero` and replace the placeholder paragraph with `<Hero />`.

- [ ] **Step 4: Verify**

```bash
pnpm build && grep -q "Available for senior frontend" dist/index.html && echo "hero rendered"
```

Expected: `hero rendered`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add hero with explicit availability

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 5: Impact strip

Four numbers, above the fold. This is the section that answers "is this person senior" before anyone reads a paragraph.

**Files:**
- Create: `src/components/ImpactStrip.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: token classes from Task 2
- Produces: nothing consumed downstream

- [ ] **Step 1: Write the component**

Create `src/components/ImpactStrip.astro`. Every figure traces to the resume; do not add a fifth.

```astro
---
const stats = [
  { figure: "7+ years", detail: "building product-facing features at scale" },
  { figure: "20,000+", detail: "merchants reached by the analytics surfaces I led" },
  { figure: "$42B", detail: "GMV flowing through the platform" },
  { figure: "5+ years", detail: "in a remote, distributed engineering org" },
];
---

<section class="mx-auto max-w-5xl px-6 pb-20">
  <dl
    class="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
  >
    {
      stats.map((stat) => (
        <div class="flex flex-col gap-2 bg-surface p-6">
          <dt class="text-3xl font-semibold tracking-tight tabular-nums">{stat.figure}</dt>
          <dd class="text-sm leading-relaxed text-muted">{stat.detail}</dd>
        </div>
      ))
    }
  </dl>
</section>
```

- [ ] **Step 2: Render it**

In `src/pages/index.astro`, import `ImpactStrip` and place it directly after `<Hero />`.

- [ ] **Step 3: Verify**

```bash
pnpm build && grep -q "42B" dist/index.html && echo "impact rendered"
```

Expected: `impact rendered`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add impact strip

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 6: Case study infrastructure

The content collection, the image frame, and the local copies of the marketing screenshots. No case study copy yet — that is Tasks 7 and 8.

**Files:**
- Create: `src/content.config.ts`, `src/components/ImageFrame.astro`, `src/components/CaseStudy.astro`, `tests/content.test.ts`
- Create: `public/images/case-studies/*.png`

**Interfaces:**
- Consumes: token classes from Task 2
- Produces:
  - Collection `case-studies` with schema `{ title: string; role: string; period: string; summary: string; stack: string[]; order: number }`
  - `ImageFrame.astro` props `{ src: string; alt: string; caption?: string }`
  - `CaseStudy.astro` props `{ entry: CollectionEntry<"case-studies"> }`

- [ ] **Step 1: Copy the marketing screenshots into the repo**

These are public Recharge marketing assets. Verified paths:

```bash
mkdir -p public/images/case-studies
cp "/Users/peterr/Desktop/Screenshot 2026-08-21 at 12.14.05 PM.png" public/images/case-studies/recharge-dashboard.png
cp "/Users/peterr/Desktop/Screenshot 2026-08-21 at 12.14.23 PM.png" public/images/case-studies/recharge-churn-benchmark.png
cp "/Users/peterr/Desktop/Screenshot 2026-08-19 at 6.48.40 PM.png" public/images/case-studies/recharge-custom-report.png
ls -la public/images/case-studies/
```

Expected: three PNG files present.

- [ ] **Step 2: Capture the Stay.AI portal image**

Open `https://www.stay.ai/` and find a marketing image of the customer portal. Save it as `public/images/case-studies/stay-ai-portal.png`.

If no usable portal image exists on their marketing site, do not substitute anything else and do not use an internal screenshot. Instead, set `image: undefined` in the Stay.AI MDX frontmatter in Task 8 — that case study renders text-only. Note the outcome in the commit message.

- [ ] **Step 3: Write the failing schema test**

Create `tests/content.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/content/case-studies";
const REQUIRED = ["title", "role", "period", "summary", "stack", "order"];

describe("case study frontmatter", () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".mdx"));

  it("has at least two case studies", () => {
    expect(files.length).toBeGreaterThanOrEqual(2);
  });

  it.each(files)("%s declares every required field", (file) => {
    const raw = readFileSync(join(DIR, file), "utf8");
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    expect(match).not.toBeNull();
    const frontmatter = match![1];
    for (const key of REQUIRED) {
      expect(frontmatter).toContain(`${key}:`);
    }
  });
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm test`
Expected: FAIL — `ENOENT: no such file or directory, scandir 'src/content/case-studies'`.

- [ ] **Step 5: Create the collection config**

Create `src/content.config.ts`:

```typescript
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/case-studies" }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    period: z.string(),
    summary: z.string(),
    stack: z.array(z.string()),
    order: z.number(),
  }),
});

export const collections = { "case-studies": caseStudies };
```

- [ ] **Step 6: Create the directory and a stub entry so the test can pass**

Create `src/content/case-studies/recharge-analytics.mdx` with frontmatter only for now; Task 7 writes the body.

```mdx
---
title: "Merchant analytics platform"
role: "Senior Frontend Software Engineer"
period: "May 2023 - Aug 2026"
summary: "Dashboards and drill-down reports surfacing business metrics previously unavailable to 20,000+ merchants."
stack: ["Vue", "TypeScript", "Nuxt", "GraphQL", "Snowflake"]
order: 1
---

Body written in Task 7.
```

Create `src/content/case-studies/stay-ai-portal.mdx`:

```mdx
---
title: "Customer portal rebuild"
role: "Senior Full-Stack Software Engineer"
period: "Nov 2022 - May 2023"
summary: "Led architectural design and development of the subscriber-facing customer portal rebuild."
stack: ["React", "Zustand", "Material UI", "Node", "Express", "Redis", "PostgreSQL", "Twilio"]
order: 2
---

Body written in Task 8.
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `pnpm test`
Expected: PASS.

- [ ] **Step 8: Write the image frame**

Create `src/components/ImageFrame.astro`. The surface card exists because the three marketing images have mismatched backgrounds — periwinkle, near-white, black-on-grid — and bleeding them to the page background looks broken in at least one theme. Never invert or hue-shift them.

```astro
---
interface Props {
  src: string;
  alt: string;
  caption?: string;
}

const { src, alt, caption } = Astro.props;
---

<figure class="my-8">
  <div class="overflow-hidden rounded-xl border border-line bg-surface-2 p-3 sm:p-5">
    <img src={src} alt={alt} loading="lazy" decoding="async" class="w-full rounded-lg" />
  </div>
  {caption && <figcaption class="mt-3 text-sm text-faint">{caption}</figcaption>}
</figure>
```

- [ ] **Step 9: Write the case study wrapper**

Create `src/components/CaseStudy.astro`:

```astro
---
import type { CollectionEntry } from "astro:content";
import { render } from "astro:content";

interface Props {
  entry: CollectionEntry<"case-studies">;
}

const { entry } = Astro.props;
const { Content } = await render(entry);
const { title, role, period, summary, stack } = entry.data;
---

<article class="border-t border-line py-14 first:border-t-0">
  <header>
    <p class="text-sm text-faint">{role} &middot; {period}</p>
    <h3 class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h3>
    <p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted text-pretty">{summary}</p>
    <ul class="mt-5 flex flex-wrap gap-2">
      {
        stack.map((item) => (
          <li class="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
            {item}
          </li>
        ))
      }
    </ul>
  </header>

  <div
    class="mt-8 max-w-2xl space-y-5 leading-relaxed text-muted [&_h4]:mt-8 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-ink [&_strong]:text-ink"
  >
    <Content />
  </div>
</article>
```

- [ ] **Step 10: Render the work section**

In `src/pages/index.astro`, add above the closing layout tag:

```astro
---
import { getCollection } from "astro:content";
import CaseStudy from "../components/CaseStudy.astro";

const caseStudies = (await getCollection("case-studies")).sort(
  (a, b) => a.data.order - b.data.order,
);
---

<section id="work" class="mx-auto max-w-5xl px-6 py-16">
  <h2 class="text-sm font-semibold uppercase tracking-widest text-accent">Case studies</h2>
  {caseStudies.map((entry) => <CaseStudy entry={entry} />)}
</section>
```

- [ ] **Step 11: Verify**

```bash
pnpm test && pnpm build && grep -q "Merchant analytics platform" dist/index.html && echo "case studies render"
```

Expected: tests pass, build succeeds, `case studies render`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "Add case study collection and image frame

Marketing screenshots are copied locally rather than hotlinked, and framed
in a consistent surface card because their backgrounds differ.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 7: Recharge analytics case study

The headline. Everything here traces to two resume bullets — do not embellish beyond them.

**Files:**
- Modify: `src/content/case-studies/recharge-analytics.mdx`

**Interfaces:**
- Consumes: `ImageFrame.astro` from Task 6
- Produces: nothing consumed downstream

- [ ] **Step 1: Write the body**

Replace the placeholder body in `src/content/case-studies/recharge-analytics.mdx`, keeping the frontmatter as written in Task 6 and adding the import directly beneath it:

```mdx
import ImageFrame from "../../components/ImageFrame.astro";

Recharge merchants could see that revenue moved. They could not see why. Answering
questions like which products drove churn, or how a cohort's retention compared to
the rest of the category, meant exporting data and rebuilding it by hand in a
spreadsheet.

I led frontend development of the analytics platform that closed that gap: dashboards
and drill-down reports surfacing business metrics that had previously been unavailable
to more than 20,000 merchants.

<ImageFrame
  src="/images/case-studies/recharge-dashboard.png"
  alt="Recharge analytics dashboard showing subscription recurring revenue with items, orders and average sales tiles above a stacked bar chart of checkout and subscription orders over time."
  caption="Recurring revenue and order activity, from Recharge's public marketing site."
/>

#### Two generations of the same product

I was the primary frontend engineer on the custom reports product across two distinct
architectural generations.

The first generation shipped canned reports: a fixed catalog where each report paired
pre-selected metrics with pre-selected dimensions. It answered the most common questions
quickly and proved the demand was real. Its limit was structural — every new question a
merchant asked meant engineering built another report.

The second generation inverted that. Instead of shipping reports, we shipped the
building blocks: merchants compose their own metrics, dimensions, groupings and
comparison windows, and the report is a saved configuration rather than a hardcoded
view. The interesting frontend work was in the constraint layer, since not every metric
is valid against every dimension, and a UI that lets you build an incoherent query
produces a support ticket instead of an answer.

<ImageFrame
  src="/images/case-studies/recharge-custom-report.png"
  alt="A custom Recharge report titled Subscription checkout order items, showing a report controls bar with date range, comparison period and monthly grouping, above a stacked bar chart broken out by product."
  caption="A composed report: date range, comparison window and grouping are merchant-selected, not hardcoded."
/>

#### Working across the stack boundary

None of this is a frontend-only problem. Report configurations become queries against a
warehouse, and the shape of what the UI allows is bounded by what the data layer can
answer at acceptable latency. I worked closely with backend and data engineers on where
that line sat, which is why the constraint rules live in one shared definition rather
than being reimplemented in the client.

<ImageFrame
  src="/images/case-studies/recharge-churn-benchmark.png"
  alt="A Recharge churn benchmarking chart plotting a single store's active churn rate against 25th percentile, median and 75th percentile benchmarks, with an open tooltip showing values for June 2025."
  caption="Benchmarking a store against category percentiles, with drill-down on hover."
/>
```

- [ ] **Step 2: Verify**

```bash
pnpm build && grep -q "Two generations of the same product" dist/index.html && echo "recharge case study rendered"
```

Expected: `recharge case study rendered`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Write Recharge analytics case study

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 8: Stay.AI case study

**Files:**
- Modify: `src/content/case-studies/stay-ai-portal.mdx`

**Interfaces:**
- Consumes: `ImageFrame.astro` from Task 6
- Produces: nothing consumed downstream

- [ ] **Step 1: Write the body**

Replace the placeholder body, keeping the Task 6 frontmatter. Include the `ImageFrame` block only if Step 2 of Task 6 produced `stay-ai-portal.png`; otherwise omit that block and the import entirely.

```mdx
import ImageFrame from "../../components/ImageFrame.astro";

The customer portal is where a subscriber actually lives: it is where they swap a
product, skip a delivery, or cancel. For a subscription business it is the highest
-leverage surface there is, because every interaction is a chance to retain or lose the
relationship.

I led the architectural design and development of the rebuild.

#### What the rebuild had to solve

A portal is embedded in someone else's brand, so it has to be themeable without forking
per merchant, and it has to stay responsive on the mid-range phones most subscribers
actually use. State is the hard part: subscription mutations are asynchronous and
frequently optimistic, and a subscriber who taps skip needs to see it take effect
immediately without the UI drifting out of sync with the server.

We used Zustand for client state, keeping the store deliberately small and colocated
with the flows that own it, rather than one global object every component reaches into.
Redis fronted the reads that would otherwise hit Postgres on every portal load, and
Twilio handled the notification path.

<ImageFrame
  src="/images/case-studies/stay-ai-portal.png"
  alt="Stay.AI customer portal marketing image showing the subscriber-facing subscription management interface."
  caption="The customer portal, from Stay.AI's public marketing site."
/>
```

- [ ] **Step 2: Verify**

```bash
pnpm build && grep -q "customer portal is where a subscriber" dist/index.html && echo "stay.ai case study rendered"
```

Expected: `stay.ai case study rendered`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Write Stay.AI customer portal case study

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 9: Agentic engineering section

Its own section rather than a skills bullet, per the spec. This is a current differentiator and was specifically flagged as such by a former manager reviewing the resume.

**Files:**
- Create: `src/components/AgenticSection.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: token classes from Task 2
- Produces: anchor `#agentic` targeted by `Nav`

- [ ] **Step 1: Write the component**

Create `src/components/AgenticSection.astro`. Claims stay concrete — describe the workflow, do not assert productivity multipliers that cannot be substantiated.

```astro
---
const practices = [
  {
    title: "Spec before code",
    body: "Work starts as a written design and an implementation plan, reviewed before anything is generated. Ambiguity is cheaper to fix in a document than in a diff.",
  },
  {
    title: "Context is the input",
    body: "Project conventions, architecture and constraints live in files the agent reads every session, so output matches the codebase instead of a generic house style.",
  },
  {
    title: "Small, verifiable units",
    body: "Tasks are sized to one testable deliverable, each gated on tests that actually ran. Verification is the checkpoint, not the vibe.",
  },
  {
    title: "Review is still mine",
    body: "Generated code gets read line by line. The tooling changes how fast a first draft arrives, not who is accountable for what ships.",
  },
];
---

<section id="agentic" class="border-t border-line">
  <div class="mx-auto max-w-5xl px-6 py-16">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-accent">
      Agentic engineering
    </h2>
    <p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted text-pretty">
      I was an early adopter of agentic development workflows and have spent the last
      stretch of my career building with them daily. The tools are not the interesting
      part. The discipline around them is.
    </p>

    <div class="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
      {
        practices.map((practice) => (
          <div class="bg-surface p-6">
            <h3 class="font-semibold">{practice.title}</h3>
            <p class="mt-2 text-sm leading-relaxed text-muted">{practice.body}</p>
          </div>
        ))
      }
    </div>

    <p class="mt-8 max-w-2xl text-sm leading-relaxed text-faint">
      Day to day: Claude, Claude Code, Cursor and MCP servers.
    </p>
  </div>
</section>
```

- [ ] **Step 2: Render it**

In `src/pages/index.astro`, import `AgenticSection` and place it after the `#work` section.

- [ ] **Step 3: Verify**

```bash
pnpm build && grep -q "Agentic engineering" dist/index.html && echo "agentic rendered"
```

Expected: `agentic rendered`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add agentic engineering section

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 10: Story timeline data and markup

Five chapters, one spine. Static markup in this task; motion is added in Task 11 so the section is verifiably correct before anything animates.

**Files:**
- Create: `src/data/timeline.ts`, `tests/timeline.test.ts`, `src/components/StoryTimeline.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: token classes from Task 2
- Produces: `chapters: Chapter[]` from `src/data/timeline.ts` where `Chapter = { id: string; period: string; sortYear: number; title: string; body: string }`. Task 11 animates the `[data-chapter]` elements this task emits.

- [ ] **Step 1: Write the failing test**

Create `tests/timeline.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { chapters } from "../src/data/timeline";

describe("story timeline", () => {
  it("has five chapters", () => {
    expect(chapters).toHaveLength(5);
  });

  it("is in chronological order", () => {
    const years = chapters.map((c) => c.sortYear);
    expect(years).toEqual([...years].sort((a, b) => a - b));
  });

  it("gives every chapter a unique id", () => {
    const ids = chapters.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("leaves no field empty", () => {
    for (const chapter of chapters) {
      expect(chapter.id.length).toBeGreaterThan(0);
      expect(chapter.period.length).toBeGreaterThan(0);
      expect(chapter.title.length).toBeGreaterThan(0);
      expect(chapter.body.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test`
Expected: FAIL — cannot resolve `../src/data/timeline`.

- [ ] **Step 3: Write the data**

Create `src/data/timeline.ts`. Colorado is one chapter covering both the move and the kitchen — the kitchen job happened during Colorado, it is not a separate stage.

```typescript
export interface Chapter {
  id: string;
  period: string;
  sortYear: number;
  title: string;
  body: string;
}

export const chapters: Chapter[] = [
  {
    id: "jazz",
    period: "2012",
    sortYear: 2012,
    title: "A degree in jazz guitar",
    body: "B.Sc Jazz Studies at SUNY New Paltz. For my senior project I picked the musicians, ran the rehearsals, handled the promotion, and played an hour-long set to a live audience. It was the first time I shipped something with a hard deadline and no way to hide.",
  },
  {
    id: "colorado",
    period: "2013 - 2017",
    sortYear: 2013,
    title: "Colorado",
    body: "I moved out to ski and mountain bike, and paid for it by running the kitchen at a pizza bar and grill. Managing a line during a dinner rush is triage under load: fixed capacity, competing priorities, and no version of the night where you get to stop and redesign the system.",
  },
  {
    id: "code",
    period: "2018",
    sortYear: 2018,
    title: "Learned to code",
    body: "Thinkful's engineering immersion, starting November 2018. HTML, CSS, JavaScript, Node, React, Redux, and algorithms, several hours a week alongside a senior developer.",
  },
  {
    id: "covetrus",
    period: "2019",
    sortYear: 2019,
    title: "Six weeks to full-time",
    body: "Joined Covetrus as a software developer intern in April 2019 and was offered a full-time role six weeks later. Spent nearly two years on a digital prescription management platform serving more than 100,000 veterinary customers.",
  },
  {
    id: "senior",
    period: "2021 - 2026",
    sortYear: 2021,
    title: "Recharge, Stay.AI, senior",
    body: "Five years in remote, distributed engineering orgs. Frontend engineer at Recharge, a stint leading the customer portal rebuild at Stay.AI, then back to Recharge as a senior frontend engineer leading the merchant analytics platform.",
  },
];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test`
Expected: PASS, 4 timeline tests.

- [ ] **Step 5: Write the component**

Create `src/components/StoryTimeline.astro`. Markup is authored so a later upgrade to full-viewport cinematic chapters changes only the animation layer, not this DOM.

```astro
---
import { chapters } from "../data/timeline";
---

<section id="story" class="border-t border-line">
  <div class="mx-auto max-w-5xl px-6 py-16">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-accent">How I got here</h2>
    <p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted text-pretty">
      I did not take the direct route.
    </p>

    <ol class="relative mt-12 border-l border-line pl-8 sm:pl-12">
      {
        chapters.map((chapter) => (
          <li class="relative pb-12 last:pb-0" data-chapter>
            <span
              class="absolute -left-[calc(2rem+5px)] top-2 h-2.5 w-2.5 rounded-full bg-accent sm:-left-[calc(3rem+5px)]"
              aria-hidden="true"
            />
            <p class="text-sm font-medium tabular-nums text-faint">{chapter.period}</p>
            <h3 class="mt-1 text-xl font-semibold tracking-tight">{chapter.title}</h3>
            <p class="mt-3 max-w-2xl leading-relaxed text-muted text-pretty">{chapter.body}</p>
          </li>
        ))
      }
    </ol>
  </div>
</section>
```

- [ ] **Step 6: Render it**

In `src/pages/index.astro`, import `StoryTimeline` and place it after `AgenticSection`.

- [ ] **Step 7: Verify**

```bash
pnpm test && pnpm build && grep -c "data-chapter" dist/index.html
```

Expected: tests pass; grep returns `5`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Add story timeline

Five chapters from jazz school to senior engineer. Colorado covers both the
move and the kitchen job, which overlapped.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 11: Scroll-driven motion for the timeline

CSS scroll-driven animations, no JavaScript. The section is already correct and readable without this; motion is purely additive.

**Files:**
- Modify: `src/components/StoryTimeline.astro`

**Interfaces:**
- Consumes: the `[data-chapter]` elements from Task 10
- Produces: nothing consumed downstream

- [ ] **Step 1: Add the scoped animation styles**

Append this `<style>` block to `src/components/StoryTimeline.astro`. The `@supports` guard means browsers without scroll-driven animation support show the fully visible static timeline rather than content stuck at `opacity: 0` — that failure mode is why the guard is not optional. The reduced-motion block is a second, independent guarantee.

```astro
<style>
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      [data-chapter] {
        animation: chapter-in linear both;
        animation-timeline: view();
        animation-range: entry 10% cover 30%;
      }
    }
  }

  @keyframes chapter-in {
    from {
      opacity: 0;
      transform: translateY(1.25rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
```

- [ ] **Step 2: Verify the guard is present in the built CSS**

```bash
pnpm build && grep -rq "animation-timeline" dist/ && grep -rq "prefers-reduced-motion" dist/ && echo "motion layer shipped with guards"
```

Expected: `motion layer shipped with guards`.

- [ ] **Step 3: Verify the no-JS fallback by reading, not assuming**

Confirm that no `[data-chapter]` rule sets `opacity: 0` outside the `@supports` + `@media` guards. If any does, content would be invisible for users without scroll-driven animation support. Fix before committing.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Animate timeline chapters on scroll

Pure CSS scroll-driven animation behind an @supports guard, so unsupported
browsers get the static timeline rather than invisible content.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 12: Selected side work

Three entries. `stock-signal` is published in Task 16; `airbnb-research` is described without a link by decision, not oversight.

**Files:**
- Create: `src/data/projects.ts`, `src/components/SelectedWork.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: token classes from Task 2
- Produces: `projects: Project[]` where `Project = { name: string; blurb: string; stack: string[]; href?: string; note?: string }`

- [ ] **Step 1: Write the data**

Create `src/data/projects.ts`:

```typescript
export interface Project {
  name: string;
  blurb: string;
  stack: string[];
  href?: string;
  note?: string;
}

export const projects: Project[] = [
  {
    name: "stock-signal",
    blurb:
      "A rule-based intraday trading signal engine. Six indicator votes drive a consensus call, a backtest replays real market bars through the identical engine and exit logic as the live path, and every signal and outcome is logged so the strategy can be judged on evidence rather than memory. Backtesting found a real but thin edge, showed that tightening conviction made it worse, and identified an orthogonal filter that clears the cost line.",
    stack: ["Python", "Alpaca", "pandas-ta", "Flask", "SQLite", "pytest"],
    href: "https://github.com/skunkpirates42/stock-signal",
  },
  {
    name: "airbnb-research",
    blurb:
      "A listing research tool: a Chrome extension collects listing and review data, a Next.js app runs it through Claude for criteria-based analysis, and the UI polls until the analysis completes. The interesting problem was that the underlying persisted-query hash rotates, so the extension captures the live request at runtime instead of hardcoding anything that would break within a month.",
    stack: ["Next.js", "TypeScript", "Prisma", "MV3 extension", "Vite", "Claude API"],
    note: "Personal project, source kept private",
  },
  {
    name: "wc-predictions",
    blurb: "A World Cup match prediction app.",
    stack: ["JavaScript"],
    href: "https://github.com/skunkpirates42/wc-predictions",
  },
];
```

- [ ] **Step 2: Write the component**

Create `src/components/SelectedWork.astro`:

```astro
---
import { projects } from "../data/projects";
---

<section id="side-work" class="border-t border-line">
  <div class="mx-auto max-w-5xl px-6 py-16">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-accent">Side work</h2>
    <p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted text-pretty">
      Things I built recently because I wanted to know how they would turn out.
    </p>

    <ul class="mt-10 space-y-px overflow-hidden rounded-xl border border-line bg-line">
      {
        projects.map((project) => (
          <li class="bg-surface p-6">
            <div class="flex flex-wrap items-baseline justify-between gap-3">
              <h3 class="font-mono text-lg font-semibold">
                {project.href ? (
                  <a href={project.href} class="hover:text-accent">
                    {project.name}
                  </a>
                ) : (
                  project.name
                )}
              </h3>
              {project.note && <span class="text-xs text-faint">{project.note}</span>}
            </div>
            <p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted text-pretty">
              {project.blurb}
            </p>
            <ul class="mt-4 flex flex-wrap gap-2">
              {project.stack.map((item) => (
                <li class="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted">
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))
      }
    </ul>
  </div>
</section>
```

- [ ] **Step 3: Render it**

In `src/pages/index.astro`, import `SelectedWork` and place it after `StoryTimeline`.

- [ ] **Step 4: Verify**

```bash
pnpm build && grep -q "stock-signal" dist/index.html && echo "side work rendered"
```

Expected: `side work rendered`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add side work section

airbnb-research is described without a source link deliberately; see the
spec's side projects section.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 13: Resume as real HTML

Replaces the Cloudinary-hosted PNG the old site used, which was invisible to search engines and screen readers alike.

**Files:**
- Create: `src/data/experience.ts`, `src/components/ResumeSection.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: token classes from Task 2; the PDF moved to `public/resume/peter-ramos-resume.pdf` in Task 1
- Produces: `roles: Role[]` where `Role = { title: string; company: string; location: string; period: string; points: string[] }`

- [ ] **Step 1: Write the data**

Create `src/data/experience.ts`. Titles, dates and claims are copied from the resume — do not paraphrase them into something stronger.

```typescript
export interface Role {
  title: string;
  company: string;
  location: string;
  period: string;
  points: string[];
}

export const roles: Role[] = [
  {
    title: "Senior Frontend Software Engineer",
    company: "Recharge",
    location: "Remote",
    period: "May 2023 - Aug 2026",
    points: [
      "Led frontend development of the merchant analytics platform: dashboards and drill-down reports surfacing business metrics previously unavailable to 20,000+ merchants.",
      "Primary frontend engineer on the custom analytics reports product through two architectural generations, from canned reports with pre-selected metrics and dimensions to fully customizable reports. Collaborated closely with backend and data engineers.",
    ],
  },
  {
    title: "Senior Full-Stack Software Engineer",
    company: "Stay.AI",
    location: "Remote",
    period: "Nov 2022 - May 2023",
    points: [
      "Led the architectural design and development of the customer portal rebuild, using React, Zustand, Material UI, Node, Express, Redis, PostgreSQL and Twilio.",
    ],
  },
  {
    title: "Frontend Software Engineer",
    company: "Recharge",
    location: "Remote",
    period: "Feb 2021 - Oct 2022",
    points: [
      "Developed and maintained e-commerce subscription management software using Vue, TypeScript, Nuxt, Vuetify, Cypress, Jinja, Flask and SQL.",
    ],
  },
  {
    title: "Software Developer",
    company: "Covetrus",
    location: "Portland, ME / Remote",
    period: "Apr 2019 - Feb 2021",
    points: [
      "Iterated on a digital prescription management platform serving 100,000+ veterinary customers using the Scaled Agile Framework, with React, TypeScript, Apollo, GraphQL, Express, Node.js, MongoDB, MySQL, Java, Spring Boot and Kafka.",
      "Joined as a software developer intern in April 2019 and was offered a full-time role after six weeks.",
    ],
  },
];
```

- [ ] **Step 2: Write the component**

Create `src/components/ResumeSection.astro`:

```astro
---
import { roles } from "../data/experience";
---

<section id="resume" class="border-t border-line">
  <div class="mx-auto max-w-5xl px-6 py-16">
    <div class="flex flex-wrap items-baseline justify-between gap-4">
      <h2 class="text-sm font-semibold uppercase tracking-widest text-accent">Experience</h2>
      <a
        href="/resume/peter-ramos-resume.pdf"
        class="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
      >
        Download PDF
      </a>
    </div>

    <ol class="mt-10 space-y-10">
      {
        roles.map((role) => (
          <li>
            <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 class="text-lg font-semibold tracking-tight">
                {role.title}, {role.company}
              </h3>
              <p class="text-sm tabular-nums text-faint">{role.period}</p>
            </div>
            <p class="mt-1 text-sm text-faint">{role.location}</p>
            <ul class="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-muted marker:text-line">
              {role.points.map((point) => (
                <li class="text-pretty">{point}</li>
              ))}
            </ul>
          </li>
        ))
      }
    </ol>

    <div class="mt-12 border-t border-line pt-8">
      <h3 class="text-lg font-semibold tracking-tight">Education</h3>
      <p class="mt-2 text-muted">B.Sc Jazz Studies, SUNY New Paltz, 2012</p>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Render it**

In `src/pages/index.astro`, import `ResumeSection` and place it after `SelectedWork`.

- [ ] **Step 4: Verify the PDF is actually served**

```bash
pnpm build && ls -la dist/resume/peter-ramos-resume.pdf && grep -q "Senior Frontend Software Engineer" dist/index.html && echo "resume section rendered"
```

Expected: the PDF exists in `dist/`, and `resume section rendered`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Render resume as HTML instead of a hosted image

The old site embedded a Cloudinary PNG of the resume, which no search engine
or screen reader could read. Content is now real markup with the PDF as a
download.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 14: Contact section and social card

**Files:**
- Create: `src/components/Contact.astro`, `public/og.png`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `contactLinks` from Task 4; the OG meta tags already reference `/og.png` from Task 3
- Produces: anchor `#contact` targeted by `Nav`

- [ ] **Step 1: Write the component**

Create `src/components/Contact.astro`:

```astro
---
import { contactLinks } from "../data/links";
---

<section id="contact" class="border-t border-line">
  <div class="mx-auto max-w-5xl px-6 py-20">
    <h2 class="text-sm font-semibold uppercase tracking-widest text-accent">Contact</h2>
    <p class="mt-4 max-w-2xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
      I am looking for my next senior frontend or full-stack role.
    </p>
    <p class="mt-4 max-w-2xl leading-relaxed text-muted text-pretty">
      If you are hiring, or you just want to talk about analytics UIs, subscription
      platforms, or how agents are changing the job, I would like to hear from you.
    </p>

    <ul class="mt-8 flex flex-wrap gap-3">
      {
        contactLinks.map((link) => (
          <li>
            <a
              href={link.href}
              class="inline-block rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              {link.label}
            </a>
          </li>
        ))
      }
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Render it**

In `src/pages/index.astro`, import `Contact` and place it last, after `ResumeSection`.

- [ ] **Step 3: Create the social card**

Create a 1200x630 PNG at `public/og.png` reading "Peter Ramos" and "Senior Full-Stack Engineer" on the light-theme ground color `#FBFAF8`, with `#7C5CD6` accent. Any method is fine — an HTML page screenshotted at 1200x630, or an image tool. Requirements: exactly 1200x630, text legible at thumbnail size, under 500KB.

Delete the old `assets/` directory once nothing references it:

```bash
git rm -r --ignore-unmatch assets
```

- [ ] **Step 4: Verify**

```bash
pnpm build && ls -la dist/og.png && grep -q "og:image" dist/index.html && echo "contact and card ready"
```

Expected: `dist/og.png` exists, and `contact and card ready`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add contact section and social card

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 15: Full verification pass

No claim in this task may be made without pasting the command output. A command that errored has told you nothing.

**Files:**
- Modify: whatever the audits turn up
- Modify: `README.md`

**Interfaces:**
- Consumes: the complete site
- Produces: a verified build

- [ ] **Step 1: Run the unit tests and the build**

```bash
pnpm test && pnpm build
```

Expected: all tests pass, build completes with no errors or warnings.

- [ ] **Step 2: Check every link, including external ones**

Uses `npx` rather than adding a permanent dependency for a one-off audit.

```bash
pnpm build && npx --yes linkinator ./dist --recurse --silent
```

Expected: zero broken links. The old site shipped two dead project links; that must not recur. If any external link fails, fix or remove it — do not note it and move on.

- [ ] **Step 3: Run the accessibility audit in both themes**

```bash
pnpm build && npx --yes serve dist -l 4321 &
sleep 2
npx --yes @axe-core/cli http://localhost:4321 --exit
```

Expected: zero violations. Then set the theme to dark in the browser and re-run the page manually to confirm contrast holds. Kill the server when done.

- [ ] **Step 4: Run Lighthouse**

```bash
npx --yes serve dist -l 4321 &
sleep 2
npx --yes lighthouse http://localhost:4321 --only-categories=performance,accessibility,best-practices,seo --preset=desktop --quiet --chrome-flags="--headless" --output=json --output-path=/tmp/lh.json
node -e "const r=require('/tmp/lh.json');for(const[k,v]of Object.entries(r.categories))console.log(k,Math.round(v.score*100))"
```

Expected: accessibility 100, SEO 100, performance 95+. If performance falls short, the likely cause is unoptimized PNG screenshots — compress them rather than removing them.

- [ ] **Step 5: Confirm reduced motion is honored**

In the browser with "Reduce motion" enabled at the OS level, scroll the story section. Expected: all five chapters visible and static, no fade or translate. Confirm by observation, not by assuming the CSS is correct.

- [ ] **Step 6: Rewrite the README**

Replace `README.md`:

```markdown
# peterramos.dev

My personal site. Astro, TypeScript and Tailwind, built to static files and
deployed on Netlify.

## Running it

```bash
pnpm install
pnpm dev
```

## Other commands

```bash
pnpm build   # static build to dist/
pnpm test    # unit tests
```

Case studies live in `src/content/case-studies` as MDX. The story timeline and
side projects are plain data in `src/data`.
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Verify build, links, accessibility and performance

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Fq3vVm3nvyoG8pfbf5Hquh"
```

---

### Task 16: Publish stock-signal

Separate repository, separate concern. Task 12 links to it, so this must land before the site goes live or that link 404s.

**Files:**
- Modify: `/Users/peterr/Desktop/stock-signal/README.md`
- No files in the portfolio repo

- [ ] **Step 1: Re-run the secret check on everything that would be pushed**

A pre-push review is mandatory. Prior inspection found `.gitignore` covering `.env` and `*.db`, no tracked database or env files, and config reading from environment variables — confirm that still holds across all history, not just the working tree.

```bash
cd /Users/peterr/Desktop/stock-signal
git ls-files | grep -Ei '\.(db|env|sqlite|pem|key)$' || echo "no secret-bearing files tracked"
git grep -nEi "(api[_-]?key|secret|token|password)\s*=\s*['\"][A-Za-z0-9_-]{12,}" -- '*.py' || echo "no hardcoded credentials"
git log --all --diff-filter=A --name-only --format="" | sort -u | grep -Ei '\.(db|env|sqlite)$' || echo "no secret files in history"
```

Expected: all three print their "no ..." message. **If any file appears, stop and report it. Do not push.**

- [ ] **Step 2: Report what will be published, then get approval**

List the tracked files and total size. Show the user before creating anything public. Pushing is an outward-facing action and needs explicit sign-off.

```bash
git ls-files | wc -l
du -sh .
git ls-files
```

- [ ] **Step 3: Write a README that leads with the finding**

The honest result is the asset here. Create `README.md` covering: what the engine does, the architecture (signal engine, data adapter, paper execution, backtest, dashboard, persistence), how to run it, and a findings section stating the gross edge, the failed threshold sweep and why the votes are collinear, and the orthogonal gate that clears the cost line.

State plainly that results come from a single in-sample backtest window on partial-volume IEX data with idealized exits, that no real capital has been traded, and that this is not investment advice. Do not soften those.

- [ ] **Step 4: Create the public repo and push**

Only after Step 2 approval.

```bash
cd /Users/peterr/Desktop/stock-signal
gh repo create stock-signal --public --source=. --remote=origin \
  --description="Rule-based intraday trading signal engine with backtesting and paper execution"
git push -u origin HEAD
```

- [ ] **Step 5: Verify the link the portfolio depends on actually resolves**

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://github.com/skunkpirates42/stock-signal
```

Expected: `200`. If not, the `href` in `src/data/projects.ts` is wrong — fix it there.

---

## Definition of done

- [ ] `pnpm test` passes.
- [ ] `pnpm build` completes with no errors.
- [ ] `linkinator` reports zero broken links.
- [ ] `@axe-core/cli` reports zero violations in both themes.
- [ ] Lighthouse: accessibility 100, SEO 100, performance 95+.
- [ ] Story timeline is fully readable with JavaScript disabled and with reduced motion enabled.
- [ ] No bootcamp-era project appears anywhere on the site.
- [ ] No claim on the site is absent from the resume.
- [ ] `github.com/skunkpirates42/stock-signal` returns 200.
- [ ] Deploy preview reviewed by Peter before anything merges to `master`.
