/**
 * Mirrors `.d.ts` files from `backend/dist` into the same relative paths under `backend/`
 * (beside `.ts` sources). Run after `pnpm run build` so output reflects `tsc` + `tsc-alias`.
 *
 * Strips `.js` from relative module specifiers so declarations resolve like editor/tsconfig,
 * and removes `//# sourceMappingURL` lines (maps stay relative to dist/).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");
const distRoot = path.join(backendRoot, "dist");

/**
 * @param {string} dir
 * @param {string[]} parts path segments under dist/
 */
async function collectDtsRelativePaths(dir, parts = []) {
  /** @type {string[]} */
  const out = [];
  let dirents;
  try {
    dirents = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const d of dirents) {
    const next = [...parts, d.name];
    if (d.isDirectory()) {
      if (d.name === "tests") continue;
      out.push(...(await collectDtsRelativePaths(path.join(dir, d.name), next)));
    } else if (d.name.endsWith(".d.ts") && !d.name.endsWith(".d.ts.map")) {
      out.push(path.join(...next));
    }
  }
  return out;
}

/** @param {string} content */
function transformDeclaration(content) {
  let text = content.replace(/\.js(?=["'])/g, "");
  text = text.replace(/\r?\n\/\/# sourceMappingURL=[^\r\n]*/g, "");
  return text;
}

async function main() {
  try {
    await fs.access(distRoot);
  } catch {
    console.error("backend/dist missing. Run `pnpm run build` in backend first.");
    process.exit(1);
  }

  const relPaths = await collectDtsRelativePaths(distRoot);
  let count = 0;
  for (const rel of relPaths) {
    const srcPath = path.join(distRoot, rel);
    const destPath = path.join(backendRoot, rel);
    let text = await fs.readFile(srcPath, "utf8");
    text = transformDeclaration(text);
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, text, "utf8");
    count++;
  }
  console.log(`Synced ${count} declaration files from dist/ next to backend sources.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
