import { SkoolProvider } from "./skoolProvider.js";
import { SKOOL_MAX_LENGTH, SKOOL_SETTINGS_SCHEMA } from "./resolveSkoolSettings.js";

const originalFetch = global.fetch;

afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
});

function mockFetchJson(status: number, body: unknown) {
    global.fetch = jest.fn().mockResolvedValue({
        ok: status < 400,
        status,
        text: async () => JSON.stringify(body),
        json: async () => body,
    } as Response);
}

function encodeCookies(cookies: Record<string, string>): string {
    return Buffer.from(JSON.stringify(cookies), "utf8").toString("base64");
}

describe("SkoolProvider", () => {
    const provider = new SkoolProvider();

    it("declares chrome-extension metadata", () => {
        expect(provider.identifier).toBe("skool");
        expect(provider.isChromeExtension).toBe(true);
        expect(provider.maxLength()).toBe(SKOOL_MAX_LENGTH);
        expect(provider.settingsSchema()).toEqual(SKOOL_SETTINGS_SCHEMA);
        expect(provider.tools().map((t) => t.methodName)).toEqual(["groups", "label"]);
    });

    it("authenticates valid session cookies via /self", async () => {
        mockFetchJson(200, {
            id: "user-1",
            name: "ada",
            first_name: "Ada",
            last_name: "Lovelace",
            metadata: { picture_profile: "https://cdn.example/p.png" },
        });

        const result = await provider.authenticate({
            code: encodeCookies({ auth_token: "tok", client_id: "cid" }),
            codeVerifier: "none",
        });

        expect(result).toMatchObject({
            id: "user-1",
            username: "ada",
            name: "Ada Lovelace",
            accessToken: JSON.stringify({ auth_token: "tok", client_id: "cid" }),
        });
    });

    it("rejects connect code missing required cookies", async () => {
        const result = await provider.authenticate({
            code: encodeCookies({ auth_token: "tok" }),
            codeVerifier: "none",
        });
        expect(result).toMatch(/Missing required cookies/);
    });

    it("maps groups tool rows to value/label options", async () => {
        mockFetchJson(200, {
            groups: [{ id: "g1", metadata: { display_name: "My Group" } }],
        });

        const token = JSON.stringify({ auth_token: "t", client_id: "c" });
        const rows = await provider.groups(token, {}, "user-1", {
            id: "int",
            organization_id: "org",
            internal_id: "user-1",
            name: "n",
            picture: null,
            provider_identifier: "skool",
            type: "social",
            token,
            refresh_token: null,
            token_expiration: null,
            root_internal_id: null,
            in_between_steps: false,
            refresh_needed: false,
            deleted_at: null,
        });

        expect(rows).toEqual([{ value: "g1", label: "My Group" }]);
    });
});
