## What & why

<!-- What does this change do, and why is it needed? -->

## Type of change

- [ ] Fix
- [ ] Feature / enhancement
- [ ] Performance
- [ ] Refactor / cleanup
- [ ] Tests
- [ ] CI / tooling
- [ ] Docs

## Checklist

- [ ] `pnpm turbo run lint` passes
- [ ] `pnpm turbo run typecheck` and `pnpm turbo run typecheck:test` pass
- [ ] `pnpm turbo run test` passes, and new behavior has test coverage
- [ ] `pnpm turbo run build` succeeds and `pnpm turbo run size` stays within budget
- [ ] For anything touching sanitization/caching: I considered whether this
      could weaken sanitization guarantees or leak an unsanitized/custom
      result across callers via the shared cache
- [ ] Added a changeset (`pnpm changeset`) if this touches a publishable
      package (`packages/react`, `packages/element`) — once those go public
- [ ] If this changes `svgin-react` or `svgin-element` behavior, `apps/tryit`
      is updated to demo it

## Notes for reviewers

<!-- Anything that needs extra attention, tradeoffs made, follow-ups. -->
