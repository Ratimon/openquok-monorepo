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
    return undefined;
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
        const mapped = mapSkoolApiBodyError(text);
        throw new Error(mapped ?? `Skool session validation failed (HTTP ${res.status})`);
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
        const mapped = mapSkoolApiBodyError(text);
        throw new Error(mapped ?? `Skool API error (HTTP ${res.status})`);
    }
    try {
        return JSON.parse(text) as T;
    } catch {
        throw new Error("Skool API returned invalid JSON");
    }
}
