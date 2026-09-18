import type { Express, Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "node:crypto";

import { config } from "../config/GlobalConfig";
import {
    isWriteFreezeMode,
    MAINTENANCE_BYPASS_HEADER,
    parseMaintenanceMode,
    type MaintenanceMode,
} from "../config/maintenanceMode";
import { BYPASS_PATHS, isWebhookPath } from "./publicRouteRegistry";
import { logger } from "../utils/Logger";

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

type MaintenanceConfig = {
    mode?: string;
    retryAfterSeconds?: number;
    bypassSecret?: string;
};

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) return value[0];
    return value;
}

export function matchesMaintenanceBypass(
    headerValue: string | string[] | undefined,
    secret: string
): boolean {
    if (!secret) return false;
    const provided = firstHeaderValue(headerValue);
    if (!provided) return false;
    const expected = Buffer.from(secret);
    const actual = Buffer.from(provided);
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
}

function isHealthOrSitemapPath(pathName: string): boolean {
    return BYPASS_PATHS.some((p) => pathName === p || pathName.startsWith(`${p}/`));
}

export function isAllowedDuringWriteFreeze(args: {
    method: string;
    path: string;
    originalUrl: string;
    bypassHeader: string | string[] | undefined;
    bypassSecret: string;
}): boolean {
    if (READ_METHODS.has(args.method.toUpperCase())) return true;
    if (matchesMaintenanceBypass(args.bypassHeader, args.bypassSecret)) return true;
    if (isHealthOrSitemapPath(args.path)) return true;
    if (isWebhookPath(args.path, args.originalUrl)) return true;
    return false;
}

function readMaintenanceConfig(): { mode: MaintenanceMode; retryAfterSeconds: number; bypassSecret: string } {
    const maintenance = config.maintenance as MaintenanceConfig | undefined;
    return {
        mode: parseMaintenanceMode(maintenance?.mode),
        retryAfterSeconds: Math.max(0, Number(maintenance?.retryAfterSeconds ?? 3600) || 3600),
        bypassSecret: typeof maintenance?.bypassSecret === "string" ? maintenance.bypassSecret : "",
    };
}

export function maintenanceModeMiddleware(req: Request, res: Response, next: NextFunction): void {
    const { mode, retryAfterSeconds, bypassSecret } = readMaintenanceConfig();
    if (!isWriteFreezeMode(mode)) {
        next();
        return;
    }

    const allowed = isAllowedDuringWriteFreeze({
        method: req.method,
        path: req.path,
        originalUrl: req.originalUrl ?? req.url ?? req.path,
        bypassHeader: req.headers[MAINTENANCE_BYPASS_HEADER],
        bypassSecret,
    });
    if (allowed) {
        next();
        return;
    }

    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(503).json({
        success: false,
        message: "Service temporarily unavailable due to scheduled maintenance",
        code: "maintenance_freeze_writes",
    });
}

export function applyMaintenanceMode(app: Express): void {
    const { mode } = readMaintenanceConfig();
    logger.info({ msg: "[Setup] Maintenance mode", mode });
    app.use(maintenanceModeMiddleware);
}
