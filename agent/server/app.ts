import { type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import { randomBytes } from "node:crypto";
import fetch from "node-fetch";
import pg from "pg";

// --- Configuration ---
export const PORT = Number.parseInt(process.env.PORT || "3111", 10);
const CLIENT_ID = process.env.OPENQUOK_OAUTH_CLIENT_ID!;
const CLIENT_SECRET = process.env.OPENQUOK_OAUTH_CLIENT_SECRET!;
const FRONTEND_URL = process.env.OPENQUOK_FRONTEND_URL || "https://www.openquok.com";
const API_URL = process.env.OPENQUOK_API_URL || "https://api.openquok.com";
const AUTHORIZE_PATH = process.env.OPENQUOK_AUTHORIZE_PATH || "/oauth/authorize";
export const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
const DATABASE_URL = process.env.DATABASE_URL!;

if (!CLIENT_ID || !CLIENT_SECRET) {
  // eslint-disable-next-line no-console
  console.error("OPENQUOK_OAUTH_CLIENT_ID and OPENQUOK_OAUTH_CLIENT_SECRET are required");
  process.exit(1);
}
if (!DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.error("DATABASE_URL is required");
  process.exit(1);
}

try {
  new URL(FRONTEND_URL);
} catch {
  // eslint-disable-next-line no-console
  console.error(`Invalid URL: OPENQUOK_FRONTEND_URL=${JSON.stringify(FRONTEND_URL)}`);
  process.exit(1);
}

try {
  new URL(API_URL);
} catch {
  // eslint-disable-next-line no-console
  console.error(`Invalid URL: OPENQUOK_API_URL=${JSON.stringify(API_URL)}`);
  process.exit(1);
}

// --- Postgres ---
const pool = new pg.Pool({ connectionString: DATABASE_URL });

const EXPIRY_MINUTES = 15;
const POLL_INTERVAL_S = 5;
const MAX_BODY_BYTES = 4096;

let initPromise: Promise<void> | null = null;

export async function ensureInitialized(): Promise<void> {
  if (!initPromise) initPromise = initDb();
  await initPromise;
}

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS device_requests (
      device_code TEXT PRIMARY KEY,
      user_code TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      access_token TEXT,
      api_url TEXT,
      organization_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_device_requests_user_code
    ON device_requests (user_code) WHERE status = 'pending'
  `);
  await pool.query(`DELETE FROM device_requests WHERE created_at < NOW() - INTERVAL '${EXPIRY_MINUTES} minutes'`);
}

/** Vercel mounts this app under `/api/*`; strip that prefix before routing. */
export function routePathname(urlPathname: string): string {
  if (urlPathname === "/api" || urlPathname.startsWith("/api/")) {
    return urlPathname === "/api" ? "/" : urlPathname.slice(4) || "/";
  }
  return urlPathname;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function generateUserCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = randomBytes(8);
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code.slice(0, 4) + "-" + code.slice(4);
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function html(res: ServerResponse, status: number, body: string) {
  res.writeHead(status, { "Content-Type": "text/html" });
  res.end(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Openquok CLI Auth</title>
<style>:root{--color-primary:oklch(68.628% 0.185 148.958);--color-primary-content:oklch(0% 0 0)}*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0a0a0a;color:#fff}.card{background:#141414;border:1px solid #262626;border-radius:12px;padding:48px;max-width:520px;text-align:center}h2{margin-bottom:16px;font-size:24px}p{color:#a0a0a0;margin-bottom:24px;line-height:1.5}.btn{display:inline-block;background:var(--color-primary);color:var(--color-primary-content);text-decoration:none;padding:12px 32px;border-radius:9999px;font-size:16px;font-weight:500;border:none;cursor:pointer;transition:filter .15s ease}.btn:hover{filter:brightness(.92)}.success{color:#22c55e}.error{color:#ef4444}input{font-family:monospace;font-size:24px;text-align:center;padding:12px 24px;border-radius:8px;border:1px solid #333;background:#1a1a2e;color:#fff;letter-spacing:4px;width:260px;margin-bottom:24px;text-transform:uppercase}input:focus{outline:2px solid color-mix(in oklab,var(--color-primary) 65%,transparent);outline-offset:2px;border-color:color-mix(in oklab,var(--color-primary) 45%,transparent)}</style></head><body><div class="card">${body}</div></body></html>`);
}

async function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        req.destroy();
        reject(new Error("Body too large"));
        return;
      }
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

// POST /device/code — CLI calls this to start the flow
async function handleDeviceCode(_req: IncomingMessage, res: ServerResponse) {
  const deviceCode = randomBytes(32).toString("hex");
  const userCode = generateUserCode();

  await pool.query("INSERT INTO device_requests (device_code, user_code) VALUES ($1, $2)", [deviceCode, userCode]);

  json(res, 200, {
    device_code: deviceCode,
    user_code: userCode,
    verification_uri: `${SERVER_URL}/device/verify`,
    expires_in: EXPIRY_MINUTES * 60,
    interval: POLL_INTERVAL_S,
  });
}

// GET /device/verify — user opens this in browser
function handleVerifyPage(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || "/", SERVER_URL);
  const prefilled = escapeHtml(url.searchParams.get("code") || "");
  const verifySubmitUrl = `${SERVER_URL.replace(/\/+$/, "")}/device/verify`;

  html(
    res,
    200,
    `
    <h2>Openquok CLI Authorization</h2>
    <p>Enter the code shown in your terminal:</p>
    <form method="POST" action="${escapeHtml(verifySubmitUrl)}">
      <input type="text" name="user_code" value="${prefilled}" placeholder="XXXX-XXXX" maxlength="9" autofocus required>
      <br>
      <button type="submit" class="btn">Authorize</button>
    </form>
  `
  );
}

// POST /device/verify — validate user code and redirect to OAuth authorize UI
async function handleVerifySubmit(req: IncomingMessage, res: ServerResponse) {
  const body = await parseBody(req);
  const params = new URLSearchParams(body);
  const userCode = params.get("user_code")?.toUpperCase().trim();

  if (!userCode) {
    html(res, 400, '<h2 class="error">Missing code</h2><p>Please go back and enter the code.</p>');
    return;
  }

  const result = await pool.query(
    `SELECT device_code FROM device_requests
     WHERE user_code = $1 AND status = 'pending'
     AND created_at > NOW() - INTERVAL '${EXPIRY_MINUTES} minutes'
     LIMIT 1`,
    [userCode]
  );

  if (result.rows.length === 0) {
    html(
      res,
      400,
      '<h2 class="error">Invalid or expired code</h2><p>The code was not found or has expired. Please try again from the CLI.</p>'
    );
    return;
  }

  const deviceCode = result.rows[0].device_code as string;

  const callbackUrl = `${SERVER_URL}/device/callback`;
  const authorizeUrl =
    `${FRONTEND_URL.replace(/\/+$/, "")}${AUTHORIZE_PATH}` +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&response_type=code` +
    `&state=${encodeURIComponent(deviceCode)}` +
    `&redirect_uri=${encodeURIComponent(callbackUrl)}`;

  res.writeHead(302, { Location: authorizeUrl });
  res.end();
}

// GET /device/callback — Openquok redirects here after authorization
async function handleOAuthCallback(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || "/", SERVER_URL);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state"); // device_code
  const error = url.searchParams.get("error");

  if (error) {
    html(
      res,
      400,
      `<h2 class="error">Authorization denied</h2><p>${escapeHtml(error)}</p><p>You can close this window.</p>`
    );
    return;
  }

  if (!code || !state) {
    html(res, 400, '<h2 class="error">Missing parameters</h2><p>Invalid callback.</p>');
    return;
  }

  const result = await pool.query(
    `SELECT device_code FROM device_requests
     WHERE device_code = $1 AND status = 'pending'
     AND created_at > NOW() - INTERVAL '${EXPIRY_MINUTES} minutes'`,
    [state]
  );

  if (result.rows.length === 0) {
    html(res, 400, '<h2 class="error">Invalid or expired session</h2><p>Please try again from the CLI.</p>');
    return;
  }

  try {
    const tokenResponse = await fetch(`${API_URL.replace(/\/+$/, "")}/api/v1/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      html(res, 500, `<h2 class="error">Token exchange failed</h2><p>${escapeHtml(errText)}</p>`);
      return;
    }

    const tokenData = (await tokenResponse.json()) as any;

    await pool.query(
      `UPDATE device_requests
       SET status = 'completed', access_token = $1, api_url = $2, organization_id = $3
       WHERE device_code = $4`,
      [tokenData.access_token, API_URL, tokenData.organizationId || null, state]
    );

    html(res, 200, '<h2 class="success">Authorization successful!</h2><p>You can close this window and return to your terminal.</p>');
  } catch (err: any) {
    html(res, 500, `<h2 class="error">Error</h2><p>${escapeHtml(err.message)}</p>`);
  }
}

