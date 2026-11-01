# CLAUDE.md

## Commands

```bash
pnpm test:run                              # All unit tests, once
pnpm test:run src/lib/utils/format.test.ts # One unit test file
pnpm test:run -t "formatDuration"          # Unit tests matching a name
pnpm test:e2e                              # All E2E tests
pnpm test:e2e tests/e2e/upload.spec.ts     # One E2E file
pnpm check                                 # Type checking
pnpm lint                                  # Prettier check and ESLint
pnpm format                                # Prettier write
```

`pnpm test` starts vitest in watch mode; use `test:run` so the command exits.

## Testing Strategy

- **E2E tests** (`tests/e2e/`): Primary coverage for user flows. Avoid duplicating in unit tests.
- **Unit tests** (`*.test.ts`): Edge cases, complex logic, and scenarios too slow for E2E.
- E2E runs against `pnpm preview` (`wrangler pages dev` on the build), so `_headers` and the CSP are enforced. Playwright reuses whatever already listens on port 4173, and `workerd` can outlive a killed `wrangler`: stop both before a run on a new build.
- After changes: run `pnpm test:run` and `pnpm check`. Before merging to main: run `pnpm test:all`.

## Code Style

- **Svelte 5 runes**: Use `$state`, `$derived` in `.svelte.ts` files for stores
- **Imports**: `#lib/...` for `src/lib` (the `package.json` imports alias), and a `.js` extension on local imports (`from './format.js'`)
- **Types**: Define in `src/lib/types/index.ts`
- **Constants**: UPPER_SNAKE_CASE, define in `src/lib/constants/`. The season year is `TARGET_YEAR` in `src/lib/constants/time.ts`; derive year copy from it or from `selectedYear`, never a literal year.
- **Functions**: Single level of abstraction principle; keep utils pure with no side effects
- **Error types**: Use discriminated unions (`type: 'error-code'`)
- **Comments**: Only when non-obvious; avoid redundant explanations

## Deployment

Cloudflare Pages auto-deploys on push to `main` (Git integration, no CI pipeline). Do not push unless explicitly requested.

Security headers:

- The app is fully prerendered and the worker is routed no paths, so `_headers` is the only source of security headers.
- `csp-script-hashes.ts` adds the hash of SvelteKit's inline bootstrap script to the CSP at build time. Any other inline script is blocked.

Solo project, kept simple: there is no CI. Local git hooks run the checks instead, set up by `simple-git-hooks` in `package.json` and installed by `pnpm install` through `prepare`:

- `pre-commit`: `lint-staged` runs Prettier and ESLint on the staged files.
- `pre-push`: `pnpm check` and `pnpm test:run`.

E2E needs a build and port 4173, so it stays out of the hooks: run `pnpm test:all` before pushing to `main`. Put new automated checks in these hooks, not a CI workflow. After editing the hook config, run `pnpm exec simple-git-hooks`, because the installed hooks only change when it runs.

## Context

- Refer to `docs/prd.md` for product requirements when relevant to the task.
- Refer to `docs/design_guidelines.md` when making any UI changes (components, layouts, text, colors, animations).
