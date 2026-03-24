/**
 * Express serverless handler for Vercel.
 * Invoked via api/index.js (bundled from this file). All requests are rewritten to /api/index.
 * Local development uses app.ts with listen(); when VERCEL is set, listen is skipped.
 */
import type { Express } from "express";
import { createApp } from "../app.js";

let appPromise: Promise<Express> | null = null;

function getApp(): Promise<Express> {
	if (!appPromise) {
		appPromise = createApp();
	}
	return appPromise;
}

export default async function handler(
	req: import("http").IncomingMessage,
	res: import("http").ServerResponse<import("http").IncomingMessage>
): Promise<void> {
	const app = await getApp();
	app(req, res);
}
