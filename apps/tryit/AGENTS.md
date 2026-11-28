<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent instructions

This file is the shared source of instructions for AI coding tools working in this repository.

## What this project is

`apps/tryit` (package name `svgin-tryit`) is a Next.js (App Router) demo site for the
[`@svgin/react`](https://www.npmjs.com/package/@svgin/react) and `@svgin/element` packages, living inside the `svgin` Turborepo monorepo (see the root `svgin-monorepo` skill for the
monorepo's overall conventions). It depends on `@svgin/react` as a real published dependency, not the
workspace's own `packages/react` (never imports from that package's source), and has one route per
real feature of the library: the sanitizer Inspector, a server-component fetch, `<SvgInSuspense />`,
`<SvgInProvider />` defaults, `loading="lazy"`, native SVG/DOM prop forwarding, `<SvgInShadow />`, and
`<svg-in>` (`@svgin/element`'s web component).

This app is a demo, not the package. Do not add sanitization or fetch/cache logic here. If a demo
needs new library behavior, that change belongs in `@svgin/react` itself, released, then picked up
here as a dependency bump.

## Source layout

- `src/app/` : one route per demo (`inspector/`, `rsc/`, `suspense/`, `provider/`, `lazy/`, `native-props/`, `shadow/`, `element/`) plus the home page linking to all of them. `src/app/rsc/page.tsx` is the only server-only demo; the rest are client components (several wrapped in a small `*-client-loader.tsx` file using `next/dynamic({ ssr: false })`, see the comment in `suspense-client-loader.tsx` for why: `<SvgIn src>`/`<SvgInSuspense src>`/`<SvgInShadow src>`/`<svg-in src>` resolve a relative URL against `window.location`, which doesn't exist during SSR).
- `src/components/` : demo components and `src/components/ui/` (shadcn/ui primitives, hand-written, see below).
- `src/lib/diff.ts`, `src/lib/examples.ts` : the Inspector's own logic (a rough tag/attribute diff between pasted and sanitized markup, and the example presets). Everything else about "what gets sanitized" comes from the real `@svgin/react` package via its own public API (`onMount` on `<SvgIn svg={...} />`). This repo never reaches into the package's internals.
- `test/` : Vitest unit/component tests.
- `e2e/` : Playwright end-to-end tests against a real browser build (`next build && next start`), including `e2e/a11y.spec.ts` (axe-core, `@axe-core/playwright`, `wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa` rules, one scan per route plus the mobile nav sheet open). Add a route to `e2e/a11y.spec.ts`'s `ROUTES` array whenever you add one to `src/app/`.

## shadcn/ui components

Use the shadcn CLI: `pnpm dlx shadcn@latest add <component>` (config in `components.json`). The existing `src/components/ui/*` files match its output.

**Base UI, not Radix**: this project uses shadcn's Base UI variant (`-b base` / `--base base` on `init`), not the Radix-based default. `@base-ui/react` (not the deprecated `@base-ui-components/react`) is the only headless-component dependency; do not add any `@radix-ui/*` package. Base UI's composition primitive is the `render` prop (a `ReactElement` or a `(props, state) => ReactElement` function) via the `useRender` hook from `@base-ui/react/use-render`, not Radix's `asChild` + `<Slot>` - `Button`/`Badge` already use this pattern (see `src/components/ui/button.tsx`), and any new polymorphic `ui/*` primitive should follow it.

Do not add style overrides on top of a shadcn/Base UI component beyond what its own variant props already express (`variant`, `size`, etc.) - if a component needs to look different, that's a sign the theme tokens in `globals.css` are wrong, not that this one usage needs a one-off className.

Only add a `ui/*` primitive (or export) when something in `src/` actually imports it.

## Design system

- **Color**: primary is mustard `#fbae00` (`oklch(0.804 0.168 76.8)`) in both modes, always with dark text (11.16:1; white is 1.88:1). Every other token in `globals.css` shares hue 76-77 at low chroma. Check any new token against WCAG AA (>= 4.5:1) instead of eyeballing it.
- **Mobile-first, properly responsive**: write the unprefixed (mobile) styles first and layer breakpoint prefixes (`sm:`, `lg:`, ...) on top for larger screens, not the reverse. Use a real mobile nav pattern for anything that doesn't fit a small screen as a plain row - `src/components/site-nav.tsx`'s `Sheet`-based hamburger menu (hidden above `sm`, horizontal link list hidden below it) is the existing example. `e2e/mobile.spec.ts` checks every route for zero horizontal overflow at a 390px viewport; run it (or extend it) for any layout change.

## Before making a change

- Match the existing code style: no unnecessary abstraction, comments explain *why* a non-obvious choice was made.
- Every demo route should exercise the real `@svgin/react` public API (`SvgIn`, `SvgInSuspense`, `SvgInProvider`, `preloadSvg` from `@svgin/react`/`@svgin/react/client`/`@svgin/react/server`/`@svgin/react/core`). Never copy sanitization logic into this repo.
- **RSC first**: every `page.tsx`/`layout.tsx` in `src/app/` is a plain Server Component (no `'use client'`). Interactivity lives in small client "islands" imported by the page (`inspector-client.tsx`, `suspense-client.tsx`, etc.), never the page itself. Before adding `'use client'` to anything, check whether it actually needs a hook, event handler, or browser API - if not, it belongs on the server.
- **SOLID and YAGNI**: one component, one reason to change - a demo component owns its own demo's UI and state, not a shared one doing double duty (`inspector-client.tsx`, `suspense-client.tsx`, `provider-client.tsx`, and `lazy-client.tsx` are deliberately separate, not a single configurable "DemoCard"). Don't add a prop, an abstraction layer, or a `ui/*` primitive for a need that doesn't exist yet in this repo - add it when a second real usage shows up, not in anticipation of one.
- **No em dashes**, anywhere: not in code comments, commit messages, PR descriptions, or UI copy. Use a period, comma, colon, or parentheses instead. (The `nextjs-agent-rules` block at the very top of this file is the one exception - it's regenerated by `next dev` itself, not authored here, so don't hand-edit it to fix this.)

## Required checks before treating a change as done

```sh
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

Add or update a test in `test/` for any behavior change to `src/lib/` or a component's logic. A change that touches routing, a demo's interactive behavior, or anything Suspense/error-boundary related should also pass:

```sh
pnpm exec playwright install --with-deps   # once per machine
pnpm run test:e2e
```

## Commit and pull request conventions

These are set at the monorepo root, not per-app; see the root `svgin-monorepo` skill for the full
picture. In short:

- Commit messages and pull request titles both follow [Conventional Commits](https://www.conventionalcommits.org/) (`fix:`, `feat:`, `perf:`, `refactor:`, `chore:`, `test:`, `docs:`, `ci:`, `build:`). Enforced by commitlint (locally via the root `commit-msg` hook, and in CI on every pull request).
- Keep pull requests focused on one change.
- Never commit build output (`.next/`, `coverage/`, `playwright-report/`, `test-results/`) or `node_modules/`.
- This app is **not** a release-please component (deliberately absent from the root
  `release-please-config.json`) and stays `private: true` permanently, like `packages/core`: it's
  never published, never gets its own version bump or GitHub release. Dependency bumps here are normal
  `deps:`/`chore:` changes. **Any change to `@svgin/react` or
  `@svgin/element` that ships should update this app in the same PR** to demo it.
