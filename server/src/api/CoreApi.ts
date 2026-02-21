import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { createFSMediaStore } from "../components/media/FSMediaStore";
import { NoteStore } from "../components/notes/NotesStore";
import createQuestionsService from "../components/questions/QuestionService";
import { generateFlashcards } from "../components/questions/flashcardgen";
import { createFSQuizStore } from "../components/quizzes/QuizStore";
import { generateQuiz } from "../components/quizzes/quizgen";
import createReviewService from "../components/reviews/ReviewService";
import { noSkipReviewByTag, requresReview } from "../components/reviews/utils";
import createSyncService from "../components/sync/SyncService";
import { createTagsService } from "../components/tags/TagsService";
import createTimelineService from "../components/timeline/TimelineService";
import { error, ok, safe } from "./helpers";
import { fullView, listView } from "./dto";
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
export const createCoreApi = (noteStore: NoteStore, mtHome: string) => {
  const tagsService = createTagsService(noteStore);
  const reviewService = createReviewService(noteStore);
  const questionsService = createQuestionsService(noteStore);
  const timelineService = createTimelineService(noteStore);
  const syncService = createSyncService(mtHome);
  const mediaStore = createFSMediaStore(mtHome);
  const quizStore = createFSQuizStore(mtHome);

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
          const tlCount = await timelineService.getTimeline();
          const c = {
            ...counts,
            timeline_count: tlCount.length,
          };
          return ok(c);
        });
      },
      list: async (
        tags: string | undefined,
        is_review: string | undefined,
        fav_only: string | undefined,
        query: string | undefined,
      ) => {
        return safe(async () => {
          const res = await noteStore.getNotes(
            tags ?? "",
            is_review === "true",
            fav_only === "true",
            query,
          );

          return ok(res.map((note) => listView(note, query)));
        });
      },
      get: async (id: string) => {
        return safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) {
            return error(404, "Note not found");
          }
          const imageMetas = await mediaStore.getImagesForNote(id);
          return ok(fullView(note, imageMetas));
        });
      },
      create: async (body: string) => {
        return safe(async () => {
          const note = await noteStore.createNote(body);
          const imageMetas = await mediaStore.getImagesForNote(note.id);
          return ok(fullView(note, imageMetas));
        });
      },
      update: async (id: string, body: string) => {
        return safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) {
            return error(404, "Note not found");
          }
          const updated = await noteStore.updateNote(id, { body }, false);
          const imageMetas = await mediaStore.getImagesForNote(id);
          return ok(fullView(updated, imageMetas));
        });
      },
      delete: async (id: string) => {
        return safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) {
            return error(404, "Note not found");
          }
          await noteStore.deleteNote(id);
          return ok({ success: true });
        });
      },
      timeline: async () => {
        return safe(async () => {
          const items = await timelineService.getTimeline();
          return ok(items);
        });
      },
      fav: async (id: string) => {
        return safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) {
            return error(404, "Note not found");
          }
          await noteStore.updateNote(id, { favorite: true }, true);
          return ok({ success: true });
        });
      },
      unfav: async (id: string) => {
        return safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) {
            return error(404, "Note not found");
          }
          await noteStore.updateNote(id, { favorite: false }, true);
          return ok({ success: true });
        });
      },
      pin: async (id: string) => {
        return safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) {
            return error(404, "Note not found");
          }
          await noteStore.updateNote(id, { pinned: true }, true);
          return ok({ success: true });
        });
      },
      unpin: async (id: string) => {
        return safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) {
            return error(404, "Note not found");
          }
          await noteStore.updateNote(id, { pinned: false }, true);
          return ok({ success: true });
        });
      },
      publish: async (
        id: string,
        slug: string,
        title: string,
        description: string,
        category: string,
      ) => {
        return safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) {
            return error(404, "Note not found");
          }
          const updated = await noteStore.updateNote(
            id,
            {
              seo_slug: slug,
              seo_title: title,
              seo_description: description,
              seo_category: category,
              seo_published: true,
            },
            true,
          );
          const imageMetas = await mediaStore.getImagesForNote(id);
          return ok(fullView(updated, imageMetas));
        });
      },
      unpublish: async (id: string) => {
        return safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) {
            return error(404, "Note not found");
          }
          const updated = await noteStore.updateNote(
            id,
            { seo_published: false },
            true,
          );
          const imageMetas = await mediaStore.getImagesForNote(id);
          return ok(fullView(updated, imageMetas));
        });
      },
    },
    reviews: {
      counts: async () => {
        return safe(async () => {
          const notes = await noteStore.getNotes("", false, false);
          const reviewCount = Object.values(notes)
            .filter(requresReview)
            .filter(noSkipReviewByTag).length;

          const qCount = (await questionsService.getReviewableQuestions())
            .length;

          return ok({ counts: { notes: reviewCount, questions: qCount } });
        });
      },
      done: async (id: string) => {
        return safe(async () => {
          const note = await reviewService.reviewNote(id);
          const imageMetas = await mediaStore.getImagesForNote(id);
          return ok(fullView(note, imageMetas));
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
    sync: {
      status: async () => {
        return safe(async () => {
          const status = await syncService.getStatus();
          return ok(status);
        });
      },
    },
    images: {
      list: async (noteId: string) => {
        return safe(async () => {
          const images = await mediaStore.listImages(noteId);
          return ok(images);
        });
      },
      upload: async (noteId: string, filename: string, data: Buffer) => {
        return safe(async () => {
          const image = await mediaStore.uploadImage(noteId, filename, data);
          return ok(image);
        });
      },
      delete: async (imageId: string) => {
        return safe(async () => {
          await mediaStore.deleteImage(imageId);
          return ok({ success: true });
        });
      },
    },
  };

  const routes: RouteConfig[] = [
    {
      method: "get",
      path: "/api/health",
      handler: async () => api.health(),
    },
    {
      method: "get",
      path: "/api/sync/status",
      handler: async () => await api.sync.status(),
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
      path: "/api/notes/timeline",
      handler: async () => await api.notes.timeline(),
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
        await api.notes.list(
          query.tags,
          query.is_review,
          query.fav_only,
          query.query,
        ),
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
      method: "delete",
      path: "/api/notes/:id",
      handler: async ({ pathParams }) =>
        await api.notes.delete(pathParams.id ?? ""),
    },
    {
      method: "post",
      path: "/api/notes/:id/fav",
      handler: async ({ pathParams }) =>
        await api.notes.fav(pathParams.id ?? ""),
    },
    {
      method: "post",
      path: "/api/notes/:id/unfav",
      handler: async ({ pathParams }) =>
        await api.notes.unfav(pathParams.id ?? ""),
    },
    {
      method: "post",
      path: "/api/notes/:id/pin",
      handler: async ({ pathParams }) =>
        await api.notes.pin(pathParams.id ?? ""),
    },
    {
      method: "post",
      path: "/api/notes/:id/unpin",
      handler: async ({ pathParams }) =>
        await api.notes.unpin(pathParams.id ?? ""),
    },
    {
      method: "post",
      path: "/api/notes/:id/publish",
      handler: async ({ pathParams, body }) =>
        await api.notes.publish(
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
      handler: async ({ pathParams }) =>
        await api.notes.unpublish(pathParams.id ?? ""),
    },
    {
      method: "get",
      path: "/api/note_images",
      handler: async ({ query }) => await api.images.list(query.note_sid ?? ""),
    },
    {
      method: "delete",
      path: "/api/note_images/:id",
      handler: async ({ pathParams }) =>
        await api.images.delete(pathParams.id ?? ""),
    },
    {
      method: "post",
      path: "/api/reviews/:id/done",
      handler: async ({ pathParams }) =>
        await api.reviews.done(pathParams.id ?? ""),
    },
    {
      method: "get",
      path: "/api/questions",
      handler: async ({ query }) => {
        const noteId = query.note_id;

        const isReview = query.for_review === "true";

        return safe(async () => {
          if (noteId) {
            const qs = await questionsService.getQuestions(noteId);
            return ok(qs);
          }

          if (isReview) {
            const qs = await questionsService.getReviewableQuestions();
            return ok(qs);
          } else {
            const qs = await questionsService.getAllQuestions();
            return ok(qs);
          }
        });
      },
    },
    {
      method: "post",
      path: "/api/questions",
      handler: async ({ body }) => {
        const question = body.question;
        const answer = body.answer;
        const noteId = body.note_id;

        if (!noteId || !question || !answer) {
          return error(400, "Missing required fields");
        }

        return safe(async () => {
          const q = await questionsService.createQuestion(
            noteId,
            question,
            answer,
          );
          return ok(q);
        });
      },
    },
    {
      method: "post",
      path: "/api/questions/review",
      handler: async ({ body }) => {
        const question = body.question;
        const noteId = body.note_id;
        const op = body.op;

        if (!noteId || !question || !op) {
          return error(400, "Missing required fields");
        }

        if (op !== "good" && op !== "bad") {
          return error(400, "Invalid operation: must be 'good' or 'bad'");
        }

        return safe(async () => {
          if (op === "good") {
            await questionsService.reviewGood(noteId, question);
          } else {
            await questionsService.reviewBad(noteId, question);
          }
          return ok({ success: true });
        });
      },
    },
    {
      method: "post",
      path: "/api/questions/edit",
      handler: async ({ body }) => {
        const noteId = body.note_id;
        const oldQuestion = body.old_question;
        const question = body.question;
        const answer = body.answer;

        if (!noteId || !oldQuestion || !question || !answer) {
          return error(400, "Missing required fields");
        }

        return safe(async () => {
          const q = await questionsService.updateQuestion(
            noteId,
            oldQuestion,
            question,
            answer,
          );
          return ok(q);
        });
      },
    },
    {
      method: "get",
      path: "/api/quizzes",
      handler: async ({ query }) => {
        const noteId = query.note_id;
        if (!noteId) {
          return error(400, "Missing required field: note_id");
        }
        return safe(async () => {
          const quizzes = await quizStore.listByNote(noteId);
          return ok(quizzes);
        });
      },
    },
    {
      method: "get",
      path: "/api/quizzes/:noteId/:quizId",
      handler: async ({ pathParams }) => {
        const { noteId, quizId } = pathParams;
        if (!noteId || !quizId) {
          return error(400, "Missing required params: noteId, quizId");
        }
        return safe(async () => {
          const quiz = await quizStore.getOne(noteId, parseInt(quizId, 10));
          if (!quiz) {
            return error(404, "Quiz not found");
          }
          return ok(quiz);
        });
      },
    },
    {
      method: "post",
      path: "/api/quizzes/generate",
      handler: async ({ body }) => {
        const text = body.text;
        const numberOfQuestions = body.number_of_questions;
        const title = body.title;
        const noteId = body.note_id;
        const extraInstructions = body.extra_instructions;
        const model = body.model;

        if (!text || !numberOfQuestions || !noteId) {
          return error(
            400,
            "Missing required fields: text, number_of_questions, and note_id",
          );
        }

        if (numberOfQuestions < 1 || numberOfQuestions > 100) {
          return error(400, "number_of_questions must be between 1 and 100");
        }

        if (text.length > 65536) {
          return error(400, "text must be at most 65536 characters");
        }

        return safe(async () => {
          const [items, err] = await generateQuiz(
            text,
            numberOfQuestions,
            extraInstructions || undefined,
            model || undefined,
          );
          if (err) {
            return error(500, err);
          }
          const saved = await quizStore.save(noteId, title, items!);
          return ok(saved);
        });
      },
    },
    {
      method: "post",
      path: "/api/questions/ai",
      handler: async ({ body }) => {
        const text = body.text;
        if (!text) {
          return error(400, "Missing required field: text");
        }
        return safe(async () => {
          const [cards, err] = await generateFlashcards(text);
          if (err) {
            return error(500, err);
          }
          return ok(cards);
        });
      },
    },
    {
      method: "post",
      path: "/api/questions/del",
      handler: async ({ body }) => {
        const noteId = body.note_id;
        const question = body.question;

        if (!noteId || !question) {
          return error(400, "Missing required fields");
        }

        return safe(async () => {
          await questionsService.deleteQuestion(noteId, question);
          return ok({ success: true });
        });
      },
    },
    {
      method: "post",
      path: "/api/quizzes/:noteId/:quizId/result",
      handler: async ({ pathParams, body }) => {
        const { noteId, quizId } = pathParams;
        const score = body.score;

        if (!noteId || !quizId) {
          return error(400, "Missing required params: noteId, quizId");
        }

        if (typeof score !== "number" || score < 0 || score > 100) {
          return error(
            400,
            "Invalid score: must be a number between 0 and 100",
          );
        }

        return safe(async () => {
          const quiz = await quizStore.saveResult(
            noteId,
            parseInt(quizId, 10),
            score,
          );
          if (!quiz) {
            return error(404, "Quiz not found");
          }
          return ok(quiz);
        });
      },
    },
  ];

  return {
    ...api,
    routes,
  };
};
