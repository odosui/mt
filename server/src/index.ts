import bodyParser from "body-parser";
import express, { Express } from "express";
import path from "path";
import { createCoreApi } from "./api/CoreApi";
import { createFSNotesStore } from "./components/notes/FSNotesStore";
import { parseArgs } from "./utils/cmd";

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const BUILD_FLAG = "build-static-site";
const MT_HOME_GLAF = "mt-home";

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  const mtHome: string = parsed[MT_HOME_GLAF] || process.env.MT_HOME;

  if (parsed[BUILD_FLAG]) {
    build();
  } else {
    startServer(mtHome);
  }
}

main();

async function build() {
  console.log("Building static site...");
  // TODO: implement me
}

async function startServer(mtHome: string) {
  const app = express();

  app.use(bodyParser.json());

  // allow CORS (only in development)
  if (NODE_ENV === "development") {
    applyDevCors(app);
  }

  // init out app
  const noteStore = await createFSNotesStore(mtHome);
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

  // serve static files in production
  if (NODE_ENV === "production") {
    const clientBuildPath = path.join(__dirname, "../../client/dist");
    app.use(express.static(clientBuildPath));

    // handle SPA routing - all non-API routes return index.html
    app.get("/*", (_req, res) => {
      res.sendFile(path.join(clientBuildPath, "index.html"));
    });
  }

  // start the server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (${NODE_ENV} mode)`);
  });
}

function applyDevCors(app: Express) {
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, PUT, OPTIONS",
    );
    next();
  });
}
