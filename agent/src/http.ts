import fetch from "node-fetch";

export class HttpError extends Error {
  public readonly status: number;
  public readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

export async function requestJson<T>(params: {
  url: string;
  method?: string;
  apiKey?: string | null;
  body?: unknown;
}): Promise<T> {
  const res = await fetch(params.url, {
    method: params.method ?? (params.body ? "POST" : "GET"),
    headers: {
      ...(params.apiKey ? { Authorization: `Bearer ${params.apiKey}` } : {}),
      ...(params.body ? { "Content-Type": "application/json" } : {}),
      Accept: "application/json",
    },
    body: params.body ? JSON.stringify(params.body) : undefined,
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    throw new HttpError(`Request failed: ${res.status} ${res.statusText}`, res.status, parsed);
  }

  return parsed as T;
}

