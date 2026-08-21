import { DevToProvider, decodeDevtoConnectCode } from "./devtoProvider.js";
import { DEVTO_MAX_LENGTH, DEVTO_SETTINGS_SCHEMA } from "./resolveDevtoSettings.js";

const originalFetch = global.fetch;

afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
});

function mockFetchJson(status: number, body: unknown) {
    global.fetch = jest.fn().mockResolvedValue({
        ok: status < 400,
        status,
        json: async () => body,
    } as Response);
}

function mockFetchSequence(responses: Array<{ status?: number; body: unknown }>) {
    let call = 0;
    global.fetch = jest.fn().mockImplementation(async () => {
        const next = responses[call] ?? responses[responses.length - 1]!;
        call += 1;
        return {
            ok: (next.status ?? 200) < 400,
            status: next.status ?? 200,
            json: async () => next.body,
        } as Response;
    });
}

function encodeApiKey(apiKey: string): string {
    return Buffer.from(JSON.stringify({ apiKey }), "utf8").toString("base64");
}

describe("decodeDevtoConnectCode", () => {
    it("decodes base64 JSON apiKey", () => {
        expect(decodeDevtoConnectCode(encodeApiKey("sk-test-key"))).toBe("sk-test-key");
    });

    it("rejects missing or short keys", () => {
        expect(() => decodeDevtoConnectCode(encodeApiKey("ab"))).toThrow(/Invalid API key/);
        expect(() => decodeDevtoConnectCode("not-base64")).toThrow(/Invalid API key/);
    });
});

describe("DevToProvider", () => {
    const provider = new DevToProvider();

    it("declares credentials-in-app metadata", async () => {
        expect(provider.identifier).toBe("devto");
        expect(provider.name).toBe("Dev.to");
        expect(provider.editor).toBe("markdown");
        expect(provider.isBetweenSteps).toBe(false);
        expect(provider.maxLength()).toBe(DEVTO_MAX_LENGTH);
        expect(await provider.customFields()).toEqual([
            { key: "apiKey", label: "API key", validation: "/^.{3,}$/", type: "password" },
        ]);
        expect(provider.settingsSchema()).toEqual(DEVTO_SETTINGS_SCHEMA);
        expect(provider.tools().map((t) => t.methodName)).toEqual(["tags", "organizations"]);
    });

    it("returns state as url so session authorize can seed cache without a redirect", async () => {
        const { url, state, codeVerifier } = await provider.generateAuthUrl();
        expect(url).toBe(state);
        expect(state).toHaveLength(6);
        expect(codeVerifier).toHaveLength(10);
    });

    it("authenticates a valid API key via /users/me", async () => {
        mockFetchJson(200, {
            id: 1234,
            name: "Ada",
            username: "ada",
            profile_image: "https://cdn.example/ada.png",
        });

        const result = await provider.authenticate({
            code: encodeApiKey("valid-key-1"),
            codeVerifier: "none",
        });

        expect(result).not.toBe("Invalid API key");
        expect(result).toMatchObject({
            id: "1234",
            name: "Ada",
            username: "ada",
            accessToken: "valid-key-1",
            refreshToken: "valid-key-1",
            picture: "https://cdn.example/ada.png",
        });
        expect((result as { expiresIn: number }).expiresIn).toBeGreaterThan(90 * 365 * 24 * 60 * 60);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://dev.to/api/users/me",
            expect.objectContaining({
                headers: expect.objectContaining({ "api-key": "valid-key-1" }),
            })
        );
    });

    it("returns Invalid API key when /users/me rejects the key", async () => {
        mockFetchJson(401, { error: "unauthorized", status: 401 });

        await expect(
            provider.authenticate({
                code: encodeApiKey("bad-key-1"),
                codeVerifier: "none",
            })
        ).resolves.toBe("Invalid API key");
    });

    it("maps tags tool rows to value/label options", async () => {
        mockFetchJson(200, [
            { id: 6, name: "javascript" },
            { id: 1, name: "webdev" },
        ]);

        await expect(provider.tags("key", {}, "1", {} as never)).resolves.toEqual([
            { value: 6, label: "javascript" },
            { value: 1, label: "webdev" },
        ]);
        expect(global.fetch).toHaveBeenCalledWith(
            "https://dev.to/api/tags?per_page=1000",
            expect.objectContaining({ headers: expect.objectContaining({ "api-key": "key" }) })
        );
    });

    it("maps organizations from articles/me/all then organization lookups", async () => {
        mockFetchSequence([
            {
                body: [
                    { organization: { username: "acme", name: "Acme" } },
                    { organization: { username: "acme" } },
                    { organization: { username: "other" } },
                ],
            },
            { body: { id: 10, name: "Acme Inc", username: "acme" } },
            { body: { id: 11, name: "Other Org", username: "other" } },
        ]);

        await expect(provider.organizations("key", {}, "1", {} as never)).resolves.toEqual([
            { id: 10, name: "Acme Inc", username: "acme" },
            { id: 11, name: "Other Org", username: "other" },
        ]);
    });
});
