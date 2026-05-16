import { isAllowedExternalImageHost } from "./allowedExternalImageHosts";

const FETCH_TIMEOUT_MS = 15_000;

/** Browser-like headers; Meta CDNs often 403 on bot or missing Referer. */
export function externalCdnImageRequestHeaders(remoteUrl: string): Record<string, string> {
    let referer = "https://www.instagram.com/";
    try {
        const host = new URL(remoteUrl).hostname.toLowerCase();
        if (host.includes("threads")) {
            referer = "https://www.threads.net/";
        }
    } catch {
        /* keep default */
    }

    return {
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: referer,
    };
}

export class ExternalImageFetchError extends Error {
    constructor(
        message: string,
        readonly statusCode: number
    ) {
        super(message);
        this.name = "ExternalImageFetchError";
    }
}

export type FetchedExternalImage = {
    buffer: Buffer;
    contentType: string;
};

/**
 * Fetches an allowlisted external image URL (Instagram / Meta CDN).
 * @throws {ExternalImageFetchError} when upstream fails or response is not an image
 */
export async function fetchAllowlistedExternalImage(remoteUrl: string): Promise<FetchedExternalImage> {
    const parsed = new URL(remoteUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new ExternalImageFetchError("Invalid URL protocol. Only HTTP and HTTPS are allowed.", 400);
    }
    if (!isAllowedExternalImageHost(parsed.hostname)) {
        throw new ExternalImageFetchError("URL host is not allowed", 400);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
        const response = await fetch(remoteUrl, {
            method: "GET",
            redirect: "follow",
            headers: externalCdnImageRequestHeaders(remoteUrl),
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new ExternalImageFetchError(
                `Failed to fetch image: ${response.status} ${response.statusText}`,
                response.status === 403 || response.status === 404 ? response.status : 502
            );
        }

        const contentType = (response.headers.get("content-type") ?? "").split(";")[0]?.trim() ?? "";
        if (!contentType.startsWith("image/")) {
            throw new ExternalImageFetchError("URL does not point to a valid image", 400);
        }

        const arrayBuffer = await response.arrayBuffer();
        return { buffer: Buffer.from(arrayBuffer), contentType };
    } catch (error) {
        if (error instanceof ExternalImageFetchError) {
            throw error;
        }
        if (error instanceof Error && error.name === "AbortError") {
            throw new ExternalImageFetchError("Request timeout", 504);
        }
        throw new ExternalImageFetchError(
            error instanceof Error ? error.message : "Failed to fetch image",
            502
        );
    } finally {
        clearTimeout(timeout);
    }
}
