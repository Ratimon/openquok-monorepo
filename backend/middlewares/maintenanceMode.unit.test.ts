import type { Request, Response, NextFunction } from "express";

import { isAllowedDuringWriteFreeze, maintenanceModeMiddleware, matchesMaintenanceBypass } from "./maintenanceMode";
import { parseMaintenanceMode, isRecognizedMaintenanceMode, isWriteFreezeMode } from "../config/maintenanceMode";

jest.mock("../config/GlobalConfig", () => ({
    config: {
        maintenance: {
            mode: "freeze_writes",
            retryAfterSeconds: 3600,
            bypassSecret: "operator-secret",
        },
        api: { prefix: "/api/v1" },
    },
}));

import { config } from "../config/GlobalConfig";

const maintenanceConfig = (
    config as {
        maintenance: { mode: string; retryAfterSeconds: number; bypassSecret: string };
    }
).maintenance;

const asReq = (partial: Partial<Request>): Request => partial as Request;

const mockRes = () => {
    const headers: Record<string, string> = {};
    return {
        headers,
        setHeader: jest.fn((name: string, value: string) => {
            headers[name.toLowerCase()] = value;
        }),
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
};

describe("parseMaintenanceMode", () => {
    it("accepts off, banner, and freeze_writes", () => {
        expect(parseMaintenanceMode("off")).toBe("off");
        expect(parseMaintenanceMode("banner")).toBe("banner");
        expect(parseMaintenanceMode("freeze_writes")).toBe("freeze_writes");
        expect(parseMaintenanceMode("FREEZE_WRITES")).toBe("freeze_writes");
    });

    it("treats empty and unknown values as off", () => {
        expect(parseMaintenanceMode("")).toBe("off");
        expect(parseMaintenanceMode("true")).toBe("off");
        expect(parseMaintenanceMode(undefined)).toBe("off");
    });

    it("reports whether the raw value is a known mode", () => {
        expect(isRecognizedMaintenanceMode("")).toBe(true);
        expect(isRecognizedMaintenanceMode("banner")).toBe(true);
        expect(isRecognizedMaintenanceMode("true")).toBe(false);
        expect(isWriteFreezeMode("freeze_writes")).toBe(true);
        expect(isWriteFreezeMode("banner")).toBe(false);
    });
});

describe("matchesMaintenanceBypass", () => {
    it("rejects empty secrets and mismatched values", () => {
        expect(matchesMaintenanceBypass("operator-secret", "")).toBe(false);
        expect(matchesMaintenanceBypass("nope", "operator-secret")).toBe(false);
        expect(matchesMaintenanceBypass(undefined, "operator-secret")).toBe(false);
    });

    it("accepts an exact match", () => {
        expect(matchesMaintenanceBypass("operator-secret", "operator-secret")).toBe(true);
    });
});

describe("isAllowedDuringWriteFreeze", () => {
    const base = {
        bypassHeader: undefined as string | undefined,
        bypassSecret: "operator-secret",
    };

    it("allows safe methods", () => {
        expect(
            isAllowedDuringWriteFreeze({ ...base, method: "GET", path: "/api/v1/posts", originalUrl: "/api/v1/posts" })
        ).toBe(true);
        expect(
            isAllowedDuringWriteFreeze({ ...base, method: "HEAD", path: "/api/v1/posts", originalUrl: "/api/v1/posts" })
        ).toBe(true);
        expect(
            isAllowedDuringWriteFreeze({
                ...base,
                method: "OPTIONS",
                path: "/api/v1/posts",
                originalUrl: "/api/v1/posts",
            })
        ).toBe(true);
    });

    it("allows health, sitemap, and Stripe webhooks", () => {
        expect(
            isAllowedDuringWriteFreeze({ ...base, method: "POST", path: "/health", originalUrl: "/health" })
        ).toBe(true);
        expect(
            isAllowedDuringWriteFreeze({
                ...base,
                method: "POST",
                path: "/sitemap.xml",
                originalUrl: "/sitemap.xml",
            })
        ).toBe(true);
        expect(
            isAllowedDuringWriteFreeze({
                ...base,
                method: "POST",
                path: "/api/v1/billing/webhooks/stripe",
                originalUrl: "/api/v1/billing/webhooks/stripe",
            })
        ).toBe(true);
    });

    it("blocks mutations including auth, public API writes, MCP, and anonymous public writes", () => {
        expect(
            isAllowedDuringWriteFreeze({
                ...base,
                method: "POST",
                path: "/api/v1/auth/login",
                originalUrl: "/api/v1/auth/login",
            })
        ).toBe(false);
        expect(
            isAllowedDuringWriteFreeze({
                ...base,
                method: "POST",
                path: "/api/v1/public/posts",
                originalUrl: "/api/v1/public/posts",
            })
        ).toBe(false);
        expect(
            isAllowedDuringWriteFreeze({ ...base, method: "POST", path: "/mcp", originalUrl: "/mcp" })
        ).toBe(false);
        expect(
            isAllowedDuringWriteFreeze({
                ...base,
                method: "PUT",
                path: "/api/v1/blog-system/posts/abc/activity",
                originalUrl: "/api/v1/blog-system/posts/abc/activity",
            })
        ).toBe(false);
        expect(
            isAllowedDuringWriteFreeze({
                ...base,
                method: "POST",
                path: "/api/v1/company/t",
                originalUrl: "/api/v1/company/t",
            })
        ).toBe(false);
    });

    it("allows operator bypass", () => {
        expect(
            isAllowedDuringWriteFreeze({
                ...base,
                method: "POST",
                path: "/api/v1/public/posts",
                originalUrl: "/api/v1/public/posts",
                bypassHeader: "operator-secret",
            })
        ).toBe(true);
    });
});

describe("maintenanceModeMiddleware", () => {
    const next: NextFunction = jest.fn();

    beforeEach(() => {
        (next as jest.Mock).mockClear();
        maintenanceConfig.mode = "freeze_writes";
        maintenanceConfig.retryAfterSeconds = 3600;
        maintenanceConfig.bypassSecret = "operator-secret";
    });

    it("passes through when mode is off or banner", () => {
        maintenanceConfig.mode = "off";
        const res = mockRes();
        maintenanceModeMiddleware(
            asReq({ method: "POST", path: "/api/v1/posts", originalUrl: "/api/v1/posts", headers: {} }),
            res as unknown as Response,
            next
        );
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();

        maintenanceConfig.mode = "banner";
        (next as jest.Mock).mockClear();
        maintenanceModeMiddleware(
            asReq({ method: "POST", path: "/api/v1/posts", originalUrl: "/api/v1/posts", headers: {} }),
            res as unknown as Response,
            next
        );
        expect(next).toHaveBeenCalled();
    });

    it("returns 503 with Retry-After for blocked mutations", () => {
        const res = mockRes();
        maintenanceModeMiddleware(
            asReq({
                method: "POST",
                path: "/api/v1/public/posts",
                originalUrl: "/api/v1/public/posts",
                headers: {},
            }),
            res as unknown as Response,
            next
        );
        expect(next).not.toHaveBeenCalled();
        expect(res.setHeader).toHaveBeenCalledWith("Retry-After", "3600");
        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Service temporarily unavailable due to scheduled maintenance",
            code: "maintenance_freeze_writes",
        });
    });

    it("lets GET CMS reads through during freeze_writes", () => {
        const res = mockRes();
        maintenanceModeMiddleware(
            asReq({
                method: "GET",
                path: "/api/v1/blog-system/posts",
                originalUrl: "/api/v1/blog-system/posts",
                headers: {},
            }),
            res as unknown as Response,
            next
        );
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
});
