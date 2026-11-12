import type { ConfigObject } from "../config/GlobalConfig";
import type { Express, Request, Response, NextFunction } from "express";

import { normalizeApiRoutePath } from "./publicRouteRegistry";
import { httpPathTemplateForRequest } from "../utils/http/httpPathTemplate";
import { logger } from "../utils/Logger";

type ObservabilityConfig = { logHttpPathTemplates?: boolean };

export function applyHttpPathTemplateLogging(app: Express, config: ConfigObject): void {
	const observability = config.observability as ObservabilityConfig | undefined;
	if (!observability?.logHttpPathTemplates) {
		return;
	}

	const rawPrefix = (config.api as { prefix?: string })?.prefix ?? "/api/v1";
	const apiPrefix = rawPrefix.replace(/\/+$/, "") || "/";

	app.use((req: Request, res: Response, next: NextFunction) => {
		const startedAt = Date.now();
		res.on("finish", () => {
			const pathName = req.path;
			const routePath =
				pathName.startsWith(apiPrefix) || pathName === apiPrefix
					? normalizeApiRoutePath(pathName, apiPrefix)
					: pathName;
			logger.info({
				msg: "http_path",
				method: req.method,
				pathTemplate: httpPathTemplateForRequest(req, routePath),
				status: res.statusCode,
				durationMs: Date.now() - startedAt,
			});
		});
		next();
	});

	logger.info({ msg: "[Setup] HTTP path-template logging enabled" });
}
