import { ApiResponseError } from "twitter-api-v2";

import { ProviderAccessTokenExpiredError } from "../../../errors/ProviderIntegrationErrors";

const AUTH_ERROR_CODES = new Set([32, 89, 215, 326, 401]);

function readApiErrorCode(err: ApiResponseError): number | undefined {
    if (typeof err.code === "number") return err.code;
    const data = err.data as { errors?: Array<{ code?: number }> } | undefined;
    const nested = data?.errors?.[0]?.code;
    return typeof nested === "number" ? nested : undefined;
}

export function mapXApiError(err: unknown): Error {
    if (err instanceof ProviderAccessTokenExpiredError) {
        return err;
    }

    if (err instanceof ApiResponseError) {
        const code = readApiErrorCode(err);
        const data = err.data as { detail?: string; title?: string } | undefined;
        const detail = data?.detail ?? data?.title ?? err.message;

        if (code != null && AUTH_ERROR_CODES.has(Number(code))) {
            return new ProviderAccessTokenExpiredError(
                "X rejected the access token. Reconnect the channel and try again."
            );
        }

        const lower = String(detail ?? "").toLowerCase();

        if (lower.includes("usage cap") || lower.includes("rate limit")) {
            return new Error("X API usage limit reached. Wait a few minutes and try again.");
        }
        if (lower.includes("duplicate") || lower.includes("already posted")) {
            return new Error("This post looks like a duplicate on X. Edit the text and try again.");
        }
        if (lower.includes("invalid url") || lower.includes("malformed url")) {
            return new Error("X rejected a URL in this post. Check links and try again.");
        }
        if (lower.includes("video") && (lower.includes("140") || lower.includes("2 minute") || lower.includes("duration"))) {
            return new Error("X videos must be 140 seconds or shorter for this account.");
        }

        if (detail) {
            return new Error(String(detail));
        }
    }

    if (err instanceof Error) {
        const lower = err.message.toLowerCase();
        if (lower.includes("could not authenticate") || lower.includes("invalid or expired token")) {
            return new ProviderAccessTokenExpiredError(
                "X rejected the access token. Reconnect the channel and try again."
            );
        }
        if (lower.includes("usage cap") || lower.includes("rate limit")) {
            return new Error("X API usage limit reached. Wait a few minutes and try again.");
        }
        if (lower.includes("duplicate") || lower.includes("already posted")) {
            return new Error("This post looks like a duplicate on X. Edit the text and try again.");
        }
        if (lower.includes("invalid url") || lower.includes("malformed url")) {
            return new Error("X rejected a URL in this post. Check links and try again.");
        }
        if (lower.includes("video") && (lower.includes("140") || lower.includes("2 minute") || lower.includes("duration"))) {
            return new Error("X videos must be 140 seconds or shorter for this account.");
        }
        return err;
    }

    return new Error(String(err));
}

export async function withXErrorMapping<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (err) {
        throw mapXApiError(err);
    }
}
