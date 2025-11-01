import dayjs from "dayjs";
import { Note, NoteStore } from "../components/notes/NotesStore";
import createReviewService from "../components/reviews/ReviewService";
import { nextReviewPoints, requresReview } from "../components/reviews/utils";
import { createTagsService } from "../components/tags/TagsService";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

// the Api class is the server-agnostic entrypoint
// for the API functionality.
export const createCoreApi = (noteStore: NoteStore) => {
  const tagsService = createTagsService(noteStore);
  const reviewService = createReviewService(noteStore);

  const api = {
    health: () => {
      return ok({ status: "ok" });
    },
    tags: {
      get: async () => {
        return safe(async () => {
          const tags = await tagsService.allTags();
          return ok(tags);
        });
      },
    },
    notes: {
      counts: async () => {
        return safe(async () => {
          const counts = await noteStore.noteCounts();
          return ok(counts);
        });
      },
      list: async (tags: string | undefined, is_review: string | undefined) => {
        return safe(async () => {
          const res = await noteStore.getNotes(
            tags ?? "",
            is_review === "true",
          );

          return ok(res.map(listView));
        });
      },
      get: async (id: string) => {
        return safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) {
            return error(404, "Note not found");
          }
          return ok(fullView(note));
        });
      },
      create: async (body: string) => {
        return safe(async () => {
          const note = await noteStore.createNote(body);
          return ok(fullView(note));
        });
      },
    },
    reviews: {
      counts: async () => {
        return safe(async () => {
          const counts = await reviewService.reviewCounts();
          return ok(counts);
        });
      },
      done: async (id: string) => {
        return safe(async () => {
          const note = await reviewService.reviewNote(id);
          return ok(fullView(note));
        });
      },
    },
  };

  return api;
};

function ok(json: unknown) {
  return {
    status: 200,
    json,
  };
}

function error(status: number, message: string) {
  return {
    status,
    json: { error: message },
  };
}

// Helper function to handle error handling
async function safe(op: () => Promise<{ status: number; json: unknown }>) {
  try {
    return await op();
  } catch (e) {
    return error(500, "Unexpected error occurred");
  }
}

function listView(n: Note) {
  return {
    id: n.id,
    level: n.level,
    sid: parseInt(n.id, 10),
    snippet: n.body.split("\n").slice(0, 3).join("\n"),
    tags: n.tags,
    updated_at_in_words: dayjs(n.updated_at).fromNow(),
  };
}

function fullView(n: Note) {
  return {
    ...listView(n),
    body: n.body,
    updated_at: n.updated_at,
    last_reviewed_at: n.last_reviewed_at,
    created_at: n.created_at,
    favorite: false,
    needs_review: requresReview(n),
    published: false,
    question_count: 0,
    seo_description: null,
    seo_title: null,
    seo_url: null,
    sid: parseInt(n.id, 10),
    slug: null,
    snippet: "",
    upcoming_reviews_in_days: nextReviewPoints(n),
  };
}
