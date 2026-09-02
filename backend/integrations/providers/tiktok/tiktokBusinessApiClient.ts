import { mapTiktokBusinessApiError } from "./tiktokBusinessApiErrors";

export const TIKTOK_BUSINESS_API_BASE = "https://business-api.tiktok.com/open_api/v1.3";

export type TiktokBusinessApiEnvelope = {
    ok: boolean;
    data: Record<string, unknown>;
    errorCode: number;
    errorMessage: string;
    requestId: string;
};

async function parseTiktokBusinessHttpJson(res: Response): Promise<unknown> {
    try {
        return await res.json();
    } catch {
        throw new Error(`TikTok Business API returned non-JSON response (HTTP ${res.status})`);
    }
}

export function parseTiktokBusinessApiEnvelope(body: unknown): TiktokBusinessApiEnvelope {
    const root = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const data = root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : {};
    const code = typeof root.code === "number" ? root.code : -1;
    const message = typeof root.message === "string" ? root.message : "";
    const requestId = typeof root.request_id === "string" ? root.request_id : "";
    const ok = code === 0;
    return { ok, data, errorCode: code, errorMessage: message, requestId };
}

function envelopeFromResponse(res: Response, parsed: unknown): TiktokBusinessApiEnvelope {
    const envelope = parseTiktokBusinessApiEnvelope(parsed);
    if (!res.ok && envelope.ok) {
        return {
            ...envelope,
            ok: false,
            errorCode: envelope.errorCode !== 0 ? envelope.errorCode : res.status,
        };
    }
    return envelope;
}

export async function tiktokBusinessApiGet(
    accessToken: string,
    path: string,
    query?: Record<string, string | number | boolean | undefined>
): Promise<TiktokBusinessApiEnvelope> {
    let url = `${TIKTOK_BUSINESS_API_BASE}${path}`;
    if (query) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null) {
                params.set(key, String(value));
            }
        }
        const qs = params.toString();
        if (qs) url += `?${qs}`;
    }

    const res = await fetch(url, {
        method: "GET",
        headers: { "Access-Token": accessToken },
    });
    const parsed = await parseTiktokBusinessHttpJson(res);
    return envelopeFromResponse(res, parsed);
}

export async function tiktokBusinessApiPost(
    accessToken: string,
    path: string,
    body: Record<string, unknown>
): Promise<TiktokBusinessApiEnvelope> {
    const res = await fetch(`${TIKTOK_BUSINESS_API_BASE}${path}`, {
        method: "POST",
        headers: {
            "Access-Token": accessToken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    const parsed = await parseTiktokBusinessHttpJson(res);
    return envelopeFromResponse(res, parsed);
}

export async function tiktokBusinessApiPostJson(
    path: string,
    body: Record<string, unknown>
): Promise<TiktokBusinessApiEnvelope> {
    const res = await fetch(`${TIKTOK_BUSINESS_API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const parsed = await parseTiktokBusinessHttpJson(res);
    return envelopeFromResponse(res, parsed);
}

export function assertTiktokBusinessApiOk(envelope: TiktokBusinessApiEnvelope): Record<string, unknown> {
    if (!envelope.ok) {
        throw new Error(mapTiktokBusinessApiError(envelope.errorCode, envelope.errorMessage));
    }
    return envelope.data;
}
