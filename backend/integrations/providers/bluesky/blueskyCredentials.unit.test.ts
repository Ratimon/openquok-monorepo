import dns from "node:dns/promises";

import {
    assertPublicHttpsBlueskyService,
    decodeBlueskyConnectCode,
    normalizeBlueskyServiceUrl,
    parseBlueskyToken,
    serializeBlueskyToken,
} from "./blueskyCredentials.js";

function b64(obj: Record<string, string>): string {
    return Buffer.from(JSON.stringify(obj), "utf8").toString("base64");
}

describe("blueskyCredentials", () => {
    it("decodes connect code with default service", () => {
        const creds = decodeBlueskyConnectCode(
            b64({ identifier: "alice.bsky.social", password: "secret-app-password" })
        );
        expect(creds.service).toBe("https://bsky.social");
        expect(creds.identifier).toBe("alice.bsky.social");
        expect(creds.password).toBe("secret-app-password");
    });

    it("round-trips stored token JSON", () => {
        const token = serializeBlueskyToken({
            service: "https://bsky.social",
            identifier: "alice.bsky.social",
            password: "pw",
        });
        expect(parseBlueskyToken(token)).toEqual({
            service: "https://bsky.social",
            identifier: "alice.bsky.social",
            password: "pw",
        });
    });

    it("rejects invalid connect payloads", () => {
        expect(() => decodeBlueskyConnectCode("not-base64")).toThrow(/Invalid account details/);
        expect(() => decodeBlueskyConnectCode(b64({ identifier: "", password: "x" }))).toThrow(
            /Invalid account details/
        );
    });

    it("normalizes service trailing slashes", () => {
        expect(normalizeBlueskyServiceUrl("https://bsky.social///")).toBe("https://bsky.social");
    });

    describe("assertPublicHttpsBlueskyService", () => {
        const lookup = jest.spyOn(dns, "lookup");

        afterEach(() => {
            lookup.mockReset();
        });

        it("rejects non-HTTPS URLs", async () => {
            await expect(assertPublicHttpsBlueskyService("http://bsky.social")).rejects.toThrow(/HTTPS/);
        });

        it("rejects loopback hosts without DNS", async () => {
            await expect(assertPublicHttpsBlueskyService("https://127.0.0.1")).rejects.toThrow(/public/);
            await expect(assertPublicHttpsBlueskyService("https://localhost")).rejects.toThrow(/public/);
        });

        it("rejects hosts that resolve to private addresses", async () => {
            (lookup as jest.MockedFunction<typeof dns.lookup>).mockImplementation(
                (async (_hostname: string, options?: unknown) => {
                    if (options && typeof options === "object" && (options as { all?: boolean }).all) {
                        return [{ address: "10.0.0.5", family: 4 }];
                    }
                    return { address: "10.0.0.5", family: 4 };
                }) as typeof dns.lookup
            );
            await expect(assertPublicHttpsBlueskyService("https://pds.example.com")).rejects.toThrow(/public/);
        });

        it("accepts public HTTPS hosts", async () => {
            (lookup as jest.MockedFunction<typeof dns.lookup>).mockImplementation(
                (async (_hostname: string, options?: unknown) => {
                    if (options && typeof options === "object" && (options as { all?: boolean }).all) {
                        return [{ address: "104.26.0.1", family: 4 }];
                    }
                    return { address: "104.26.0.1", family: 4 };
                }) as typeof dns.lookup
            );
            await expect(assertPublicHttpsBlueskyService("https://bsky.social")).resolves.toBeUndefined();
        });
    });
});
