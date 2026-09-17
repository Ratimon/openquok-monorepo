import type { Request } from "express";

const mockConfig = {
    server: {
        trustCloudflareHeaders: false,
        verifyCloudflareIpRange: false,
    },
};

jest.mock("../config/GlobalConfig", () => ({
    config: mockConfig,
}));

import { isCloudflareIp } from "./cloudflareIpRanges";
import { trustedClientIp } from "./trustedClientIp";

const asReq = (partial: Partial<Request>): Request => partial as Request;

const setServerTrustConfig = (overrides: {
    trustCloudflareHeaders?: boolean;
    verifyCloudflareIpRange?: boolean;
}) => {
    mockConfig.server.trustCloudflareHeaders = overrides.trustCloudflareHeaders ?? false;
    mockConfig.server.verifyCloudflareIpRange = overrides.verifyCloudflareIpRange ?? false;
};

describe("cloudflareIpRanges", () => {
    it("recognizes published Cloudflare IPv4 addresses", () => {
        expect(isCloudflareIp("104.23.160.155")).toBe(true);
        expect(isCloudflareIp("172.64.10.1")).toBe(true);
    });

    it("rejects non-Cloudflare IPv4 addresses", () => {
        expect(isCloudflareIp("203.0.113.10")).toBe(false);
        expect(isCloudflareIp("192.0.2.8")).toBe(false);
    });
});

describe("trustedClientIp", () => {
    afterEach(() => {
        setServerTrustConfig({});
    });

    it("falls back to req.ip when Cloudflare headers are not trusted", () => {
        setServerTrustConfig({ trustCloudflareHeaders: false });

        expect(
            trustedClientIp(
                asReq({
                    ip: "192.0.2.8",
                    headers: { "cf-connecting-ip": "203.0.113.10" },
                })
            )
        ).toBe("192.0.2.8");
    });

    it("prefers CF-Connecting-IP when trust is enabled", () => {
        setServerTrustConfig({ trustCloudflareHeaders: true, verifyCloudflareIpRange: false });

        expect(
            trustedClientIp(
                asReq({
                    ip: "104.23.160.155",
                    headers: { "cf-connecting-ip": "203.0.113.10" },
                })
            )
        ).toBe("203.0.113.10");
    });

    it("falls back to req.ip when no CF-Connecting-IP header is present", () => {
        setServerTrustConfig({ trustCloudflareHeaders: true });

        expect(
            trustedClientIp(
                asReq({
                    ip: "192.0.2.8",
                    headers: {},
                })
            )
        ).toBe("192.0.2.8");
    });

    it("ignores CF-Connecting-IP when verify is on and the peer is not Cloudflare", () => {
        setServerTrustConfig({ trustCloudflareHeaders: true, verifyCloudflareIpRange: true });

        expect(
            trustedClientIp(
                asReq({
                    ip: "192.0.2.8",
                    headers: { "cf-connecting-ip": "203.0.113.10" },
                })
            )
        ).toBe("192.0.2.8");
    });

    it("accepts CF-Connecting-IP when verify is on and the peer is Cloudflare", () => {
        setServerTrustConfig({ trustCloudflareHeaders: true, verifyCloudflareIpRange: true });

        expect(
            trustedClientIp(
                asReq({
                    ip: "104.23.160.155",
                    headers: { "cf-connecting-ip": "203.0.113.10" },
                })
            )
        ).toBe("203.0.113.10");
    });
});
