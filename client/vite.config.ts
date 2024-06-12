import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

// read the config file
const CONFIG_FILE_PATH = "../config.json";
const config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, "utf8"));
const apiServerUrl = config.apiServerUrl;

export default defineConfig({
  plugins: [react()],
  define: {
    API_SERVER_URL: JSON.stringify(apiServerUrl),
  },
});
