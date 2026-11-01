# AGENTS.md

## Commands
```bash
pnpm test:run                              # All unit tests, once
pnpm test:run src/lib/utils/format.test.ts # One unit test file
pnpm test:run -t "formatDuration"          # Unit tests matching a name
pnpm test:e2e                              # All E2E tests
pnpm test:e2e tests/e2e/upload.spec.ts     # One E2E file
pnpm check                                 # Type checking
```
`pnpm test` starts vitest in watch mode; use `test:run` so the command exits.

## Testing Strategy
- **E2E tests** (`tests/e2e/`): Primary coverage for user flows. Avoid duplicating in unit tests.
- **Unit tests** (`*.test.ts`): Edge cases, complex logic, and scenarios too slow for E2E.
- After changes: run `pnpm test:run` and `pnpm check`. Before merging to main: run `pnpm test:all`.

## Code Style
- **Svelte 5 runes**: Use `$state`, `$derived` in `.svelte.ts` files for stores
- **Imports**: `#lib/...` for `src/lib` (the `package.json` imports alias), and a `.js` extension on local imports (`from './format.js'`)
- **Types**: Define in `src/lib/types/index.ts`
- **Constants**: UPPER_SNAKE_CASE, define in `src/lib/constants/`. The season year is `TARGET_YEAR` in `src/lib/constants/time.ts`; derive year copy from it or from `selectedYear`, never a literal year.
- **Utils**: Keep pure, with no side effects
- **Error types**: Use discriminated unions (`type: 'error-code'`)

## Deployment
Cloudflare Pages auto-deploys on push to `main` (Git integration, no CI pipeline). Do not push unless explicitly requested.

Solo project, kept simple: there is no CI, so run the checks above locally before pushing. Add new automated checks as local git hooks rather than a CI workflow.

## Context
- Refer to `docs/prd.md` for product requirements when relevant to the task.
- Refer to `docs/design_guidelines.md` when making any UI changes (components, layouts, text, colors, animations).
