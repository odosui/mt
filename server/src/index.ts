import { buildStaticSite } from "./build";
import { startServer } from "./server";
import { parseArgs } from "./utils/cmd";

const BUILD_FLAG = "build-static-site";
const MT_HOME_GLAF = "mt-home";

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  const mtHome: string = parsed[MT_HOME_GLAF] || process.env.MT_HOME;

  if (parsed[BUILD_FLAG]) {
    await buildStaticSite(mtHome);
  } else {
    startServer(mtHome);
  }
}

main();
