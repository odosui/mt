import bodyParser from "body-parser";
import express, { Express } from "express";
import { createCoreApi } from "./api/CoreApi";
import { createFSNotesStore } from "./components/notes/FSNotesStore";

const PORT = process.env.PORT || 3000;

async function main() {
  const app = express();

  app.use(bodyParser.json());

  // allow CORS (for now)
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, OPTIONS",
    );
    next();
  });

  // init out app
  const noteStore = await createFSNotesStore();
  const coreApi = createCoreApi(noteStore);

  // mapping apis
  for (const m of coreApi.routes) {
    const method = m.method.toLowerCase() as keyof Express;

    app[method](m.path, async (req: any, res: any) => {
      const { status, json } = await m.handler({
        pathParams: req.params as Record<string, string>,
        query: req.query as Record<string, string>,
        body: req.body,
      });
      res.status(status).json(json);
    });
  }

  // start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

main();
