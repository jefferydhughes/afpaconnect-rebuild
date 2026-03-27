---
name: testing
description: "**Test Suite Runner & Author**: Run, extend, and maintain the Vitest test suite for the AFPA Connect franchise platform. Use this skill whenever the user mentions testing, tests, test coverage, test failures, writing tests, running tests, unit tests, integration tests, TDD, QA, or wants to verify that code changes haven't broken anything. Also trigger when the user asks to 'check if everything works', 'make sure nothing is broken', 'validate the changes', or references any test file. If a .test.ts file is involved in any way, use this skill."
---

# AFPA Connect — Testing Skill

This skill manages the Vitest test suite for the AFPA Connect franchise platform (Next.js + Supabase). It covers running existing tests, writing new tests, debugging failures, and maintaining test coverage across all layers of the application.

## Test Infrastructure

The test suite lives in the project root and uses:

- **Framework**: Vitest 4.x with jsdom environment
- **Config**: `vitest.config.ts`
- **Path alias**: `@/` maps to `./src/`
- **Globals**: `describe`, `it`, `expect`, `vi` are globally available
- **Note**: Vitest is available globally via npx. If `npx vitest` fails, use the Sohala monorepo binary as fallback:
  `/sessions/modest-sleepy-volta/mnt/https---github.com-jefferydhughes-sohala-monorepo-main/apps/live-app/node_modules/.bin/vitest`

### Commands

```bash
# Run all tests once
npx vitest run

# Run in watch mode
npx vitest

# Run with coverage
npx vitest run --coverage

# Run a specific test file
npx vitest run src/lib/__tests__/utils.test.ts

# Run tests matching a pattern
npx vitest run -t "formatCurrency"
```

## Test File Locations

Tests live as siblings to source files in `__tests__/` directories:

```
src/
├── lib/
│   ├── __tests__/
│   │   ├── utils.test.ts                  ← Utility functions (31 tests)
│   │   ├── franchise-categories.test.ts   ← Category registry, labels, slugs (16 tests)
│   │   └── require-role.test.ts           ← Auth guards, role enforcement, redirects (15 tests)
│   ├── franchise-categories.ts
│   ├── require-role.ts
│   ├── utils.ts
│   └── supabase/
│       ├── browser.ts
│       └── server.ts
├── app/
│   └── api/                               ← 20+ API routes (not yet tested)
│       ├── admin/
│       ├── analytics/
│       ├── auth/
│       ├── contact/
│       ├── fit360/
│       ├── franchise-applications/
│       └── quiz/
```

## What's Tested (62 tests across 3 files)

### 1. Utility Functions (`utils.test.ts`) — 31 tests
- `formatCurrency()`: round numbers, large numbers with commas, null/undefined → "N/A", zero
- `formatInvestmentRange()`: both min+max, min-only, max-only, neither (contact for pricing), zero edge case
- `slugify()`: spaces → hyphens, special chars removal, hyphen collapse, lowercase, empty string
- `getMatchTier()`: Excellent (≥70), Good (50–69), Consider Carefully (<50), boundary values (49/50/70), bgColor+borderColor presence
- `getBudgetRangeLabel()`: all 5 known ranges, unknown fallback
- `getBusinessModelLabel()`: all 5 known models, unknown fallback
- `getTimeCommitmentLabel()`: all 3 known commitments, unknown fallback
- `getExperienceLevelLabel()`: all 3 known levels, unknown fallback

### 2. Franchise Categories (`franchise-categories.test.ts`) — 16 tests
- `FRANCHISE_CATEGORIES`: 20 categories, value+label strings, unique values, snake_case format, core verticals present, "other" last
- `getCategoryLabel()`: known categories, title-cased fallback for unknown, em dash for null/undefined/empty
- `toCategorySlug()`: display name → slug, whitespace trimming, separator collapse, single word, numbers

### 3. Auth Role Guards (`require-role.test.ts`) — 15 tests
- `getAuthUserRole()`: authenticated (user+profile), unauthenticated (null+null)
- `requireAdmin()`: correct role passes, no user → login redirect, wrong role → /dashboard, null profile → /dashboard, custom redirect
- `requireAdvisor()`: correct role passes, no user → redirect, wrong role → redirect
- `requireFranchisor()`: correct role passes, no user → redirect, wrong role → redirect
- `requireFranchiseRep()`: correct role passes, no user → redirect, wrong role → redirect

## Writing New Tests

When adding tests for a new module, follow this pattern:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock external dependencies (Supabase, OpenAI, Next.js)
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: vi.fn() },
    from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: mockData, error: null }) }) }) }),
  }),
  createAdminClient: () => ({
    from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: mockData, error: null }) }) }) }),
  }),
}))

describe('ModuleName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does the thing', () => {
    // Arrange → Act → Assert
  })
})
```

### Mocking Guidelines

- **Supabase auth**: Mock `createClient()` returning `{ auth: { getUser: mockFn } }`
- **Supabase admin**: Mock `createAdminClient()` with chained `.from().select().eq().single()`
- **Next.js navigation**: Mock `next/navigation` with `redirect` that throws (simulating Next.js behavior)
- **OpenAI**: Mock `openai` default export with `chat.completions.create()`
- **Fetch**: Use `vi.fn()` on `global.fetch` for external API calls
- **Cookies**: Mock `next/headers` with `cookies()` returning get/set
- **Time**: Use `vi.useFakeTimers()` / `vi.setSystemTime()` / `vi.useRealTimers()`

### Coverage Priorities for Future Tests

High-value areas not yet covered that should be added next:

1. **Quiz API route** (`src/app/api/quiz/route.ts`) — Quiz submission, scoring, match calculation
2. **Fit360 assessment** (`src/app/api/fit360/`) — Franchise fit scoring, recommendation engine
3. **Admin franchise CRUD** (`src/app/api/admin/franchises/`) — Create, update, delete operations
4. **Analytics API** (`src/app/api/analytics/`) — Dashboard metrics, advisor attribution tracking
5. **Auth callback** (`src/app/api/auth/callback/route.ts`) — OAuth flow, session creation
6. **Contact form** (`src/app/api/contact/route.ts`) — Validation, email dispatch
7. **Franchise applications** (`src/app/api/franchise-applications/`) — Application flow, status transitions
8. **Supabase clients** (`src/lib/supabase/`) — Browser vs server client creation, env var handling
9. **Component tests** — Add React Testing Library for UI components (quiz flow, directory filters, dashboard)
10. **E2E tests** — Playwright for critical user journeys (quiz → results → advisor contact)

## Debugging Failures

When a test fails:

1. Run the specific file: `npx vitest run src/path/to/file.test.ts`
2. Check the assertion error — Vitest shows expected vs received
3. For import errors: verify the path alias `@/` resolves correctly in `vitest.config.ts`
4. For mock issues: ensure `vi.mock()` is at the top level (it hoists automatically)
5. For async issues: use `async/await` inside `it()` blocks, not `describe()` blocks
6. For Next.js redirect mocking: redirect must throw (Next.js uses thrown responses internally)
