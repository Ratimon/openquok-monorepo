import type { Request } from "express";

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** Collapse volatile path segments for log grouping (UUIDs, numeric ids, hex tokens). */
export function collapseVolatilePathSegments(pathname: string): string {
	let path = pathname.trim() || "/";
	if (path.length > 1 && path.endsWith("/")) {
		path = path.slice(0, -1);
	}
	path = path.replace(UUID_RE, ":id");
	path = path.replace(/\/\d+(?=\/|$)/g, "/:num");
	path = path.replace(/\/[0-9a-f]{16,}(?=\/|$)/gi, "/:token");
	return path;
}

/**
 * Express route path template for attribution logging (`/blog-system/posts/:id`, etc.).
 */
export function httpPathTemplateForRequest(req: Request, routePath: string): string {
	let template = collapseVolatilePathSegments(routePath);

	if (routePath === "/image/download" && req.method === "GET") {
		const dbName = typeof req.query?.databaseName === "string" ? req.query.databaseName : "*";
		template = `/image/download?databaseName=${dbName}`;
	}

	if (template.startsWith("/public/")) {
		const rest = template.slice("/public/".length);
		const slash = rest.indexOf("/");
		if (slash === -1) {
			return `/public/${rest}`;
		}
		return `/public/${rest.slice(0, slash)}/:segment`;
	}

	return template;
}
