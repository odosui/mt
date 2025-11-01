import { Express } from "express";
import { createCoreApi } from "../CoreApi";
import { NoteStore } from "../../components/notes/NotesStore";

export function bootExpress(app: Express, noteStore: NoteStore) {
  const CoreApi = createCoreApi(noteStore);

  app.get("/", (_req, res) => {
    const { status, json } = CoreApi.health();
    res.status(status).json(json);
  });

  app.get("/api/tags", async (_req, res) => {
    const { status, json } = await CoreApi.tags.get();
    res.status(status).json(json);
  });

  app.get("/api/notes/counts", async (_req, res) => {
    const { status, json } = await CoreApi.notes.counts();
    res.status(status).json(json);
  });

  app.get("/api/reviews", async (_req, res) => {
    const { status, json } = await CoreApi.reviews.counts();
    res.status(status).json(json);
  });

  app.get("/api/notes", async (_req, res) => {
    const { tags, is_review } = _req.query;

    const { status, json } = await CoreApi.notes.list(
      tags?.toString(),
      is_review?.toString(),
    );
    res.status(status).json(json);
  });

  app.get("/api/notes/:id", async (req, res) => {
    const { status, json } = await CoreApi.notes.get(req.params.id);
    res.status(status).json(json);
  });

  app.post("/api/notes", async (req, res) => {
    const { status, json } = await CoreApi.notes.create(req.body.body);
    res.status(status).json(json);
  });

  app.get("/api/questions", async (_req, res) => {
    // stub
    res.status(200).json([]);
  });

  app.get("/api/note_images", async (_req, res) => {
    // stub
    res.status(200).json([]);
  });

  app.post("/api/reviews/:id/done", async (req, res) => {
    const { status, json } = await CoreApi.reviews.done(req.params.id);
    res.status(status).json(json);
  });
}
