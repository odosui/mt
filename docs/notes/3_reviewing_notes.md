---
created_at: 2026-02-10T21
updated_at: 2026-02-11T07:29:28.914Z
favorite: false
last_reviewed_at:
level: 0
seo_title: Reviewing Notes
seo_description: Learn about reviewing notes in `mt` to enhance your learning and retention. Discover how spaced repetition works and how it can help you remember information more effectively.
seo_published: true
seo_category: docs
seo_slug: reviewing-notes
---

# Reviewing notes

As I wrote in the [introduction](1), `mt` marries a knowledge base with a spaced repetition.

What is exactly is **spaced repetition**? It's an evidence-based learning technique that improves long-term retention. We review material at systematically increasing intervals, directly countering the "forgetting curve". `mt` manages this for you. The notes for review pops up in the "Review" tab.

![Reviewing a note](3__review.png)

How exactly you are going to review the note is up to you. Usually, you would simply read the note, and many times update it with new information. To review the note, just click "Mark Reviewed" button.

Every time you review the note, the note's level is increased by one. Internally, `mt` tracks the review history with just two fields in note metadata:

```
last_reviewed_at: 2025-11-27
level: 4
```

The review schedule starts in 7 days. Next one is in 15, and next one is in 30. The current level icon in the note toolbar, displays the current level. If you click on it, you can see the entire schedule.

![Review schedule](3__review_schedule.png)

## Next

Now that you know, how the review schedule works, we can proceed to other tools. [Starting with the flashcards](4).

