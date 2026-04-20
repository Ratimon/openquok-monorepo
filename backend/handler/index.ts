/**
 * Express serverless handler for Vercel.
 * Bundled to api/index.js and api/[[...path]].js. `vercel.json` must keep `source: "/(.*)", destination: "/api"`:
 * Vercel routes that rewrite to the `/api` entry so every path hits this handler; listing only `/`/`/health`
 * rewrites leaves `/api/v1/*` with no matching function and the platform returns NOT_FOUND.
 * Local dev uses app.ts + listen().
 */
import type { Express } from "express";
import { DEFAULT_API_PREFIX, apiPathAfterFunctionsDirectory } from "../config/apiPrefix.js";
import { createApp } from "../app.js";

let appPromise: Promise<Express> | null = null;

function getApp(): Promise<Express> {
	if (!appPromise) {
		appPromise = createApp();
	}
	return appPromise;
}

/**
 * Vercel's `api/[[...path]]` runtime often strips the leading `/api` segment used for the functions
 * directory, so Express sees `/v1/auth/...` while routes mount at `/api/v1`. Restore the prefix.
 */
function normalizeVercelFunctionRequestUrl(req: import("http").IncomingMessage): void {
	if (!req.url) {
		return;
	}
	const q = req.url.indexOf("?");
	const pathname = q >= 0 ? req.url.slice(0, q) : req.url;
	const query = q >= 0 ? req.url.slice(q) : "";

	if (pathname.startsWith("/api")) {
		return;
	}

	const tail = apiPathAfterFunctionsDirectory(process.env.API_PREFIX ?? DEFAULT_API_PREFIX);
	if (!tail || tail === "/") {
		return;
	}

	if (pathname === tail || pathname.startsWith(`${tail}/`)) {
		const next = `/api${pathname}${query}`;
		req.url = next;
		const extended = req as import("http").IncomingMessage & { originalUrl?: string };
		extended.originalUrl = next;
	}
}

/**
 * Wait until Express has finished the response. If the async handler returns before that, Vercel ends
 * the invocation early and you get `FUNCTION_INVOCATION_FAILED` + plain 500 even when middleware ran.
 * (Same idea as `serverless-http`.)
 */
function waitForResponseEnd(
	res: import("http").ServerResponse<import("http").IncomingMessage>,
	run: () => void
): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const done = (): void => {
			res.off("finish", done);
			res.off("close", done);
			res.off("error", onResError);
			resolve();
		};
		const onResError = (e: Error): void => {
			res.off("finish", done);
			res.off("close", done);
			res.off("error", onResError);
			reject(e);
		};
		res.once("finish", done);
		res.once("close", done);
		res.once("error", onResError);
		try {
			run();
		} catch (syncErr) {
			res.off("finish", done);
			res.off("close", done);
			res.off("error", onResError);
			reject(syncErr instanceof Error ? syncErr : new Error(String(syncErr)));
		}
	});
}

export default async function handler(
	req: import("http").IncomingMessage,
	res: import("http").ServerResponse<import("http").IncomingMessage>
): Promise<void> {
	try {
		const expressApp = await getApp();
		normalizeVercelFunctionRequestUrl(req);
		await waitForResponseEnd(res, () => {
			expressApp(req, res);
		});
	} catch (err) {
		if (res.headersSent) {
			return;
		}
		const message = err instanceof Error ? err.message : String(err);
		res.statusCode = 500;
		res.setHeader("Content-Type", "application/json; charset=utf-8");
		res.end(JSON.stringify({ error: "Server initialization failed", message }));
	}
}
