import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

import { downloadProviderProfilePicture, facebookGraphProfilePictureUrl } from "./providerProfilePictureFetch";

describe("facebookGraphProfilePictureUrl", () => {
    it("builds the Graph picture endpoint for a Page id", () => {
        expect(facebookGraphProfilePictureUrl("page-1")).toBe(
            "https://graph.facebook.com/v20.0/page-1/picture?type=large"
        );
    });
});

describe("downloadProviderProfilePicture", () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = jest.fn() as typeof fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it("returns Facebook Graph picture bytes when the redirect serves an image", async () => {
        const bytes = new Uint8Array([0xff, 0xd8, 0xff]);
        jest.mocked(global.fetch).mockResolvedValue({
            ok: true,
            status: 200,
            statusText: "OK",
            headers: { get: (name: string) => (name === "content-type" ? "image/jpeg" : null) },
            arrayBuffer: async () => bytes.buffer,
        } as unknown as Response);

        const result = await downloadProviderProfilePicture({
            providerIdentifier: "facebook",
            internalId: "page-1",
            accessToken: "tok",
        });
        expect(result?.contentType).toBe("image/jpeg");
        expect(result?.buffer.equals(Buffer.from(bytes))).toBe(true);
        expect(String(jest.mocked(global.fetch).mock.calls[0]?.[0])).toContain(
            "graph.facebook.com/v20.0/page-1/picture"
        );
        expect(String(jest.mocked(global.fetch).mock.calls[0]?.[0])).toContain("access_token=tok");
    });

    it("returns LinkedIn userinfo picture when the CDN fetch succeeds", async () => {
        const bytes = new Uint8Array([0xff, 0xd8, 0xff]);
        jest.mocked(global.fetch)
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ picture: "https://media.licdn.com/dms/image/v2/abc.jpg" }),
            } as unknown as Response)
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                headers: { get: (name: string) => (name === "content-type" ? "image/jpeg" : null) },
                arrayBuffer: async () => bytes.buffer,
            } as unknown as Response);

        const result = await downloadProviderProfilePicture({
            providerIdentifier: "linkedin",
            internalId: "person-1",
            accessToken: "tok",
        });
        expect(result?.contentType).toBe("image/jpeg");
    });

    it("returns null for providers without a picture downloader", async () => {
        const result = await downloadProviderProfilePicture({
            providerIdentifier: "threads",
            internalId: "1",
            accessToken: "tok",
        });
        expect(result).toBeNull();
        expect(global.fetch).not.toHaveBeenCalled();
    });
});
