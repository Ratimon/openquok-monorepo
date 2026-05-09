import type { VercelRequest, VercelResponse } from "@vercel/node";

import { ensureInitialized, handleRequest } from "../../app.js";

/** `/api/device/:slug` — multi-segment public URLs rewrite here (e.g. `/device/callback` → `/api/device/callback`). */
export const config = {
  maxDuration: 30,
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await ensureInitialized();
  await handleRequest(req, res);
}
