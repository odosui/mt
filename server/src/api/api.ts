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

export const createApi = (noteStore: NoteStore, mtHome: string) => {
  const tagsService = createTagsService(noteStore);
  const reviewService = createReviewService(noteStore);
  const questionsService = createQuestionsService(noteStore);
  const timelineService = createTimelineService(noteStore);
  const syncService = createSyncService(mtHome);
  const mediaStore = createFSMediaStore(mtHome);
  const quizStore = createFSQuizStore(mtHome);

  return {
    health: () => ok({ status: "ok" }),
    tags: {
      get: async () => safe(async () => ok(await tagsService.allTags())),
    },
    notes: {
      counts: async () =>
        safe(async () => {
          const counts = await noteStore.noteCounts();
          const tlCount = await timelineService.getTimeline();
          return ok({ ...counts, timeline_count: tlCount.length });
        }),
      list: async (
        tags: string | undefined,
        is_review: string | undefined,
        fav_only: string | undefined,
        query: string | undefined,
      ) =>
        safe(async () => {
          const res = await noteStore.getNotes(
            tags ?? "",
            is_review === "true",
            fav_only === "true",
            query,
          );
          return ok(res.map((note) => listView(note, query)));
        }),
      get: async (id: string) =>
        safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) return error(404, "Note not found");
          const imageMetas = await mediaStore.getImagesForNote(id);
          return ok(fullView(note, imageMetas));
        }),
      create: async (body: string) =>
        safe(async () => {
          const note = await noteStore.createNote(body);
          const imageMetas = await mediaStore.getImagesForNote(note.id);
          return ok(fullView(note, imageMetas));
        }),
      update: async (id: string, body: string) =>
        safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) return error(404, "Note not found");
          const updated = await noteStore.updateNote(id, { body }, false);
          const imageMetas = await mediaStore.getImagesForNote(id);
          return ok(fullView(updated, imageMetas));
        }),
      delete: async (id: string) =>
        safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) return error(404, "Note not found");
          await noteStore.deleteNote(id);
          return ok({ success: true });
        }),
      timeline: async () =>
        safe(async () => ok(await timelineService.getTimeline())),
      fav: async (id: string) =>
        safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) return error(404, "Note not found");
          await noteStore.updateNote(id, { favorite: true }, true);
          return ok({ success: true });
        }),
      unfav: async (id: string) =>
        safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) return error(404, "Note not found");
          await noteStore.updateNote(id, { favorite: false }, true);
          return ok({ success: true });
        }),
      pin: async (id: string) =>
        safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) return error(404, "Note not found");
          await noteStore.updateNote(id, { pinned: true }, true);
          return ok({ success: true });
        }),
      unpin: async (id: string) =>
        safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) return error(404, "Note not found");
          await noteStore.updateNote(id, { pinned: false }, true);
          return ok({ success: true });
        }),
      publish: async (
        id: string,
        slug: string,
        title: string,
        description: string,
        category: string,
      ) =>
        safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) return error(404, "Note not found");
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
        }),
      unpublish: async (id: string) =>
        safe(async () => {
          const note = await noteStore.getNote(id);
          if (!note) return error(404, "Note not found");
          const updated = await noteStore.updateNote(
            id,
            { seo_published: false },
            true,
          );
          const imageMetas = await mediaStore.getImagesForNote(id);
          return ok(fullView(updated, imageMetas));
        }),
    },
    reviews: {
      counts: async () =>
        safe(async () => {
          const notes = await noteStore.getNotes("", false, false);
          const reviewCount = Object.values(notes)
            .filter(requresReview)
            .filter(noSkipReviewByTag).length;
          const qCount = (await questionsService.getReviewableQuestions())
            .length;
          return ok({ counts: { notes: reviewCount, questions: qCount } });
        }),
      done: async (id: string) =>
        safe(async () => {
          const note = await reviewService.reviewNote(id);
          const imageMetas = await mediaStore.getImagesForNote(id);
          return ok(fullView(note, imageMetas));
        }),
    },
    questions: {
      list: async (noteId: string) =>
        safe(async () => ok(await questionsService.getQuestions(noteId))),
      listAll: async () =>
        safe(async () => ok(await questionsService.getAllQuestions())),
      listReviewable: async () =>
        safe(async () => ok(await questionsService.getReviewableQuestions())),
      create: async (noteId: string, question: string, answer: string) =>
        safe(async () =>
          ok(await questionsService.createQuestion(noteId, question, answer)),
        ),
      update: async (
        noteId: string,
        oldQuestion: string,
        question: string,
        answer: string,
      ) =>
        safe(async () =>
          ok(
            await questionsService.updateQuestion(
              noteId,
              oldQuestion,
              question,
              answer,
            ),
          ),
        ),
      delete: async (noteId: string, question: string) =>
        safe(async () => {
          await questionsService.deleteQuestion(noteId, question);
          return ok({ success: true });
        }),
      review: async (noteId: string, question: string, op: "good" | "bad") =>
        safe(async () => {
          if (op === "good") {
            await questionsService.reviewGood(noteId, question);
          } else {
            await questionsService.reviewBad(noteId, question);
          }
          return ok({ success: true });
        }),
      generateAI: async (text: string) =>
        safe(async () => {
          const [cards, err] = await generateFlashcards(text);
          if (err) return error(500, err);
          return ok(cards);
        }),
    },
    quizzes: {
      list: async (noteId: string) =>
        safe(async () => ok(await quizStore.listByNote(noteId))),
      get: async (noteId: string, quizId: number) =>
        safe(async () => {
          const quiz = await quizStore.getOne(noteId, quizId);
          if (!quiz) return error(404, "Quiz not found");
          return ok(quiz);
        }),
      generate: async (
        text: string,
        numberOfQuestions: number,
        noteId: string,
        title: string,
        extraInstructions?: string,
        model?: string,
      ) =>
        safe(async () => {
          const [items, err] = await generateQuiz(
            text,
            numberOfQuestions,
            extraInstructions,
            model,
          );
          if (err) return error(500, err);
          const saved = await quizStore.save(noteId, title, items!);
          return ok(saved);
        }),
      saveResult: async (noteId: string, quizId: number, score: number) =>
        safe(async () => {
          const quiz = await quizStore.saveResult(noteId, quizId, score);
          if (!quiz) return error(404, "Quiz not found");
          return ok(quiz);
        }),
    },
    sync: {
      status: async () => safe(async () => ok(await syncService.getStatus())),
    },
    images: {
      list: async (noteId: string) =>
        safe(async () => ok(await mediaStore.listImages(noteId))),
      upload: async (noteId: string, filename: string, data: Buffer) =>
        safe(async () =>
          ok(await mediaStore.uploadImage(noteId, filename, data)),
        ),
      delete: async (imageId: string) =>
        safe(async () => {
          await mediaStore.deleteImage(imageId);
          return ok({ success: true });
        }),
    },
  };
};

export type Api = ReturnType<typeof createApi>;
