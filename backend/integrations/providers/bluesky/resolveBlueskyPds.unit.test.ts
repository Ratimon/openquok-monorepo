import dns from "node:dns/promises";

import {
    applyBlueskyResolvedPdsToCredentials,
    isBlueskyEmailLoginIdentifier,
    resolveBlueskyPdsFromIdentifier,
} from "./resolveBlueskyPds.js";

const lookup = jest.spyOn(dns, "lookup");

function mockPublicDns(): void {
    (lookup as jest.MockedFunction<typeof dns.lookup>).mockImplementation(
        (async (_hostname: string, options?: unknown) => {
            if (options && typeof options === "object" && (options as { all?: boolean }).all) {
                return [{ address: "104.26.0.1", family: 4 }];
            }
            return { address: "104.26.0.1", family: 4 };
        }) as typeof dns.lookup
    );
}

describe("resolveBlueskyPds", () => {
    const fetchMock = jest.fn();

    beforeEach(() => {
        fetchMock.mockReset();
        lookup.mockReset();
        mockPublicDns();
        global.fetch = fetchMock as typeof fetch;
    });

    afterEach(() => {
        lookup.mockReset();
    });

    it("classifies email identifiers", () => {
        expect(isBlueskyEmailLoginIdentifier("user@example.com")).toBe(true);
        expect(isBlueskyEmailLoginIdentifier("@alice.bsky.social")).toBe(false);
        expect(isBlueskyEmailLoginIdentifier("did:plc:abc")).toBe(false);
    });

    it("skips resolve for email identifiers", async () => {
        await expect(resolveBlueskyPdsFromIdentifier("user@example.com")).resolves.toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("rejects empty handle", async () => {
        await expect(resolveBlueskyPdsFromIdentifier("   ")).rejects.toThrow(/handle is required/i);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("resolves handle via App View and PLC", async () => {
        fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes("com.atproto.identity.resolveHandle")) {
                return new Response(JSON.stringify({ did: "did:plc:custom" }), { status: 200 });
            }
            if (url.includes("plc.directory")) {
                return new Response(
                    JSON.stringify({
                        service: [
                            {
                                id: "did:plc:custom#atproto_pds",
                                type: "AtprotoPersonalDataServer",
                                serviceEndpoint: "https://pds.custom.example/",
                            },
                        ],
                    }),
                    { status: 200 }
                );
            }
            return new Response("not found", { status: 404 });
        });

        const resolved = await resolveBlueskyPdsFromIdentifier("alice.custom.example");
        expect(resolved).toEqual({
            did: "did:plc:custom",
            serviceUrl: "https://pds.custom.example",
        });
    });

    it("resolves did:plc directly", async () => {
        fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes("plc.directory/did%3Aplc%3Axyz")) {
                return new Response(
                    JSON.stringify({
                        service: [
                            {
                                id: "did:plc:xyz#atproto_pds",
                                type: "AtprotoPersonalDataServer",
                                serviceEndpoint: "https://bsky.social",
                            },
                        ],
                    }),
                    { status: 200 }
                );
            }
            return new Response("not found", { status: 404 });
        });

        const resolved = await resolveBlueskyPdsFromIdentifier("did:plc:xyz");
        expect(resolved?.serviceUrl).toBe("https://bsky.social");
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("blocks PDS hosts that resolve to private addresses", async () => {
        fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes("com.atproto.identity.resolveHandle")) {
                return new Response(JSON.stringify({ did: "did:plc:evil" }), { status: 200 });
            }
            if (url.includes("plc.directory")) {
                return new Response(
                    JSON.stringify({
                        service: [
                            {
                                id: "did:plc:evil#atproto_pds",
                                type: "AtprotoPersonalDataServer",
                                serviceEndpoint: "https://evil-pds.example",
                            },
                        ],
                    }),
                    { status: 200 }
                );
            }
            return new Response("not found", { status: 404 });
        });
        (lookup as jest.MockedFunction<typeof dns.lookup>).mockImplementation(
            (async (_hostname: string, options?: unknown) => {
                if (options && typeof options === "object" && (options as { all?: boolean }).all) {
                    return [{ address: "127.0.0.1", family: 4 }];
                }
                return { address: "127.0.0.1", family: 4 };
            }) as typeof dns.lookup
        );

        await expect(resolveBlueskyPdsFromIdentifier("@evil.bsky.social")).rejects.toThrow(/public/);
    });

    it("overrides submitted service when resolve succeeds", async () => {
        fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.includes("com.atproto.identity.resolveHandle")) {
                return new Response(JSON.stringify({ did: "did:plc:custom" }), { status: 200 });
            }
            if (url.includes("plc.directory")) {
                return new Response(
                    JSON.stringify({
                        service: [
                            {
                                id: "did:plc:custom#atproto_pds",
                                type: "AtprotoPersonalDataServer",
                                serviceEndpoint: "https://pds.custom.example",
                            },
                        ],
                    }),
                    { status: 200 }
                );
            }
            return new Response("not found", { status: 404 });
        });

        const next = await applyBlueskyResolvedPdsToCredentials({
            service: "https://bsky.social",
            identifier: "alice.custom.example",
            password: "pw",
        });
        expect(next.service).toBe("https://pds.custom.example");
    });
});
