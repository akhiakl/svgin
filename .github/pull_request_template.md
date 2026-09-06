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
- [ ] Commit type/scope accurately reflects the change (`fix`, `feat`, etc.) —
      release-please derives the version bump and changelog straight from
      conventional commits, no separate release step to remember
- [ ] If this changes `svgin-react` or `svgin-element` behavior, `apps/tryit`
      is updated to demo it

## Notes for reviewers

<!-- Anything that needs extra attention, tradeoffs made, follow-ups. -->
