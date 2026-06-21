import { formatXAccessToken, parseXAccessToken } from "./xCommon.js";

describe("X OAuth token mapping", () => {
    it("formats and parses accessToken:accessSecret pairs", () => {
        const stored = formatXAccessToken("token123", "secret456");
        expect(stored).toBe("token123:secret456");
        expect(parseXAccessToken(stored)).toEqual({
            accessToken: "token123",
            accessSecret: "secret456",
        });
    });

    it("maps generateAuthUrl codeVerifier contract (oauth_token:oauth_token_secret)", () => {
        const codeVerifier = "oauth-token:oauth-secret";
        const parsed = parseXAccessToken(codeVerifier);
        expect(parsed.accessToken).toBe("oauth-token");
        expect(parsed.accessSecret).toBe("oauth-secret");
    });
});

describe("authenticate param split", () => {
    it("splits codeVerifier on first colon only", () => {
        const codeVerifier = "abc:def:extra";
        const separator = codeVerifier.indexOf(":");
        const oauthToken = codeVerifier.slice(0, separator);
        const oauthSecret = codeVerifier.slice(separator + 1);
        expect(oauthToken).toBe("abc");
        expect(oauthSecret).toBe("def:extra");
    });
});
