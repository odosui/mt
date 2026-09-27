import { error } from "./helpers.ts";
import { type Api } from "./api.ts";
import { isImageId, isNoteId, isQuizId } from "./ids.ts";

const invalidId = () => error(400, "Invalid id");

export type RouteConfig = {
  method: "get" | "post" | "patch" | "delete";
  path: string;
  multipart?: boolean;
  handler: (params: {
    pathParams: Record<string, string>;
    query: Record<string, string>;
    body: any;
    file?: { originalname: string; buffer: Buffer };
  }) => Promise<{ status: number; json: unknown }>;
};

export const createRoutes = (api: Api): RouteConfig[] => [
  { method: "get", path: "/api/health", handler: async () => api.health() },
  {
    method: "get",
    path: "/api/sync/status",
    handler: async () => api.sync.status(),
  },
  { method: "get", path: "/api/tags", handler: async () => api.tags.get() },
  {
    method: "get",
    path: "/api/notes/counts",
    handler: async () => api.notes.counts(),
  },
  {
    method: "get",
    path: "/api/notes/timeline",
    handler: async () => api.notes.timeline(),
  },
  {
    method: "get",
    path: "/api/notes/refs",
    handler: async () => api.notes.refs(),
  },
  {
    method: "get",
    path: "/api/reviews",
    handler: async () => api.reviews.counts(),
  },
  {
    method: "get",
    path: "/api/notes",
    handler: async ({ query }) =>
      api.notes.list(query.tags, query.is_review, query.fav_only, query.query),
  },
  {
    method: "get",
    path: "/api/notes/:id",
    handler: async ({ pathParams: { id } }) =>
      isNoteId(id) ? api.notes.get(id) : invalidId(),
  },
  {
    method: "get",
    path: "/api/notes/:id/backlinks",
    handler: async ({ pathParams: { id } }) =>
      isNoteId(id) ? api.notes.backlinks(id) : invalidId(),
  },
  {
    method: "post",
    path: "/api/notes",
    handler: async ({ body }) => api.notes.create(body.body),
  },
  {
    method: "patch",
    path: "/api/notes/:id",
    handler: async ({ pathParams: { id }, body }) =>
      isNoteId(id) ? api.notes.update(id, body.body) : invalidId(),
  },
  {
    method: "delete",
    path: "/api/notes/:id",
    handler: async ({ pathParams: { id } }) =>
      isNoteId(id) ? api.notes.delete(id) : invalidId(),
  },
  {
    method: "post",
    path: "/api/notes/:id/fav",
    handler: async ({ pathParams: { id } }) =>
      isNoteId(id) ? api.notes.fav(id) : invalidId(),
  },
  {
    method: "post",
    path: "/api/notes/:id/unfav",
    handler: async ({ pathParams: { id } }) =>
      isNoteId(id) ? api.notes.unfav(id) : invalidId(),
  },
  {
    method: "post",
    path: "/api/notes/:id/pin",
    handler: async ({ pathParams: { id } }) =>
      isNoteId(id) ? api.notes.pin(id) : invalidId(),
  },
  {
    method: "post",
    path: "/api/notes/:id/unpin",
    handler: async ({ pathParams: { id } }) =>
      isNoteId(id) ? api.notes.unpin(id) : invalidId(),
  },
  {
    method: "post",
    path: "/api/notes/:id/publish",
    handler: async ({ pathParams: { id }, body }) =>
      isNoteId(id)
        ? api.notes.publish(
            id,
            body.slug ?? "",
            body.seo_title ?? "",
            body.seo_description ?? "",
            body.seo_category ?? "",
          )
        : invalidId(),
  },
  {
    method: "post",
    path: "/api/notes/:id/unpublish",
    handler: async ({ pathParams: { id } }) =>
      isNoteId(id) ? api.notes.unpublish(id) : invalidId(),
  },
  {
    method: "get",
    path: "/api/note_images",
    handler: async ({ query: { note_sid: noteId } }) =>
      isNoteId(noteId) ? api.images.list(noteId) : invalidId(),
  },
  {
    method: "post",
    path: "/api/note_images",
    multipart: true,
    handler: async ({ body, file }) => {
      const noteId = body.note_sid;
      if (!noteId || !file) return error(400, "Missing note_sid or image file");
      if (!isNoteId(noteId)) return invalidId();
      return api.images.upload(noteId, file.originalname, file.buffer);
    },
  },
  {
    method: "delete",
    path: "/api/note_images/:id",
    handler: async ({ pathParams: { id } }) =>
      isImageId(id) ? api.images.delete(id) : invalidId(),
  },
  {
    method: "post",
    path: "/api/reviews/:id/done",
    handler: async ({ pathParams: { id } }) =>
      isNoteId(id) ? api.reviews.done(id) : invalidId(),
  },
  {
    method: "get",
    path: "/api/questions",
    handler: async ({ query }) => {
      const { note_id: noteId, for_review } = query;
      if (noteId) {
        return isNoteId(noteId) ? api.questions.list(noteId) : invalidId();
      }
      if (for_review === "true") return api.questions.listReviewable();
      return api.questions.listAll();
    },
  },
  {
    method: "post",
    path: "/api/questions",
    handler: async ({ body }) => {
      const { question, answer, note_id: noteId } = body;
      if (!noteId || !question || !answer)
        return error(400, "Missing required fields");
      if (!isNoteId(noteId)) return invalidId();
      return api.questions.create(noteId, question, answer);
    },
  },
  {
    method: "post",
    path: "/api/questions/review",
    handler: async ({ body }) => {
      const { question, note_id: noteId, op } = body;
      if (!noteId || !question || !op)
        return error(400, "Missing required fields");
      if (!isNoteId(noteId)) return invalidId();
      if (op !== "good" && op !== "bad")
        return error(400, "Invalid operation: must be 'good' or 'bad'");
      return api.questions.review(noteId, question, op);
    },
  },
  {
    method: "post",
    path: "/api/questions/edit",
    handler: async ({ body }) => {
      const {
        note_id: noteId,
        old_question: oldQuestion,
        question,
        answer,
      } = body;
      if (!noteId || !oldQuestion || !question || !answer)
        return error(400, "Missing required fields");
      if (!isNoteId(noteId)) return invalidId();
      return api.questions.update(noteId, oldQuestion, question, answer);
    },
  },
  {
    method: "post",
    path: "/api/questions/ai",
    handler: async ({ body }) => {
      const { text } = body;
      if (!text) return error(400, "Missing required field: text");
      return api.questions.generateAI(text);
    },
  },
  {
    method: "post",
    path: "/api/questions/del",
    handler: async ({ body }) => {
      const { note_id: noteId, question } = body;
      if (!noteId || !question) return error(400, "Missing required fields");
      if (!isNoteId(noteId)) return invalidId();
      return api.questions.delete(noteId, question);
    },
  },
  {
    method: "get",
    path: "/api/quizzes",
    handler: async ({ query }) => {
      const { note_id: noteId } = query;
      if (!noteId) return error(400, "Missing required field: note_id");
      if (!isNoteId(noteId)) return invalidId();
      return api.quizzes.list(noteId);
    },
  },
  {
    method: "get",
    path: "/api/quizzes/:noteId/:quizId",
    handler: async ({ pathParams }) => {
      const { noteId, quizId } = pathParams;
      if (!noteId || !quizId)
        return error(400, "Missing required params: noteId, quizId");
      if (!isNoteId(noteId) || !isQuizId(quizId)) return invalidId();
      return api.quizzes.get(noteId, parseInt(quizId, 10));
    },
  },
  {
    method: "post",
    path: "/api/quizzes/generate",
    handler: async ({ body }) => {
      const {
        text,
        number_of_questions: numberOfQuestions,
        title,
        note_id: noteId,
        extra_instructions: extraInstructions,
        model,
      } = body;
      if (!text || !numberOfQuestions || !noteId)
        return error(
          400,
          "Missing required fields: text, number_of_questions, and note_id",
        );
      if (!isNoteId(noteId)) return invalidId();
      if (numberOfQuestions < 1 || numberOfQuestions > 100)
        return error(400, "number_of_questions must be between 1 and 100");
      if (text.length > 65536)
        return error(400, "text must be at most 65536 characters");
      return api.quizzes.generate(
        text,
        numberOfQuestions,
        noteId,
        title,
        extraInstructions || undefined,
        model || undefined,
      );
    },
  },
  {
    method: "post",
    path: "/api/quizzes/:noteId/:quizId/result",
    handler: async ({ pathParams, body }) => {
      const { noteId, quizId } = pathParams;
      const { score } = body;
      if (!noteId || !quizId)
        return error(400, "Missing required params: noteId, quizId");
      if (!isNoteId(noteId) || !isQuizId(quizId)) return invalidId();
      if (typeof score !== "number" || score < 0 || score > 100)
        return error(400, "Invalid score: must be a number between 0 and 100");
      return api.quizzes.saveResult(noteId, parseInt(quizId, 10), score);
    },
  },
];
