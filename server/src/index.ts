import { buildStaticSite } from "./build.ts";
import { startServer } from "./server.ts";
import { parseArgs } from "./utils/cmd.ts";

const BUILD_FLAG = "build-static-site";
const MT_HOME_GLAF = "mt-home";

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  const mtHome: string = parsed[MT_HOME_GLAF] || process.env.MT_HOME;

  if (parsed[BUILD_FLAG]) {
    const outDir = parsed[BUILD_FLAG];
    if (typeof outDir !== "string") {
      console.error("Usage: --build-static-site <output-dir>");
      process.exit(1);
    }
    await buildStaticSite(mtHome, outDir);
  } else {
    startServer(mtHome);
  }
}

main();
