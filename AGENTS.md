# AGENTS.md

## Commands
```bash
pnpm test:run                          # Run all unit tests once
pnpm test -- src/lib/utils/format.test.ts  # Run single test file
pnpm test -- -t "formatTime"           # Run tests matching pattern
pnpm test:e2e                          # Run all E2E tests
pnpm test:e2e -- tests/e2e/upload.spec.ts  # Run single E2E file
pnpm check                             # TypeScript type checking
```

## Testing Strategy
- **E2E tests** (`tests/e2e/`): Primary coverage for user flows. Avoid duplicating in unit tests.
- **Unit tests** (`*.test.ts`): Edge cases, complex logic, and scenarios too slow for E2E.
- After changes: run `pnpm test:run` and `pnpm check`. Before merging to main: run `pnpm test:all`.

## Code Style
- **Svelte 5 runes**: Use `$state`, `$derived` in `.svelte.ts` files for stores
- **Imports**: Use `.js` extension for local imports (`from './format.js'`)
- **Types**: Define in `src/lib/types/index.ts`, use explicit types over `any`
- **Naming**: camelCase functions/variables, PascalCase types/components; use clear names over comments
- **Constants**: UPPER_SNAKE_CASE, define in `src/lib/constants/`
- **Functions**: Single level of abstraction principle; keep utils pure with no side effects
- **Error types**: Use discriminated unions (`type: 'error-code'`)
- **Comments**: Only when non-obvious; avoid redundant explanations

## Deployment
Cloudflare Pages auto-deploys on push to `main`. Do not push unless explicitly requested.

## Context
- Refer to `docs/prd.md` for product requirements when relevant to the task.
- Refer to `docs/design_guidelines.md` when making any UI changes (components, layouts, text, colors, animations).

