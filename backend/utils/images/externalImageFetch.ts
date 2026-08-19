import { isAllowedExternalImageHost } from "./allowedExternalImageHosts";

const FETCH_TIMEOUT_MS = 15_000;

export function externalCdnImageBaseHeaders(): Record<string, string> {
    return {
        "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    };
}

function instagramFamilyReferer(hostname: string): string | null {
    if (hostname.includes("threads")) return "https://www.threads.net/";
    if (
        hostname.includes("instagram") ||
        hostname === "cdninstagram.com" ||
        hostname.endsWith(".cdninstagram.com")
    ) {
        return "https://www.instagram.com/";
    }
    return null;
}

/**
 * Header sets to try in order. Facebook `scontent` / lookaside and LinkedIn `media.licdn.com`
 * signed URLs often 403 when a site Referer is sent from a datacenter IP — omit Referer first.
 * Instagram CDN still needs an Instagram Referer.
 */
export function externalCdnImageHeaderAttempts(remoteUrl: string): Record<string, string>[] {
    const base = externalCdnImageBaseHeaders();
    let instagramReferer: string | null = null;
    try {
        instagramReferer = instagramFamilyReferer(new URL(remoteUrl).hostname.toLowerCase());
    } catch {
        /* keep no-referer attempts */
    }

    const attempts: Record<string, string>[] = [];
    if (instagramReferer) {
        attempts.push({ ...base, Referer: instagramReferer });
    }
    attempts.push({ ...base });
    return attempts;
}

/** First header attempt (Instagram Referer when required, otherwise no Referer). */
export function externalCdnImageRequestHeaders(remoteUrl: string): Record<string, string> {
    return externalCdnImageHeaderAttempts(remoteUrl)[0] ?? externalCdnImageBaseHeaders();
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

function contentTypeFromResponse(response: Response): string {
    return (response.headers.get("content-type") ?? "").split(";")[0]?.trim() ?? "";
}

function errorForFailedResponse(response: Response): ExternalImageFetchError {
    return new ExternalImageFetchError(
        `Failed to fetch image: ${response.status} ${response.statusText}`,
        response.status === 403 || response.status === 404 ? response.status : 502
    );
}

/**
 * Fetches an allowlisted external image URL (Instagram / Meta / LinkedIn CDN).
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

    const attempts = externalCdnImageHeaderAttempts(remoteUrl);
    const deadline = Date.now() + FETCH_TIMEOUT_MS;
    let lastError: ExternalImageFetchError | null = null;

    for (const headers of attempts) {
        const remaining = deadline - Date.now();
        if (remaining <= 0) break;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), remaining);

        try {
            const response = await fetch(remoteUrl, {
                method: "GET",
                redirect: "follow",
                headers,
                signal: controller.signal,
            });

            if (!response.ok) {
                lastError = errorForFailedResponse(response);
                continue;
            }

            const contentType = contentTypeFromResponse(response);
            if (!contentType.startsWith("image/")) {
                lastError = new ExternalImageFetchError("URL does not point to a valid image", 400);
                continue;
            }

            const arrayBuffer = await response.arrayBuffer();
            return { buffer: Buffer.from(arrayBuffer), contentType };
        } catch (error) {
            if (error instanceof ExternalImageFetchError) {
                lastError = error;
                continue;
            }
            if (error instanceof Error && error.name === "AbortError") {
                lastError = new ExternalImageFetchError("Request timeout", 504);
                break;
            }
            lastError = new ExternalImageFetchError(
                error instanceof Error ? error.message : "Failed to fetch image",
                502
            );
        } finally {
            clearTimeout(timeout);
        }
    }

    throw lastError ?? new ExternalImageFetchError("Failed to fetch image", 502);
}

/** Download an allowlisted image URL, optionally retrying with a bearer token (LinkedIn media). */
export async function fetchAllowlistedExternalImageWithOptionalBearer(
    remoteUrl: string,
    accessToken?: string
): Promise<FetchedExternalImage> {
    try {
        return await fetchAllowlistedExternalImage(remoteUrl);
    } catch (error) {
        const token = accessToken?.trim();
        if (!token) throw error;

        const parsed = new URL(remoteUrl);
        if (!isAllowedExternalImageHost(parsed.hostname)) throw error;

        const response = await fetch(remoteUrl, {
            method: "GET",
            redirect: "follow",
            headers: {
                ...externalCdnImageBaseHeaders(),
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw errorForFailedResponse(response);
        }
        const contentType = contentTypeFromResponse(response);
        if (!contentType.startsWith("image/")) {
            throw new ExternalImageFetchError("URL does not point to a valid image", 400);
        }
        return { buffer: Buffer.from(await response.arrayBuffer()), contentType };
    }
}
