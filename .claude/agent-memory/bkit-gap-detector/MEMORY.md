# Gap Detector Memory - KnitCanvas (Crochet)

## Project Overview
- **Name**: KnitCanvas - knitting/crochet pattern editor
- **Stack**: Next.js App Router + TypeScript + Tailwind + React-Konva + Zustand + Supabase
- **Architecture**: Dynamic level (4-layer: Presentation/Application/Domain/Infrastructure)

## Key Paths
- Design doc: `docs/02-design/features/mvp-v1.design.md`
- Source: `src/` (components/editor/, stores/, hooks/, lib/, types/, app/)
- SQL schema: `supabase/schema.sql`
- Analysis output: `docs/03-analysis/mvp-v1.analysis.md`

## Analysis Results (2026-03-10, v2)
- **Match Rate**: 93.0% (107/115 items) -- up from 88.7%
- **Remaining Gaps (3)**: Sentry integration, local temp save, E2E tests
- **Fixed Gaps (6)**: useOnlineStatus, CSP header, useAuthStore, StatusBar, auto-save retry 3x, StatusBar in EditorLayout
- **Strengths**: 7 categories at 100% (Architecture, Data Model, Schema, API, UI/UX, Core Logic, Symbols, Components)
- Auth pages use `app/login/` not `app/(auth)/login/` (route group omitted)
- `.env.local.example` used instead of `.env.example`

## Patterns
- useAuthStore now exists as Zustand store (user/loading state)
- Canvas component uses dynamic import with ssr:false
- Auto-save has isFirstRender guard to prevent initial save
- Auto-save retry uses setInterval with maxRetries=3, 3s interval
- StatusBar integrates useOnlineStatus for offline indicator
- CSP header extended with Supabase connect-src and blob: img-src
