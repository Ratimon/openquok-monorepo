import { skoolCookieHeader, type SkoolSessionCookies } from "./skoolCredentials";

const SKOOL_API = "https://api2.skool.com";

export type SkoolSelfProfile = {
    id: string;
    name: string;
    first_name?: string;
    last_name?: string;
    metadata?: { picture_profile?: string };
};

export function mapSkoolApiBodyError(body: string): string | undefined {
    if (body.includes("must be admin or level")) {
        return "You can't post to this channel";
    }
    if (body.includes("cannot post to this label")) {
        return "Cannot post to this label";
    }
    if (body.includes("You must select a category")) {
        return "Select a Skool category in post settings";
    }
    try {
        const parsed = JSON.parse(body) as { fields?: Array<{ error?: string }> };
        const fields = parsed?.fields;
        if (Array.isArray(fields)) {
            for (const field of fields) {
                const err = field?.error;
                if (typeof err === "string" && err.trim()) {
                    return err.trim();
                }
            }
        }
    } catch {
        /* not JSON */
    }
    return undefined;
}

function formatSkoolHttpError(status: number, text: string): string {
    const mapped = mapSkoolApiBodyError(text);
    if (mapped) return mapped;
    const trimmed = text.trim();
    if (trimmed.startsWith("<") && trimmed.toLowerCase().includes("cloudfront")) {
        return `Skool blocked this request (HTTP ${status}). Sign in on skool.com in Chrome, reconnect via the extension, and try again.`;
    }
    if (trimmed && !trimmed.startsWith("<")) {
        const snippet = trimmed.length > 400 ? `${trimmed.slice(0, 400)}…` : trimmed;
        return `Skool API error (HTTP ${status}): ${snippet}`;
    }
    return `Skool API error (HTTP ${status})`;
}

async function readSkoolResponseText(res: Response): Promise<string> {
    try {
        return await res.text();
    } catch {
        return "";
    }
}

export async function skoolFetch(
    path: string,
    cookies: SkoolSessionCookies,
    init?: RequestInit
): Promise<Response> {
    const url = path.startsWith("http") ? path : `${SKOOL_API}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = new Headers(init?.headers);
    headers.set("Cookie", skoolCookieHeader(cookies));
    const waf = cookies["aws-waf-token"];
    if (waf) {
        headers.set("x-aws-waf-token", waf);
    }
    return fetch(url, { ...init, headers });
}

export async function fetchSkoolSelf(cookies: SkoolSessionCookies): Promise<SkoolSelfProfile> {
    const res = await skoolFetch("/self", cookies, { method: "GET" });
    const text = await readSkoolResponseText(res);
    if (!res.ok) {
        throw new Error(formatSkoolHttpError(res.status, text).replace(/^Skool API error/, "Skool session validation failed"));
    }
    let json: SkoolSelfProfile;
    try {
        json = JSON.parse(text) as SkoolSelfProfile;
    } catch {
        throw new Error("Skool session validation returned invalid JSON");
    }
    if (!json?.id) {
        throw new Error("Skool session validation failed");
    }
    return json;
}

export async function skoolFetchJson<T>(
    path: string,
    cookies: SkoolSessionCookies,
    init?: RequestInit
): Promise<T> {
    const res = await skoolFetch(path, cookies, init);
    const text = await readSkoolResponseText(res);
    if (!res.ok) {
        throw new Error(formatSkoolHttpError(res.status, text));
    }
    try {
        return JSON.parse(text) as T;
    } catch {
        throw new Error("Skool API returned invalid JSON");
    }
}
