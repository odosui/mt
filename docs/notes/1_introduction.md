---
created_at: 2026-02-09
updated_at: 2026-02-10T20:48:23.996Z
favorite: false
last_reviewed_at: 2026-02-09
level: 1
seo_title: Introduction
seo_description: A brief intro into what's mt is and why to use it.
seo_published: true
seo_category: docs
seo_slug: introduction
---
# Introduction

`mt` is a tool that help us facilitate the learning process and organize the knowledge efficiently. In other words, it's a "knowledge manager meets spaced repetition" kind of tool.

![mt's UI interface](1__mt.png)

`mt` provides a set of tools on top of your notes (spaced-repetition, [Anki](https://apps.ankiweb.net/)-like flashcards, quizes, etc.). It uses AI where it can help, without messing up with the knowledge acquisition process.

But the main goal of `mt` is this — help you **learn** and **retain** information effectively.

In the heart of it, `mt` is just an interface to markdown files that are stored in a directory on your computer. Markdown files are surprizingly powerful. Not only they let us structure the information using headers, lists, tables, etc., but they are also easy to extend. We support code blocks with syntax highlighting, mermaid diagrams, and more.

Learn more in [Create Your First Note](1) section.

Once you add a note it enters a review schedule, that is the system reminds you to review the note at optimal intervals to maximize retention. Reviewing a note is as simple as opening it, reading it, and marking it as reviewed. For more information on how the review schedule works, check the [reviewing section](#reviewing).

Two others important features of `mt` are flashcards and quizes.

Flashcards are a great way to test your knowledge and reinforce what you've learned. If you're familiar with Anki-like card, you'll feel right at home. Learn more about flashcards in the [flashcards section](#flashcards).

Quizes are generated automatically base on provided text (using LLMs). For example, I use all the time by pasting the entire chapters of the books I read, and take the quizes to test my understanding of the material. Learn more about quizes in the [quizes section](#quizes).

Next step: [Getting started](...).

## Contents

Introduction
Getting started: installation, starting the app, etc.
Markdown: creating your first note, review schedule, plain text, syntax, mermaid, tags
Reviewing
Flashcards
Quizes
Timeline
Favorite/Pinned/Focus mode
How to build a good knowledge graph (links)
Public pages / blog
Tips and tricks: how to persist, using git, etc.
How To?

## Markdown

As we already mentioned, `mt` is built on top of markdown files. The markdown files are stored in a directory you specify (`~/mt` by default), and are plain text files with some `mt`-specific metadata.

## Features