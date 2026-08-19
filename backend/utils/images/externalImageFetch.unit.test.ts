import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
    ExternalImageFetchError,
    externalCdnImageRequestHeaders,
    fetchAllowlistedExternalImage,
} from "./externalImageFetch";

describe("externalImageFetch", () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = jest.fn() as typeof fetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it("sets Instagram referer for cdninstagram hosts", () => {
        const headers = externalCdnImageRequestHeaders("https://scontent.cdninstagram.com/x.jpg");
        expect(headers.Referer).toBe("https://www.instagram.com/");
    });

    it("omits Referer for Facebook lookaside and fbcdn hosts", () => {
        expect(externalCdnImageRequestHeaders("https://platform-lookaside.fbsbx.com/x.jpg").Referer).toBeUndefined();
        expect(externalCdnImageRequestHeaders("https://scontent.xx.fbcdn.net/v/t1.jpg").Referer).toBeUndefined();
    });

    it("omits Referer for LinkedIn licdn hosts", () => {
        expect(externalCdnImageRequestHeaders("https://media.licdn.com/dms/image/x.jpg").Referer).toBeUndefined();
    });

    it("returns image buffer on success", async () => {
        const bytes = new Uint8Array([0xff, 0xd8, 0xff]);
        jest.mocked(global.fetch).mockResolvedValue({
            ok: true,
            status: 200,
            statusText: "OK",
            headers: { get: (name: string) => (name === "content-type" ? "image/jpeg" : null) },
            arrayBuffer: async () => bytes.buffer,
        } as unknown as Response);

        const result = await fetchAllowlistedExternalImage("https://scontent.cdninstagram.com/a.jpg");
        expect(result.contentType).toBe("image/jpeg");
        expect(result.buffer.equals(Buffer.from(bytes))).toBe(true);
    });

    it("retries without Referer when the Instagram Referer attempt is forbidden", async () => {
        const bytes = new Uint8Array([0xff, 0xd8, 0xff]);
        jest.mocked(global.fetch)
            .mockResolvedValueOnce({
                ok: false,
                status: 403,
                statusText: "Forbidden",
                headers: { get: () => null },
            } as unknown as Response)
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: "OK",
                headers: { get: (name: string) => (name === "content-type" ? "image/jpeg" : null) },
                arrayBuffer: async () => bytes.buffer,
            } as unknown as Response);

        const result = await fetchAllowlistedExternalImage("https://scontent.cdninstagram.com/a.jpg");
        expect(result.contentType).toBe("image/jpeg");
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("throws ExternalImageFetchError with 403 when every CDN attempt is forbidden", async () => {
        jest.mocked(global.fetch).mockResolvedValue({
            ok: false,
            status: 403,
            statusText: "Forbidden",
            headers: { get: () => null },
        } as unknown as Response);

        await expect(
            fetchAllowlistedExternalImage("https://scontent.cdninstagram.com/a.jpg")
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("rejects disallowed hosts", async () => {
        await expect(fetchAllowlistedExternalImage("https://example.com/a.jpg")).rejects.toBeInstanceOf(
            ExternalImageFetchError
        );
        expect(global.fetch).not.toHaveBeenCalled();
    });
});
