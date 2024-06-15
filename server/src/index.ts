import express from "express";
import LocalEngine from "./LocalEngine";

const PORT = process.env.PORT || 3000;

async function main() {
  const e = new LocalEngine();
  await e.init();

  const app = express();

  // allow CORS
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  // Serve static files or APIs
  app.get("/", (_req, res) => {
    res.json({ status: "OK" });
  });

  app.get("/api/tags", async (_req, res) => {
    res.json(e.allTags());
  });

  app.get("/api/notes/counts", async (_req, res) => {
    res.json(e.noteCounts());
  });

  app.get("/api/reviews", async (_req, res) => {
    res.json(e.reviewCounts());
  });

  app.get("/api/notes", async (_req, res) => {
    // query, tags, is_review, fav_only, page, per_page
    res.json(e.notes());
  });

  app.get("/api/notes/:id", async (req, res) => {
    const n = e.note(req.params.id);

    if (!n) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    res.json(n);
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

main();
