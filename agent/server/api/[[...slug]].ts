import type { VercelRequest, VercelResponse } from "@vercel/node";

import { ensureInitialized, handleRequest } from "../app.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await ensureInitialized();
  await handleRequest(req, res);
}
