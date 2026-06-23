#!/usr/bin/env node
/**
 * Generate GitHub release notes for sdk-v* or cli-v* tags.
 *
 * Usage:
 *   node scripts/release-notes.mjs cli-v0.0.8
 *   node scripts/release-notes.mjs sdk-v0.0.9 --out /tmp/notes.md
 *   pnpm release:notes cli-v0.0.8
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = "Ratimon/openquok-monorepo";

const PACKAGES = {
    cli: {
        tagPrefix: "cli-v",
        scopePath: "agent/",
        name: "@openquok/auto-cli",
        install: (version) => `npm install -g @openquok/auto-cli@${version}`,
        indexPath: null,
    },
    sdk: {
        tagPrefix: "sdk-v",
        scopePath: "sdk/",
        name: "@openquok/node-sdk",
        install: (version) => `npm install @openquok/node-sdk@${version}`,
        indexPath: "sdk/src/index.ts",
    },
};

function git(...args) {
    return execFileSync("git", args, { encoding: "utf8", cwd: path.join(__dirname, "..") }).trim();
}

function parseTag(tag) {
    const match = tag.match(/^(cli|sdk)-v(\d+\.\d+\.\d+)$/);
    if (!match) {
        throw new Error(`Expected tag like cli-v0.0.8 or sdk-v0.0.9, got: ${tag}`);
    }
    return { kind: match[1], version: match[2], meta: PACKAGES[match[1]] };
}

function listTags(kind) {
    const prefix = PACKAGES[kind].tagPrefix;
    const output = git("tag", "-l", `${prefix}*`, "--sort=-version:refname");
    return output ? output.split("\n").filter(Boolean) : [];
}

function previousTag(kind, tag) {
    const tags = listTags(kind);
    const index = tags.indexOf(tag);
    if (index === -1) {
        throw new Error(`Tag not found locally: ${tag}. Fetch tags or create the tag first.`);
    }
    return tags[index + 1] ?? null;
}

function diffNameStatus(fromRef, toRef, scopePath) {
    if (!fromRef) {
        const output = git("ls-tree", "-r", "--name-only", toRef, "--", scopePath);
        return output
            ? output.split("\n").filter(Boolean).map((file) => `A\t${file}`)
            : [];
    }
    const output = git("diff", "--name-status", `${fromRef}..${toRef}`, "--", scopePath);
    return output ? output.split("\n").filter(Boolean) : [];
}

function commitSubjects(fromRef, toRef, scopePath) {
    const range = fromRef ? `${fromRef}..${toRef}` : toRef;
    const output = git(
        "log",
        range,
        "--pretty=format:%s",
        "--",
        scopePath
    );
    if (!output) return [];
    return output
        .split("\n")
        .filter((line) => !/^chore\((cli|sdk)\): release /i.test(line))
        .filter((line) => !/^(cli|sdk)-v\d+\.\d+\.\d+$/.test(line));
}

function extractAsyncMethods(ref, indexPath) {
    if (!indexPath) return [];
    let content;
    try {
        content = git("show", `${ref}:${indexPath}`);
    } catch {
        return [];
    }
    return [...content.matchAll(/async (\w+)\(/g)].map((match) => match[1]);
}

function basename(file) {
    return file.split("/").pop();
}

function summarizeFiles(lines) {
    const added = [];
    const changed = [];
    const removed = [];

    for (const line of lines) {
        const [status, ...rest] = line.split("\t");
        const file = rest.join("\t");
        if (!file || file.includes("/dist/") || basename(file) === "PUBLISHING.md") continue;
        if (status === "A") added.push(file);
        else if (status === "D") removed.push(file);
        else if (status.startsWith("M") || status.startsWith("R")) changed.push(file);
    }

    return { added, changed, removed };
}

function bulletList(items, limit = 12) {
    if (items.length === 0) return ["- _(none)_"];
    const shown = items.slice(0, limit);
    const bullets = shown.map((item) => `- \`${item}\``);
    if (items.length > limit) {
        bullets.push(`- _…and ${items.length - limit} more_`);
    }
    return bullets;
}

function skillRecipeSummary(added) {
    const recipes = added.filter((file) => file.includes("/resources/examples/") && file.endsWith(".json"));
    if (recipes.length === 0) return null;
    const platforms = new Set(
        recipes.map((file) => {
            const name = basename(file).replace(/\.json$/, "");
            if (name.startsWith("multi-platform")) return "multi-platform";
            return name.split("-")[0];
        })
    );
    return `${recipes.length} JSON post recipe(s) (${[...platforms].sort().join(", ")})`;
}

function providerDocSummary(added) {
    const docs = added.filter(
        (file) => file.includes("/resources/") && file.endsWith(".md") && !file.includes("/examples/")
    );
    if (docs.length === 0) return null;
    return docs.map((file) => `\`${basename(file)}\``).join(", ");
}

function buildNotes(tag, fromTag = null) {
    const { kind, version, meta } = parseTag(tag);
    const prev = fromTag ?? previousTag(kind, tag);
    if (fromTag && !fromTag.match(new RegExp(`^${meta.tagPrefix}`))) {
        throw new Error(`--from tag must use prefix ${meta.tagPrefix} (got ${fromTag})`);
    }
    const compare = prev
        ? `https://github.com/${REPO}/compare/${prev}...${tag}`
        : `https://github.com/${REPO}/releases/tag/${tag}`;
    const lines = diffNameStatus(prev, tag, meta.scopePath);
    const { added, changed, removed } = summarizeFiles(lines);
    const commits = commitSubjects(prev, tag, meta.scopePath);

    const sections = [];

    sections.push(`## ${meta.name} v${version}`);
  if (prev) {
        sections.push(`**Compare:** [${prev}...${tag}](${compare})`);
    }
    sections.push("");
    sections.push("```bash");
    sections.push(meta.install(version));
    sections.push("```");
    sections.push("");

    const addedBullets = [];

    if (kind === "sdk" && meta.indexPath) {
        const prevMethods = prev ? extractAsyncMethods(prev, meta.indexPath) : [];
        const nextMethods = extractAsyncMethods(tag, meta.indexPath);
        const newMethods = nextMethods.filter((method) => !prevMethods.includes(method));
        const droppedMethods = prevMethods.filter((method) => !nextMethods.includes(method));
        if (newMethods.length) {
            addedBullets.push(`**API methods:** ${newMethods.map((m) => `\`${m}()\``).join(", ")}`);
        }
        if (droppedMethods.length) {
            removed.push(`_(methods)_ ${droppedMethods.map((m) => `${m}()`).join(", ")}`);
        }
    }

    if (kind === "cli") {
        const recipes = skillRecipeSummary(added);
        if (recipes) addedBullets.push(recipes);
        const docs = providerDocSummary(added);
        if (docs) addedBullets.push(`**Skill docs:** ${docs}`);
    }

    const notableAdded = added.filter(
        (file) =>
            !file.includes("/resources/examples/") &&
            !(kind === "cli" && file.includes("/resources/") && file.endsWith(".md"))
    );
    if (notableAdded.length) {
        addedBullets.push(...bulletList(notableAdded, 8).map((line) => line.replace(/^- /, "")));
    }

    sections.push("### Added");
    sections.push(...(addedBullets.length ? addedBullets.map((line) => `- ${line}`) : ["- _(none)_"]));
    sections.push("");

    const changedBullets = [];
    if (commits.length) {
        changedBullets.push(...commits.slice(0, 8).map((subject) => `- ${subject}`));
        if (commits.length > 8) {
            changedBullets.push(`- _…and ${commits.length - 8} more commit(s)_`);
        }
    }
    const notableChanged = changed.filter(
        (file) => !file.endsWith("package.json") && !file.includes("/resources/examples/")
    );
    if (notableChanged.length && changedBullets.length < 8) {
        changedBullets.push(...bulletList(notableChanged, 6));
    }

    sections.push("### Changed");
    sections.push(...(changedBullets.length ? changedBullets : ["- _(none)_"]));
    sections.push("");

    const removedBullets = removed.map((item) =>
        item.startsWith("_(methods)_") ? `- **Removed methods:** ${item.replace("_(methods)_ ", "")}` : `- \`${item}\``
    );

    sections.push("### Removed");
    sections.push(...(removedBullets.length ? removedBullets : ["- _(none)_"]));
    sections.push("");

    return sections.join("\n");
}

function usage() {
    console.error(`Usage: node scripts/release-notes.mjs <cli-vX.Y.Z|sdk-vX.Y.Z> [--from cli-vA.B.C] [--out file.md]`);
    process.exit(1);
}

const args = process.argv.slice(2);
const tag = args.find((arg) => !arg.startsWith("--"));
if (!tag) usage();

const fromIndex = args.indexOf("--from");
const fromTag = fromIndex !== -1 ? args[fromIndex + 1] : null;
if (fromIndex !== -1 && !fromTag) usage();

const outIndex = args.indexOf("--out");
const outFile = outIndex !== -1 ? args[outIndex + 1] : null;

const notes = buildNotes(tag, fromTag);

if (outFile) {
    fs.writeFileSync(outFile, `${notes}\n`);
} else {
    console.log(notes);
}
