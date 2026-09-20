import type { Request } from "express";

import { config } from "../config/GlobalConfig";
import { isCloudflareIp, normalizeIpAddress } from "./cloudflareIpRanges";

const firstHeaderValue = (value: string | string[] | undefined): string | null => {
    const raw = Array.isArray(value) ? value[0] : value;
    if (typeof raw !== "string") return null;
    const first = raw.split(",")[0]?.trim();
    return first && first.length > 0 ? first : null;
};

const proxyIpFromRequest = (req: Request): string | null => {
    const fromExpress = normalizeIpAddress(req.ip);
    if (fromExpress) return fromExpress;
    const socketAddress = req.socket?.remoteAddress;
    return normalizeIpAddress(socketAddress);
};

const serverTrustConfig = (): { trustCloudflareHeaders: boolean; verifyCloudflareIpRange: boolean } => {
    const server = config.server as {
        trustCloudflareHeaders?: boolean;
        verifyCloudflareIpRange?: boolean;
    };
    return {
        trustCloudflareHeaders: server.trustCloudflareHeaders === true,
        verifyCloudflareIpRange: server.verifyCloudflareIpRange === true,
    };
};

const shouldTrustCfConnectingIp = (req: Request, cfConnectingIp: string): boolean => {
    const { verifyCloudflareIpRange } = serverTrustConfig();
    if (!verifyCloudflareIpRange) return true;

    const proxyIp = proxyIpFromRequest(req);
    if (!proxyIp) return false;
    if (!isCloudflareIp(proxyIp)) return false;

    return normalizeIpAddress(cfConnectingIp) !== null;
};

/**
 * Resolves the client IP for rate limiting and logging.
 * Honors CF-Connecting-IP only when trust/verification settings allow it.
 */
export const trustedClientIp = (req: Request): string => {
    const proxyIp = proxyIpFromRequest(req) ?? "unknown";
    const { trustCloudflareHeaders } = serverTrustConfig();
    if (!trustCloudflareHeaders) return proxyIp;

    const cfConnectingIp = firstHeaderValue(req.headers["cf-connecting-ip"]);
    if (!cfConnectingIp) return proxyIp;
    if (!shouldTrustCfConnectingIp(req, cfConnectingIp)) return proxyIp;

    return normalizeIpAddress(cfConnectingIp) ?? proxyIp;
};
