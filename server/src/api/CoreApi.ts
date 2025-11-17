import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Note, NoteStore } from "../components/notes/NotesStore";
import createQuestionsService from "../components/questions/QuestionService";
import createReviewService from "../components/reviews/ReviewService";
import { nextReviewPoints, requresReview } from "../components/reviews/utils";
import { createTagsService } from "../components/tags/TagsService";
dayjs.extend(relativeTime);

// Route configuration type
export type RouteConfig = {
  method: "get" | "post" | "patch" | "delete";
  path: string;
  handler: (params: {
    pathParams: Record<string, string>;
    query: Record<string, string>;
    body: any;
  }) => Promise<{ status: number; json: unknown }>;
};

// the Api class is the server-agnostic entrypoint
// for the API functionality.
export const createCoreApi = (noteStore: NoteStore) => {
  const tagsService = createTagsService(noteStore);
  const reviewService = createReviewService(noteStore);
  const questionsService = createQuestionsService(noteStore);

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
      list: async (
        tags: string | undefined,
        is_review: string | undefined,
        fav_only: string | undefined,
      ) => {
        return safe(async () => {
          const res = await noteStore.getNotes(
            tags ?? "",
            is_review === "true",
            fav_only === "true",
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
      update: async (id: string, body: string) => {
        return safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) {
            return error(404, "Note not found");
          }
          const updated = await noteStore.updateNote(id, { body }, false);
          return ok(fullView(updated));
        });
      },
    },
    reviews: {
      counts: async () => {
        return safe(async () => {
          const notes = await noteStore.getNotes("", false, false);
          const reviewCount = Object.values(notes).filter(requresReview).length;

          const qCount = (await questionsService.getReviewableQuestions())
            .length;

          return ok({ counts: { notes: reviewCount, questions: qCount } });
        });
      },
      done: async (id: string) => {
        return safe(async () => {
          const note = await reviewService.reviewNote(id);
          return ok(fullView(note));
        });
      },
    },
    questions: {
      list: async (noteId: string) => {
        return safe(async () => {
          const res = await questionsService.getQuestions(noteId);
          // stub
          return ok(res);
        });
      },
    },
  };

  const routes: RouteConfig[] = [
    {
      method: "get",
      path: "/",
      handler: async () => api.health(),
    },
    {
      method: "get",
      path: "/api/tags",
      handler: async () => await api.tags.get(),
    },
    {
      method: "get",
      path: "/api/notes/counts",
      handler: async () => await api.notes.counts(),
    },
    {
      method: "get",
      path: "/api/reviews",
      handler: async () => await api.reviews.counts(),
    },
    {
      method: "get",
      path: "/api/notes",
      handler: async ({ query }) =>
        await api.notes.list(query.tags, query.is_review, query.fav_only),
    },
    {
      method: "get",
      path: "/api/notes/:id",
      handler: async ({ pathParams }) =>
        await api.notes.get(pathParams.id ?? ""),
    },
    {
      method: "post",
      path: "/api/notes",
      handler: async ({ body }) => await api.notes.create(body.body),
    },
    {
      method: "patch",
      path: "/api/notes/:id",
      handler: async ({ pathParams, body }) =>
        await api.notes.update(pathParams.id ?? "", body.body),
    },
    {
      method: "get",
      path: "/api/questions",
      handler: async ({ query }) =>
        await api.questions.list(query.note_id || ""),
    },
    {
      method: "get",
      path: "/api/note_images",
      handler: async () => ok([]),
    },
    {
      method: "post",
      path: "/api/reviews/:id/done",
      handler: async ({ pathParams }) =>
        await api.reviews.done(pathParams.id ?? ""),
    },
  ];

  return {
    ...api,
    routes,
  };
};

// Helper function to handle error handling
async function safe(op: () => Promise<{ status: number; json: unknown }>) {
  try {
    return await op();
  } catch (e) {
    return error(500, "Unexpected error occurred");
  }
}

// ===============
// RESPONSES
// ===============

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

// ===============
// VIEWS
// ===============

function listView(n: Note) {
  return {
    id: n.id,
    level: n.level,
    sid: parseInt(n.id, 10),
    snippet: n.body.split("\n").slice(0, 3).join("\n"),
    tags: n.tags,
    updated_at_in_words: dayjs(n.updated_at).fromNow(),
    favorite: n.favorite,
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
