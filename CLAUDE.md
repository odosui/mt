# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**mt** is a knowledge management application combining note-taking with spaced repetition. Notes are stored as plain markdown files on the local filesystem and reviewed according to a predefined schedule to aid retention.

## Development Commands

### Starting the application
```bash
npm run dev
```
This starts both the server (port 3000) and client (port 5173) concurrently.

### Building
```bash
# Client build
npm run build --prefix client
```

### Testing
```bash
# Run all tests
npm run test --prefix client
npm run test --prefix server

# Run specific test file
npx vitest run <path-to-test-file> --prefix client
npx vitest run <path-to-test-file> --prefix server
```

### Linting
```bash
npm run lint --prefix client
```

## Architecture

### Monorepo Structure

The project is organized as a monorepo with three main parts:
- **Root**: Contains `package.json` with the main dev script and `config.json` for API server URL
- **Client** (`client/`): React + TypeScript + Vite frontend
- **Server** (`server/`): Express + TypeScript backend

### Server Architecture

The server follows a layered architecture with clear separation of concerns:

**Storage Layer** (`server/src/components/notes/FSNotesStore.ts`):
- Notes are stored as markdown files in `~/mt/notes/` (or `C:\Users\YourName\mt` on Windows)
- Each note is a `.md` file with frontmatter containing metadata (level, created_at, updated_at, last_reviewed_at, favorite)
- The `FSNotesStore` provides the `NoteStore` interface for CRUD operations
- Tags are extracted from the note body by parsing `#tag` syntax (excluding `##` markdown headers)

**Business Logic Layer** (`server/src/api/CoreApi.ts`):
- `CoreApi` is the server-agnostic entrypoint for all API functionality
- Coordinates between different services (tags, reviews, notes)
- Returns standardized response objects with `{ status, json }` format
- All async operations are wrapped in a `safe()` helper for error handling

**Adapter Layer** (`server/src/api/adapters/express.ts`):
- `bootExpress()` function maps Express routes to CoreApi methods
- Keeps the core API independent of the HTTP framework

**Domain Services**:
- `ReviewService` (`server/src/components/reviews/`): Manages spaced repetition logic
- `TagsService` (`server/src/components/tags/`): Handles tag aggregation and queries

### Spaced Repetition System

The review system (`server/src/components/reviews/utils.ts`) implements a 10-level progression:
- **Levels 0-9**: Each level has a specific review period (7, 15, 30, 30, 45, 45, 60, 60, 90, 180 days)
- **Level 10**: Maximum level, no further reviews required
- `daysTillNextReview()`: Calculates days remaining until next review (negative = overdue)
- `requresReview()`: Returns true when days till next review <= 0
- `nextReviewPoints()`: Returns upcoming review schedule for a note

When a note is reviewed (`reviewNote()`), its level increments and `last_reviewed_at` is updated.

### Client Architecture

**Entry Points** (`client/src/entrypoints/`):
- Different entry points for desktop vs mobile rendering
- `startApp()` bootstraps the React application

**State Management**:
- Uses React state and context (not Redux/MobX)
- API calls centralized in `client/src/api.ts`

**API Client** (`client/src/api.ts`):
- All backend communication goes through this module
- Uses global `window.API_SERVER_URL` set via Vite config from `config.json`
- Handles CSRF tokens and request formatting

**Pages** (`client/src/pages/`):
- Timeline: Chronological view of notes
- Notes: Note listing and filtering
- Board: Canvas-like board for organizing notes
- FlashCards: Active recall practice interface
- Settings: Application configuration

**Components** (`client/src/components/`):
- Editor: Markdown editing functionality
- Preview: Markdown rendering with support for Mermaid diagrams, code highlighting (highlight.js), and GFM (GitHub Flavored Markdown)
- Note: Note display and metadata components
- Sidebar: Navigation and filtering

### Data Model

**Note Structure** (see `client/src/types.ts` and `server/src/components/notes/NotesStore.ts`):

### Configuration

- **API URL**: Set in `config.json` at project root
- **Notes Directory**: Hardcoded to `~/mt/notes/` in `FSNotesStore.ts`
- **CORS**: Currently allows `http://localhost:5173` (see `server/src/index.ts`)

### Key Dependencies

**Client**:
- React 18 with react-router-dom for routing
- react-markdown with remark-gfm for markdown rendering
- Mermaid for diagram rendering
- highlight.js for code syntax highlighting
- date-fns for date utilities
- motion for animations

**Server**:
- Express 5 for HTTP server
- dayjs for date manipulation
- ts-node + nodemon for development

**Testing**:
- vitest for both client and server tests
