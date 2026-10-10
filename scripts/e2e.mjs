import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { startAndTest } from "start-server-and-test";

const require = createRequire(import.meta.url);
const production = process.argv.includes("--production");
// Keep the test server and build separate from a developer's running app.
process.env.INVOICE_E2E = "1";
process.env.WAIT_ON_TIMEOUT = "120000";

if (production) {
  execFileSync(process.execPath, [require.resolve("next/dist/bin/next"), "build"], { stdio: "inherit" });
}

try {
  await startAndTest({
    services: [{ start: `next ${production ? "start" : "dev"} --port 3100`, url: "http://localhost:3100" }],
    test: "cypress run --browser chrome",
    namedArguments: { expect: 200 },
  });
} catch (error) {
  console.error(error.shortMessage ?? error.message);
  process.exitCode = 1;
}
