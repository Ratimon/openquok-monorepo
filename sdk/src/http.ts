export class OpenquokHttpError extends Error {
    public readonly status: number;
    public readonly body: unknown;

    constructor(message: string, status: number, body: unknown) {
        super(message);
        this.name = "OpenquokHttpError";
        this.status = status;
        this.body = body;
    }
}

export async function requestJson<T>(params: {
    url: string;
    method?: string;
    apiKey?: string;
    body?: unknown;
    headers?: Record<string, string>;
}): Promise<T> {
    const res = await fetch(params.url, {
        method: params.method ?? (params.body !== undefined ? "POST" : "GET"),
        headers: {
            ...(params.apiKey ? { Authorization: `Bearer ${params.apiKey}` } : {}),
            Accept: "application/json",
            ...(params.body !== undefined ? { "Content-Type": "application/json" } : {}),
            ...params.headers,
        },
        body: params.body !== undefined ? JSON.stringify(params.body) : undefined,
    });

    const text = await res.text();
    let parsed: unknown = null;
    try {
        parsed = text ? JSON.parse(text) : null;
    } catch {
        parsed = text;
    }

    if (!res.ok) {
        throw new OpenquokHttpError(`Request failed: ${res.status} ${res.statusText}`, res.status, parsed);
    }

    return parsed as T;
}
