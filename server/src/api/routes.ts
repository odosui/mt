import { error } from "./helpers";
import { Api } from "./api";

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
    handler: async ({ pathParams }) => api.notes.get(pathParams.id ?? ""),
  },
  {
    method: "post",
    path: "/api/notes",
    handler: async ({ body }) => api.notes.create(body.body),
  },
  {
    method: "patch",
    path: "/api/notes/:id",
    handler: async ({ pathParams, body }) =>
      api.notes.update(pathParams.id ?? "", body.body),
  },
  {
    method: "delete",
    path: "/api/notes/:id",
    handler: async ({ pathParams }) => api.notes.delete(pathParams.id ?? ""),
  },
  {
    method: "post",
    path: "/api/notes/:id/fav",
    handler: async ({ pathParams }) => api.notes.fav(pathParams.id ?? ""),
  },
  {
    method: "post",
    path: "/api/notes/:id/unfav",
    handler: async ({ pathParams }) => api.notes.unfav(pathParams.id ?? ""),
  },
  {
    method: "post",
    path: "/api/notes/:id/pin",
    handler: async ({ pathParams }) => api.notes.pin(pathParams.id ?? ""),
  },
  {
    method: "post",
    path: "/api/notes/:id/unpin",
    handler: async ({ pathParams }) => api.notes.unpin(pathParams.id ?? ""),
  },
  {
    method: "post",
    path: "/api/notes/:id/publish",
    handler: async ({ pathParams, body }) =>
      api.notes.publish(
        pathParams.id ?? "",
        body.slug ?? "",
        body.seo_title ?? "",
        body.seo_description ?? "",
        body.seo_category ?? "",
      ),
  },
  {
    method: "post",
    path: "/api/notes/:id/unpublish",
    handler: async ({ pathParams }) => api.notes.unpublish(pathParams.id ?? ""),
  },
  {
    method: "get",
    path: "/api/note_images",
    handler: async ({ query }) => api.images.list(query.note_sid ?? ""),
  },
  {
    method: "post",
    path: "/api/note_images",
    multipart: true,
    handler: async ({ body, file }) => {
      const noteId = body.note_sid;
      if (!noteId || !file) return error(400, "Missing note_sid or image file");
      return api.images.upload(noteId, file.originalname, file.buffer);
    },
  },
  {
    method: "delete",
    path: "/api/note_images/:id",
    handler: async ({ pathParams }) => api.images.delete(pathParams.id ?? ""),
  },
  {
    method: "post",
    path: "/api/reviews/:id/done",
    handler: async ({ pathParams }) => api.reviews.done(pathParams.id ?? ""),
  },
  {
    method: "get",
    path: "/api/questions",
    handler: async ({ query }) => {
      const { note_id: noteId, for_review } = query;
      if (noteId) return api.questions.list(noteId);
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
      return api.questions.delete(noteId, question);
    },
  },
  {
    method: "get",
    path: "/api/quizzes",
    handler: async ({ query }) => {
      const { note_id: noteId } = query;
      if (!noteId) return error(400, "Missing required field: note_id");
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
      if (typeof score !== "number" || score < 0 || score > 100)
        return error(400, "Invalid score: must be a number between 0 and 100");
      return api.quizzes.saveResult(noteId, parseInt(quizId, 10), score);
    },
  },
];
