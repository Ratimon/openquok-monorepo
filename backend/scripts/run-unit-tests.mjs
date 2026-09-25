/**
 * Backend unit test runner.
 *
 * - No extra args: all `*.unit.test.ts` (excludes stripe.unit.test.ts via Jest flag).
 * - Extra args: run a subset only (file path or name fragment). Does not combine with the
 *   full-suite `unit.test.ts` pattern — Jest would ignore narrow positional args otherwise.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..");
const jestBin = path.join(backendRoot, "node_modules", "jest", "bin", "jest.js");

const extra = process.argv.slice(2).filter((arg) => arg !== "--");

const jestArgs = [
    "--testPathIgnorePatterns=stripe.unit.test.ts",
    "--no-coverage",
    "--runInBand",
];

if (extra.length === 0) {
    jestArgs.push("--testPathPattern=unit\\.test\\.ts");
} else {
    for (const arg of extra) {
        if (arg.startsWith("-")) {
            jestArgs.push(arg);
        } else if (arg.includes("/") || arg.endsWith(".ts")) {
            jestArgs.push(arg);
        } else {
            jestArgs.push("--testPathPattern", arg);
        }
    }
}

const result = spawnSync(process.execPath, [jestBin, ...jestArgs], {
    cwd: backendRoot,
    stdio: "inherit",
    env: process.env,
});

process.exit(result.status ?? 1);
