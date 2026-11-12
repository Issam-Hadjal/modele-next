# <Project name>

## Purpose
<Two or three sentences, written when the project opens: what it does, for whom,
and what a finished change looks like.>

## Stack
- Runtime: Node.js 26, the version of the CI and of Vercel, pinned in `.nvmrc`
  and in `package.json` (`"engines": { "node": "26.x" }`).
- Package manager: npm. `package-lock.json` is committed: install with `npm ci`,
  never `npm install`, which rewrites it. Adding, removing or upgrading a
  dependency is a change of its own, with its own issue.
- Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript in
  strict mode, Tailwind CSS 4, ESLint with `eslint-config-next`, Vitest with
  React Testing Library and jsdom, Playwright with axe for end-to-end and
  accessibility tests.
- Fonts come from the `geist` package and ship with the page. Never
  `next/font/google`: it fetches from Google at build time.
- Next.js has changed since your training data. When `node_modules/` is
  installed, read the matching guide in `node_modules/next/dist/docs/` before
  writing Next.js code: it documents the installed version and reads offline.
  Heed its deprecation notices.

## Layout
| Path | What lives there |
|---|---|
| `app/` | the routes: one folder per segment, with `page.tsx`, `layout.tsx`, `route.ts` |
| `app/**/<feature>/` | a feature's routes, with the components only they use |
| `lib/<feature>/` | a feature's logic and its tests: pure functions, without React or browser APIs |
| `lib/` | helpers shared between features, flat |
| `components/` | React components shared between features |
| `e2e/` | end-to-end and accessibility tests, run by Playwright in a real browser |
| `public/` | static files, served as they are |

A feature folder is imported only by its own feature: by `lib/<feature>/` itself
and by the route folders named `<feature>` under `app/`. What two features need
moves up, flat, into `lib/`. `lib/architecture.test.ts` checks it: the CI fails
otherwise.

## Commands
From the repository root. The CI runs the same commands: a change is done when
they pass there.

| Step | Command |
|---|---|
| Install | `npm ci` |
| Build | `npm run build` — `next build`, which also checks the types and prerenders every page |
| Test | `npm test` — `vitest run`: once, without watching |
| Lint | `npm run lint` — `eslint`; `next lint` no longer exists, and `next build` no longer lints |
| End-to-end and accessibility | `npm run test:e2e` — Playwright, against the production build: run it after `npm run build`; it starts the server itself |
| Run locally | `npm run dev` — never needed to publish; stop it before you finish |

The CI installs, then builds. Tests and lint still run when the build fails, as
long as the install succeeded; the end-to-end and accessibility tests need a
successful build, and the CI installs their browser itself. `next build` also
type-checks test files: a test that does not compile breaks the build.

## Conventions
- A feature's logic lives in `lib/<feature>/` as pure functions, tested next to
  them: valid input, edge cases, invalid input. A page only wires them to the
  interface.
- The interface speaks French. Code, identifiers and file names are in English.
- In French JSX text, the apostrophe is the typographic one (’): the straight
  apostrophe makes the `react/no-unescaped-entities` rule fail.
- Server Components by default. `'use client'` only where state, effects or
  browser APIs are needed, as low in the tree as possible.
- Cache Components is on, so every page is prerendered at build time. Never
  read the clock or randomness during render, not even in a Client Component
  (`Date.now()`, `new Date()`, `Math.random()`, `crypto.randomUUID()`): read
  them in an event handler or a `useEffect`. Otherwise `next build` fails.
- Request APIs are asynchronous: `await` `params`, `searchParams`, `cookies()`,
  `headers()`.
- `proxy.ts`, not `middleware.ts`. Images through `next/image`.
- Tailwind is configured in CSS, in `app/globals.css`: there is no
  `tailwind.config.js`.
- Imports from the repository root use the `@/` alias.
- Unit tests sit next to what they test: `<name>.test.ts(x)`. Vitest cannot
  render an async Server Component: test the functions it calls.
- Assertions use Vitest matchers: `@testing-library/jest-dom` is not installed,
  so neither `toHaveValue` nor `toBeInTheDocument` is available; read `.value`
  or `.textContent` instead.
- `vitest.config.mts` keeps `globals: true`: without it, Testing Library does
  not clean up the DOM between tests.
- Every page is listed in `e2e/accessibility.spec.ts`: the pull request that
  adds a route adds it there. Axe checks WCAG 2.1 A and AA, contrast included.
- `next.config.ts` keeps `agentRules: false`: this file, not `next dev`, says how
  to work here.

## Verifying a change
<Written when the project opens: which pages must render and what they must
show; which flows to try.>
- `npm test` covers the logic of every feature: valid input, edge cases, invalid
  input.
- `npm run test:e2e` renders every page in a real browser and checks its
  accessibility.

## Do not touch
- Generated, never edited by hand, never committed: `.next/`, `node_modules/`,
  `next-env.d.ts`, `*.tsbuildinfo`, `test-results/`, `playwright-report/`.
- Never committed: any `.env*` file but `.env.example`; `.vercel/`.
- `package-lock.json` is written by npm only.

## Environment variables
None: the project reads no environment variable, and the build and the tests
need none. Adding one is a change of its own: its value would live in the
Vercel project, never in the repository, and `.env.example` would list its name
with an empty value.

## Deployment
Vercel. The branch `production` is the production deployment; every other
branch and every pull request gets a preview deployment. `production` moves only
when the owner merges `main` into it.
