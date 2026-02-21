import dayjs from "dayjs";
import { ImageMetas } from "../components/media/MediaStore";
import { Note } from "../components/notes/NotesStore";
import { extractSnippetWithContext } from "../components/notes/utils";
import {
  nextReviewPoints,
  noSkipReviewByTag,
  requresReview,
} from "../components/reviews/utils";

// ===============
// Notes
// ===============

export function listView(n: Note, query?: string) {
  return {
    id: n.id,
    level: n.level,
    sid: parseInt(n.id, 10),
    snippet: extractSnippetWithContext(n.body, query),
    tags: n.tags,
    updated_at_in_words: dayjs(n.updated_at).fromNow(),
    favorite: n.favorite,
    pinned: n.pinned,
  };
}

export function fullView(n: Note, imageMetas: ImageMetas = {}) {
  return {
    ...listView(n), // fullView doesn't need query context
    body: n.body,
    updated_at: n.updated_at,
    last_reviewed_at: n.last_reviewed_at,
    created_at: n.created_at,
    needs_review: requresReview(n) && noSkipReviewByTag(n),
    upcoming_reviews_in_days: nextReviewPoints(n),
    image_metas: imageMetas,

    published: n.seo_published,
    question_count: 0,
    seo_description: n.seo_description || null,
    seo_title: n.seo_title || null,
    seo_category: n.seo_category || null,
    seo_url: null,
    sid: parseInt(n.id, 10),
    slug: n.seo_slug || null,
  };
}
