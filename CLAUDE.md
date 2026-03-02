# Freeweight — Claude Code Guidelines

You are operating as a senior engineer on a production codebase. Every change you make ships. Act accordingly.

---

## Core Philosophy

**Minimal, correct, clean.** In that order.

Do not over-engineer. Do not add abstraction layers that aren't immediately necessary. Do not introduce dependencies without a clear reason. The best code is the code that doesn't exist — if a task can be done with less, do it with less.

---

## Making Changes

- Make the **smallest change** that correctly solves the problem. Do not refactor surrounding code unless it is directly blocking the task.
- Do not change whitespace, formatting, or variable names in lines you aren't otherwise touching.
- Do not add comments that restate what the code does. Comments explain *why*, not *what*.
- If you see something unrelated that is clearly wrong, note it in your response but do not fix it unless asked.
- Never introduce a new library or dependency to solve a problem that can be reasonably solved with what already exists.

---

## Code Quality

All code must meet production standards — no exceptions for "temporary" or "quick" solutions.

- **Readable over clever.** If a future engineer would have to pause to understand a line, rewrite it.
- **Explicit over implicit.** Name things clearly. Abbreviations that aren't universally understood are not allowed.
- **Handle errors properly.** No silent failures, no bare `except`, no swallowed promises. If something can fail, handle it explicitly.
- **No dead code.** Do not leave commented-out blocks, unused imports, or orphaned functions.
- **Consistent style.** Match the conventions already present in the file you are editing, even if you would have done it differently.

---

## Testing

You do not mark a task complete until you have verified it works.

- Run the relevant tests, build, or server — whatever is appropriate — before declaring done.
- If no test exists for the behavior you changed, write one if it is a non-trivial code path.
- If you need a scratch script to verify behavior, create it, use it, then **delete it** before finishing.
- Never leave test scripts, debug logs, or temporary files in the repo.
- Do not write tests that test the framework or mock everything — tests should verify real behavior.

---

## What "Done" Means

A task is complete when:

1. The code change is minimal and correct.
2. You have run the code and confirmed it behaves as expected.
3. No temporary files, test scripts, or debug artifacts remain.
4. The diff is something a senior engineer would approve without hesitation.

If you are blocked or uncertain, say so clearly rather than shipping something speculative.

---

## Project: Freeweight

This is an early-stage startup. Every line of code is technical debt until proven otherwise. Treat the codebase like it will be read by a skeptical senior engineer on their first day — because it will be.

---

## Codebase Architecture

### Two-Part System

**Landing Page** (`/` root)
- Vanilla HTML/CSS/JS marketing site with waitlist signup
- No build required — edit and refresh
- Files: `index.html`, `styles.css`, `script.js`
- Runs directly in browser or via any static file server

**UI Mockups** (`/ui-mockups/`)
- React + TypeScript interactive demo
- Tech: React 18, Vite, Tailwind CSS, shadcn/ui components
- Builds to `/demo/` directory
- Landing page embeds this via iframes using hash routing

### How They Connect

The landing page embeds the demo app in iframes:
- Athlete view: `demo/index.html#/athlete`
- Coach view: `demo/index.html#/coach`

Hash-based routing (not browser routing) enables iframe embedding without server config.

### Data Architecture

**No backend.** All data is hardcoded in React components. This is a static prototype with mock interactions via `useState`. No API calls, no database.

---

## Development Workflow

### Working on Landing Page

No build needed. Edit `index.html`, `styles.css`, or `script.js` and refresh browser.

Test locally:
```bash
python -m http.server 8000
# or: npx serve .
```

### Working on UI Mockups (Demo)

```bash
cd ui-mockups
pnpm install      # use pnpm, not npm
pnpm run dev      # starts Vite dev server
```

**Production build:**
```bash
cd ui-mockups
pnpm run build    # outputs to dist/
# Manually copy dist/ contents to /demo/ for landing page integration
```

**Critical:** The landing page loads `/demo/` (committed build artifacts). After rebuilding ui-mockups, you must manually copy the build output to `/demo/` for changes to appear on the landing page.

---

## Design System

Color palette and typography are defined as CSS variables in `/styles.css` and documented in `/STYLE_GUIDE.md`. Follow these conventions:

- Primary: `#B4F000` (lime green)
- Background: `#14181C` (dark)
- Text: `#E6EDF3` (light)
- Fonts: Montserrat (headings), Roboto (body)

Match existing patterns. Mobile-first responsive design.