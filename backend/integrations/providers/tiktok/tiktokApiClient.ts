import { mapTiktokApiErrorCode, parseTiktokApiEnvelope } from "./tiktokApiErrors";

const TIKTOK_API = "https://open.tiktokapis.com";

export type TiktokApiEnvelope = {
    ok: boolean;
    data: Record<string, unknown>;
    errorCode: string;
    errorMessage: string;
};

async function parseTiktokHttpJson(res: Response): Promise<unknown> {
    try {
        return await res.json();
    } catch {
        throw new Error(`TikTok API returned non-JSON response (HTTP ${res.status})`);
    }
}

function envelopeFromResponse(res: Response, parsed: unknown): TiktokApiEnvelope {
    const envelope = parseTiktokApiEnvelope(parsed);
    if (!res.ok && envelope.ok) {
        return { ...envelope, ok: false, errorCode: envelope.errorCode || `http_${res.status}` };
    }
    return envelope;
}

export async function tiktokApiGet(accessToken: string, path: string): Promise<TiktokApiEnvelope> {
    const res = await fetch(`${TIKTOK_API}${path}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const parsed = await parseTiktokHttpJson(res);
    return envelopeFromResponse(res, parsed);
}

export async function tiktokApiPost(
    accessToken: string,
    path: string,
    body: Record<string, unknown>
): Promise<TiktokApiEnvelope> {
    const res = await fetch(`${TIKTOK_API}${path}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(body),
    });
    const parsed = await parseTiktokHttpJson(res);
    return envelopeFromResponse(res, parsed);
}

export function assertTiktokApiOk(envelope: TiktokApiEnvelope): Record<string, unknown> {
    if (!envelope.ok) {
        throw new Error(mapTiktokApiErrorCode(envelope.errorCode, envelope.errorMessage));
    }
    return envelope.data;
}
