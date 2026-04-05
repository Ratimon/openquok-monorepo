#!/usr/bin/env node
/**
 * Merge variables from a dotenv-style file into Railway docker-compose `environment` lists.
 *
 * Defaults (override with flags or env):
 *   RAILWAY_COMPOSE_SYNC_FROM — source .env path
 *   RAILWAY_COMPOSE_SYNC_TO   — compose YAML to update
 *
 * Usage:
 *   node scripts/sync-railway-compose-env.mjs
 *   node scripts/sync-railway-compose-env.mjs --from infra/api.full-stack.env --to infra/docker-compose.railway.yaml
 *   node scripts/sync-railway-compose-env.mjs --services api
 *   node scripts/sync-railway-compose-env.mjs --worker-mode full
 *
 * Default source is backend/.env.production.local (single place to edit backend vars for local prod + sync).
 *
 * api: replaces the whole `environment` block with all KEY= from the source file (order preserved).
 * worker: default `slim` — keeps existing keys/order in the compose file; values from the source
 *   when present, otherwise keeps the previous value. `full` — same behavior as api.
 *
 * --temporal-address (default temporal:7233) overwrites TEMPORAL_ADDRESS for listed services after merge.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, '..');

const DEFAULT_FROM = path.join(REPO_ROOT, 'backend/.env.production.local');
const DEFAULT_TO = path.join(REPO_ROOT, 'infra/docker-compose.railway.yaml');
const DEFAULT_SERVICES = ['api', 'worker'];
const DEFAULT_TEMPORAL_ADDRESS = 'temporal:7233';

function parseArgs(argv) {
    const out = {
        from: process.env.RAILWAY_COMPOSE_SYNC_FROM || DEFAULT_FROM,
        to: process.env.RAILWAY_COMPOSE_SYNC_TO || DEFAULT_TO,
        services: DEFAULT_SERVICES,
        workerMode: 'slim',
        temporalAddress: DEFAULT_TEMPORAL_ADDRESS,
        noTemporalOverride: false
    };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--from' && argv[i + 1]) {
            out.from = path.resolve(REPO_ROOT, argv[++i]);
        } else if (a === '--to' && argv[i + 1]) {
            out.to = path.resolve(REPO_ROOT, argv[++i]);
        } else if (a === '--services' && argv[i + 1]) {
            out.services = argv[++i]
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
        } else if (a === '--worker-mode' && argv[i + 1]) {
            const m = argv[++i];
            if (m !== 'slim' && m !== 'full') {
                console.error(`Invalid --worker-mode "${m}" (use slim|full)`);
                process.exit(1);
            }
            out.workerMode = m;
        } else if (a === '--temporal-address' && argv[i + 1]) {
            out.temporalAddress = argv[++i];
        } else if (a === '--no-temporal-override') {
            out.noTemporalOverride = true;
        } else if (a === '--help' || a === '-h') {
            console.log(`Usage: sync-railway-compose-env.mjs [options]

  --from <path>              Source dotenv file (default: backend/.env.production.local)
  --to <path>                Compose file to update (default: infra/docker-compose.railway.yaml)
  --services <a,b>           Services to update (default: api,worker)
  --worker-mode slim|full    Worker env: slim keeps keys from compose (default: slim)
  --temporal-address <host>  Set TEMPORAL_ADDRESS for updated services (default: temporal:7233)
  --no-temporal-override     Do not override TEMPORAL_ADDRESS

Env: RAILWAY_COMPOSE_SYNC_FROM, RAILWAY_COMPOSE_SYNC_TO`);
            process.exit(0);
        }
    }
    return out;
}

/** @returns {Array<{ key: string, value: string }>} */
function parseDotEnv(content) {
    const entries = [];
    const seen = new Set();
    const lines = content.split(/\r?\n/);

    for (let raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;

        let s = line;
        if (s.startsWith('export ')) s = s.slice(7).trim();

        const eq = s.indexOf('=');
        if (eq === -1) continue;

        let key = s.slice(0, eq).trim();
        let value = s.slice(eq + 1);

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
            if (raw.includes('"')) {
                value = value.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }
        }

        if (!key || seen.has(key)) continue;
        seen.add(key);
        entries.push({ key, value });
    }
    return entries;
}

