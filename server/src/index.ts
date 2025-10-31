import bodyParser from "body-parser";
import express from "express";
import { bootExpress } from "./api/adapters/express";

const PORT = process.env.PORT || 3000;

async function main() {
  const app = express();

  app.use(bodyParser.json());

  // allow CORS (for now)
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  bootExpress(app);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

main();
