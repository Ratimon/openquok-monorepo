import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

function loadEnv(): void {
  // In development, load `.env.development.local` if present.
  // In production/serverless, env vars are injected by the platform (Vercel/etc).
  const isProd = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
  const filename = isProd ? ".env.production.local" : ".env.development.local";
  const envPath = path.join(process.cwd(), filename);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

async function start() {
  loadEnv();

  // Important: `app.ts` reads env at module load time, so import it only after dotenv.
  const { ensureInitialized, handleRequest, PORT, SERVER_URL, startCleanupInterval } = await import("./app.js");
  await ensureInitialized();

  if (!process.env.VERCEL) {
    startCleanupInterval();
  }

  const server = createServer((req, res) => {
    void handleRequest(req, res);
  });

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Openquok CLI auth server running on ${SERVER_URL}`);
    // eslint-disable-next-line no-console
    console.log(`OAuth callback URL (configure in Openquok OAuth App): ${SERVER_URL}/device/callback`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start:", err);
  process.exit(1);
});