function escapeYamlDouble(s) {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/** @returns {string} one line: `      - KEY=value` or quoted */
function formatComposeEnvLine(key, value) {
    const needsQuote =
        /[#\n:]/.test(value) ||
        value !== value.trim() ||
        value === '' ||
        /^\s|\s$/.test(value);

    const pair = `${key}=${value}`;
    if (!needsQuote) {
        return `      - ${pair}`;
    }
    return `      - "${escapeYamlDouble(pair)}"`;
}

function parseEnvListLine(line) {
    const m = line.match(/^      - (.+)$/);
    if (!m) return null;
    let rest = m[1].trim();
    if (rest.startsWith('"') && rest.endsWith('"')) {
        rest = rest
            .slice(1, -1)
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
    }
    const eq = rest.indexOf('=');
    if (eq === -1) return null;
    return {
        key: rest.slice(0, eq),
        value: rest.slice(eq + 1)
    };
}

/**
 * @param {string[]} lines
 * @param {string} serviceName
 * @returns {{ envHeaderIndex: number, listStart: number, listEnd: number }}
 */
function findServiceEnvironmentRange(lines, serviceName) {
    const serviceRe = new RegExp(`^  ${escapeRe(serviceName)}:\\s*$`);
    let si = -1;
    for (let i = 0; i < lines.length; i++) {
        if (serviceRe.test(lines[i])) {
            si = i;
            break;
        }
    }
    if (si === -1) {
        throw new Error(`Service "${serviceName}" not found in compose file`);
    }

    let envHeaderIndex = -1;
    for (let i = si + 1; i < lines.length; i++) {
        const line = lines[i];
        if (/^  [a-zA-Z0-9_-]+:\s*$/.test(line)) {
            break;
        }
        if (line.startsWith('    environment:')) {
            envHeaderIndex = i;
            break;
        }
    }
    if (envHeaderIndex === -1) {
        throw new Error(`Service "${serviceName}" has no environment: block`);
    }

    let listStart = envHeaderIndex + 1;
    let listEnd = listStart;
    while (listEnd < lines.length && /^      - /.test(lines[listEnd])) {
        listEnd++;
    }
    return { envHeaderIndex, listStart, listEnd };
}

function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** @param {Map<string, string>} envMap */
function buildLinesFromOrderedKeys(keys, envMap, fallbackByKey) {
    const out = [];
    for (const key of keys) {
        let value = envMap.has(key) ? envMap.get(key) : fallbackByKey.get(key);
        if (value === undefined) value = '';
        out.push(formatComposeEnvLine(key, value));
    }
    return out;
}

function main() {
    const opts = parseArgs(process.argv);

    if (!fs.existsSync(opts.from)) {
        console.error(`Source file not found: ${opts.from}`);
        process.exit(1);
    }
    if (!fs.existsSync(opts.to)) {
        console.error(`Compose file not found: ${opts.to}`);
        process.exit(1);
    }

    const dotenvContent = fs.readFileSync(opts.from, 'utf8');
    const ordered = parseDotEnv(dotenvContent);
    const envMap = new Map(ordered.map(({ key, value }) => [key, value]));

    let composeText = fs.readFileSync(opts.to, 'utf8');
    let lines = composeText.split(/\r?\n/);

    for (const serviceName of opts.services) {
        const { envHeaderIndex, listStart, listEnd } = findServiceEnvironmentRange(lines, serviceName);

        let newListLines;
        const fallbackByKey = new Map();

        if (serviceName === 'worker' && opts.workerMode === 'slim') {
            for (let i = listStart; i < listEnd; i++) {
                const parsed = parseEnvListLine(lines[i]);
                if (parsed) fallbackByKey.set(parsed.key, parsed.value);
            }
            const keys = [...fallbackByKey.keys()];
            newListLines = buildLinesFromOrderedKeys(keys, envMap, fallbackByKey);
        } else {
            newListLines = ordered.map(({ key, value }) => formatComposeEnvLine(key, value));
        }

        if (!opts.noTemporalOverride) {
            const temporalLine = formatComposeEnvLine('TEMPORAL_ADDRESS', opts.temporalAddress);
            let found = false;
            newListLines = newListLines.map((line) => {
                const p = parseEnvListLine(line);
                if (p && p.key === 'TEMPORAL_ADDRESS') {
                    found = true;
                    return temporalLine;
                }
                return line;
            });
            if (!found) {
                newListLines.push(temporalLine);
            }
        }

        const before = lines.slice(0, listStart);
        const after = lines.slice(listEnd);
        lines = [...before, ...newListLines, ...after];
    }

    const out = lines.join('\n');
    fs.writeFileSync(opts.to, out.endsWith('\n') ? out : `${out}\n`, 'utf8');
    console.log(
        `Updated ${opts.services.join(', ')} environment in ${path.relative(REPO_ROOT, opts.to)} from ${path.relative(REPO_ROOT, opts.from)}`
    );
}

main();

