# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**mt** is a knowledge management app with spaced repetition. Notes are markdown files stored on the local filesystem (default `~/mt`). The app has a React SPA frontend and an Express API backend, organized as a monorepo with `client/` and `server/` subdirectories.

The project is spec-driven approach with all the features described in 'features.md' being the single source of truth for everything we build.

## Commands

### Setup

```bash
npm install && npm run install-client && npm run install-server
```

### Development

```bash
npm run dev              # Starts both client (Vite :5173) and server (nodemon :3000) concurrently
npm run dev --prefix client   # Client only
npm run dev --prefix server   # Server only
```

### Build & Start

```bash
npm run build            # Builds both client and server
npm run start            # Production start (NODE_ENV=production required)
```

### Type Checking & Linting

```bash
npm run check-types --prefix client
npm run check-types --prefix server
npm run lint --prefix client        # oxlint
```

### Tests (Vitest)

```bash
npm run test --prefix client        # All client tests
npm run test --prefix server        # All server tests
npx vitest run client/src/utils/dates.spec.ts   # Single test file
npm run test:watch --prefix client  # Watch mode
```

### E2E Tests (Playwright)

```bash
npm run e2e                         # Runs against built app on :3310
npx playwright test e2e/tests/notes.spec.ts   # Single e2e test
```

E2E tests auto-start a production server with a temporary `MT_HOME` directory.

## Architecture

### Client (`client/src/`)

- **React 19 + Vite + TypeScript** SPA with SASS styling
- **Dual UI**: `DesktopApp.tsx` (sidebar layout) and `MobileApp.tsx` (bottom nav), selected by user-agent detection in `App.tsx`
- **Routing**: `slim-react-router` with routes defined in each app component
- **State**: Context-based via `StateProvider.tsx` (holds notes, quizzes, questions, etc.) and `TagsProvider.tsx`
- **API client**: Typed functions in `api.ts` that call the server
- **Markdown rendering**: `react-markdown` + `remark-gfm` with custom rehype plugins (`utils/rehype/`) for syntax highlighting and Mermaid diagrams

### Server (`server/src/`)

- **Express 5 + TypeScript** compiled to CommonJS
- **No database** — file-based storage via `FSNotesStore` reading markdown files from `MT_HOME/notes/`
- **Domain structure**: `components/` contains domain modules (notes, questions, quizzes, reviews, sync, tags, timeline, ai, media)
- **API layer**: `api/routes.ts` defines all route handlers; `api/api.ts` orchestrates services
- **AI integration**: `components/ai/` uses Anthropic API for quiz generation (requires `ANTHROPIC_API_KEY`)
- **Build copies templates**: `server/src/templates/` must be copied to `dist/templates` (handled by build script)

### Key Environment Variables

- `MT_HOME` — notes storage directory (default: `~/mt`)
- `MT_PORT` — server port (default: 3000 dev, 3042 Docker)
- `ANTHROPIC_API_KEY` — enables AI quiz generation

### Dev Proxy

In development, Vite proxies `/media` requests to the server. The server URL is configured in `config.json` at the repo root.

## CI Pipeline

CI runs type checking, oxlint (client and server), unit tests (both), then e2e tests, then pushes a Docker image to `hiquest/mt` on Docker Hub (only on pushed `v*` tags). Node 22 in CI.

## TypeScript

Strict mode with `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` enabled (see `tsconfig.base.json`). Both client and server extend this base config.