// POST /device/token — CLI polls this
async function handleDeviceToken(req: IncomingMessage, res: ServerResponse) {
  const body = await parseBody(req);
  let deviceCode: string | undefined;

  try {
    const parsed = JSON.parse(body);
    deviceCode = parsed.device_code;
  } catch {
    json(res, 400, { error: "invalid_request" });
    return;
  }

  if (!deviceCode) {
    json(res, 400, { error: "invalid_request" });
    return;
  }

  const result = await pool.query(
    "SELECT status, access_token, api_url, organization_id, created_at FROM device_requests WHERE device_code = $1",
    [deviceCode]
  );

  if (result.rows.length === 0) {
    json(res, 400, { error: "invalid_device_code" });
    return;
  }

  const row = result.rows[0] as any;
  const ageMs = Date.now() - new Date(row.created_at).getTime();

  if (ageMs > EXPIRY_MINUTES * 60 * 1000) {
    await pool.query("DELETE FROM device_requests WHERE device_code = $1", [deviceCode]);
    json(res, 400, { error: "expired_token" });
    return;
  }

  if (row.status === "pending") {
    json(res, 400, { error: "authorization_pending" });
    return;
  }

  await pool.query("DELETE FROM device_requests WHERE device_code = $1", [deviceCode]);

  json(res, 200, {
    access_token: row.access_token,
    api_url: row.api_url,
    organization_id: row.organization_id,
  });
}

export async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const base = new URL(SERVER_URL);
  const url = new URL(req.url || "/", base);
  const pathname = routePathname(url.pathname);
  const method = req.method?.toUpperCase();

  try {
    if (method === "POST" && pathname === "/device/code") {
      await handleDeviceCode(req, res);
    } else if (method === "GET" && pathname === "/device/verify") {
      handleVerifyPage(req, res);
    } else if (method === "POST" && pathname === "/device/verify") {
      await handleVerifySubmit(req, res);
    } else if (method === "GET" && pathname === "/device/callback") {
      await handleOAuthCallback(req, res);
    } else if (method === "POST" && pathname === "/device/token") {
      await handleDeviceToken(req, res);
    } else if (pathname === "/health") {
      json(res, 200, { status: "ok" });
    } else {
      json(res, 404, { error: "not_found" });
    }
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error("Unhandled error:", err);
    json(res, 500, { error: "internal_error" });
  }
}

export function startCleanupInterval(): ReturnType<typeof setInterval> {
  return setInterval(async () => {
    try {
      await pool.query(`DELETE FROM device_requests WHERE created_at < NOW() - INTERVAL '${EXPIRY_MINUTES} minutes'`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Cleanup error:", err);
    }
  }, 10 * 60 * 1000);
}
