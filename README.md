# mt 💡

Knowledge management meets spaced repetition.

**mt** helps organize and manage knowledge efficiently, helps remember and make sense of information over time.

## Features

- Unbeatable UX that just works.
- Markdown-based notes (extensible with plugins) with support for syntax highlighting, [Mermaid](https://mermaid-js.github.io/mermaid/#/) diagrams, and more.
- Spaced repetition system for notes.
- Anki-like flashcards for active recall practice.
- Local storage of notes in plain markdown files.
- Git integration for version control and syncing.
- Cross-linking between notes for building a knowledge graph.
- Full-text search and tagging for easy organization and retrieval.

## Getting Started

It is organized around **notes**, which are just pieces of information in plain text or [markdown](https://en.wikipedia.org/wiki/Markdown). These are stored on your machine as plain markdown files.

Notes are popping up for **review** according to a predefined schedule (aka spaced repetition). Reviewing your notes helps you remember them better, gives a chance to improve them, and update with new information.

Notes can also include flashcards for active recall practice.

## Getting Started

```bash
npm install
npm run dev
```

This will both server (port 3000) and client (port 5173). The default directory for notes is `~/mt` ( or `C:\Users\YourName\mt` on Windows).

## How to use

### Markdown

tbd

### Reviewing

Notes you write popup for a review first time in 7 days, than in 15 days, in 30, and so on. Press "Mark as Reviewed" button to review it.

The note will ascend to the next level. There are 10 levels in total. After reaching the last level, the note will not popup for review anymore.

If you click on the current level in the note toolbar, you can see the whole schedule.

### Tags and full-text search

TBD

### Cross-linking notes and preview

tbd

### Mermaid

tbd

### Focus mode

tbd

## Data/platform independence principle

tbd

## Storage

All your notes are stored in a single folder on your computer. It is your task to back them up, or sync between devices. I usually create a git repo, and sync it with a private GitHub repo.

## Media

tbd
