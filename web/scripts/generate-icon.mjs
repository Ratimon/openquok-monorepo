import { copyFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(webRoot, "package.json"));
const pwagBin = require.resolve("pwag/bin/index.js");

const r = spawnSync(
	process.execPath,
	[pwagBin, "static/icon.svg", "src/web-config.json"],
	{ cwd: webRoot, stdio: "inherit" }
);
if (r.status !== 0) {
	process.exit(r.status === null ? 1 : r.status);
}

copyFileSync(
	join(webRoot, "static/pwa/favicon-512.png"),
	join(webRoot, "static/maskable_icon_512x512.png")
);
