import { Express } from "express";
import { ChatSession } from "../../shared/types";
import { IConfigFile } from "./config_file";
import { CHAT_STORE, PROJECTS } from ".";

export function addRestRoutes(app: Express, config: IConfigFile | null) {
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

  app.get("/api/projects", async (_req, res) => {
    if (!config) {
      res.status(500).json({ error: "Config file not present" });
      return;
    }

    res.json(Object.values(PROJECTS));
  });

  app.get("/api/projects/:id", async (req, res) => {
    const id = req.params.id;
    const project = PROJECTS[id];

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json(project);
  });

  app.get("/api/profiles", async (_req, res) => {
    if (!config) {
      res.status(500).json({ error: "Config file not present" });
      return;
    }

    try {
      const profiles = Object.entries(config.profiles).map(([name, p]) => {
        return {
          name,
          vendor: p.vendor,
          model: p.model,
        };
      });
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/chat/:id", async (req, res) => {
    const id = req.params.id;
    const chat = CHAT_STORE[id];

    if (!chat) {
      res.status(404).json({ error: "Chat not found" });
      return;
    }

    const data: ChatSession = {
      id,
      name: chat.profile,
      serverUrl: chat.worker.serverUrl(),
    };

    res.json(data);
  });
}
