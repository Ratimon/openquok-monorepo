import type { VercelRequest, VercelResponse } from "@vercel/node";

import { ensureInitialized, handleRequest } from "../app.js";

/** Vercel Node serverless — avoid vercel.json `functions` globs (they do not match dynamic filenames like `[...slug].ts` reliably). */
export const config = {
  maxDuration: 30,
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await ensureInitialized();
  await handleRequest(req, res);
}
