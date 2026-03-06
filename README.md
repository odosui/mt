# mt 💡

[![CI](https://github.com/odosui/mt/actions/workflows/ci.yml/badge.svg)](https://github.com/odosui/mt/actions/workflows/ci.yml)

Knowledge management meets spaced repetition.

**mt** helps you organize and retain knowledge over time.

[Read the docs](https://docs.mindthis.io/)

![mt showcase](media/main.png)

## Overview

mt is built around **notes**, which are simple [markdown](https://en.wikipedia.org/wiki/Markdown) files stored locally on your computer.

Notes pop up for **review** according to a predefined schedule (aka spaced repetition). Reviewing your notes helps you remember them better, gives you a chance to improve them, and update them with new relevant information.

Add **flashcards** relevant to each note, review them Anki-style for active recall.

You can also create quizzes for yourself using AI (an API key is required).

### Documentation

- [Learn about mt](https://docs.mindthis.io/introduction.html)
- [Create your first note](https://docs.mindthis.io/create-first-note.html)
- [Reviewing](https://docs.mindthis.io/reviewing-notes.html)
- [Flashcards](https://docs.mindthis.io/flashcards.html)
- [Practical tips](https://docs.mindthis.io/what-makes-a-good-knowledge-graph.html)

## Features

- Intuitive but powerful UI.
- Markdown-based notes (extensible with plugins) with support for syntax highlighting, [Mermaid](https://mermaid-js.github.io/mermaid/#/) diagrams, and more.
- [Spaced repetition](https://en.wikipedia.org/wiki/Spaced_repetition) for entire notes, flashcards (like [Anki](https://apps.ankiweb.net/)), and AI-powered quizzes (API key required).
- Your data is stored locally on your machine.
- Git integration for version control and syncing.
- Cross-linking between notes for building a knowledge graph.
- Full-text search and tagging for easy organization and retrieval.

## I just want to try it out

A web version is coming soon.

## Installation (Docker)

The easiest way to run mt is with Docker Compose.

1. Download [`docker-compose.yml`](docker-compose.yml) from this repository.
2. Optionally, set the `ANTHROPIC_API_KEY` variable to enable AI-powered features.
3. Run:

```bash
docker compose up -d
```

Your notes are stored in `./mt-data` on your host machine (created automatically).

Open your browser and go to `http://localhost:3042`.

## Installation (Manual)

```bash
# npm modules
npm install
npm run install-client
npm run install-server

# build it
npm run build

# start
node server/dist/index.js
```

## Quick start

Open your browser and go to `http://localhost:8042`. Your notes will be stored in `~/mt` (or `C:\Users\YourName\mt` on Windows) by default.

[Read how to add a first note here](https://docs.mindthis.io/create-first-note.html)

### Optional: git integration

Once you add a note you can initialize a git repository `git init` inside your `mt` home directory (`~/mt` by default). As for now, `mt` doesn't commit changes for you, so if you care about versioning, do it manually. I have a private GitHub repo where I push my changes to keep them backed up.

## Using a start up script (MacOS/Linux only)

You can use the provided startup script (`./scripts/mt.sh`) to launch the application as a daemon easily (works on Unix-like systems).

```bash
# start|stop|restart|status
./scripts/mt.sh start
```

```bash
# add an alias
alias mt="$PATH_TO_MT/scripts/mt.sh"
```

## Contributing

Contributions are welcome! Please open issues and pull requests.

### AI usage

AI usage is allowed. Just make sure you review the code before submitting.
