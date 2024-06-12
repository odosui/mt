import express from "express";
import ConfigFile, { IConfigFile } from "./config_file";
import { addRestRoutes } from "./rest";

const PORT = process.env.PORT || 3000;

async function main() {
  const config: IConfigFile | null = await ConfigFile.readConfig();

  const app = express();
  addRestRoutes(app, config);

  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

main();
