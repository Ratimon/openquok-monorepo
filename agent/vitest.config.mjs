import path from "node:path";
import { fileURLToPath } from "node:url";

const agentDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Plain ESM only: do not `import "vitest/config"` here. Vitest pre-bundles this file under
 * `agent/node_modules/.vite-temp/` and would resolve `vitest` from `agent/`, where it is not
 * installed (the binary lives in `web/node_modules/vitest` via `run-vitest.mjs`).
 */
export default {
  root: agentDir,
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/e2e/**/*.e2e.test.ts"],
    passWithNoTests: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
};
