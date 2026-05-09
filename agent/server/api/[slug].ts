import type { VercelRequest, VercelResponse } from "@vercel/node";

import { ensureInitialized, handleRequest } from "../app.js";

/** Single segment under `/api/*` (e.g. `/api/health`). See `api/device/[slug].ts` for `/api/device/...`. */
export const config = {
  maxDuration: 30,
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await ensureInitialized();
  await handleRequest(req, res);
}
