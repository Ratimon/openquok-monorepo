import type { PostDetails, PostResponse } from "../../social.integrations.interface";
import {
    DEVTO_TITLE_MIN_LENGTH,
    resolveDevtoSettings,
    type DevtoResolvedPublishSettings,
} from "./resolveDevtoSettings";

import { ProviderAccessTokenExpiredError } from "../../../errors/ProviderIntegrationErrors";
import { publicUrlForObjectKey } from "../../../repositories/MediaRepository";

export const DEVTO_API_BASE = "https://dev.to/api";

type DevtoErrorBody = {
    error?: unknown;
    errors?: Array<{ message?: string } | string>;
    message?: string;
    status?: number;
};

export type DevtoCreateArticleBody = {
    title: string;
    published: true;
    body_markdown: string;
    tags?: string[];
    canonical_url?: string;
    main_image?: string;
    organization_id?: number;
    series?: string;
};

export type DevtoUserProfile = {
    id: string;
    name: string;
    username: string;
    picture: string;
};

export type DevtoTagOption = { value: number; label: string };

export type DevtoOrganizationOption = { id: number; name: string; username: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function devtoHeaders(apiKey: string): Record<string, string> {
    return {
        "api-key": apiKey,
        Accept: "application/json",
        "Content-Type": "application/json",
    };
}

async function readJson(res: Response): Promise<unknown> {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

function firstErrorString(json: unknown): string | undefined {
    if (!isPlainObject(json)) return undefined;
    const body = json as DevtoErrorBody;
    if (typeof body.error === "string" && body.error.trim()) return body.error.trim();
    if (isPlainObject(body.error) && typeof body.error.message === "string" && body.error.message.trim()) {
        return body.error.message.trim();
    }
    const first = body.errors?.[0];
    if (typeof first === "string" && first.trim()) return first.trim();
    if (isPlainObject(first) && typeof first.message === "string" && first.message.trim()) {
        return first.message.trim();
    }
    if (typeof body.message === "string" && body.message.trim()) return body.message.trim();
    return undefined;
}

export function mapDevtoApiError(json: unknown, status: number): string {
    const message = firstErrorString(json);
    if (message && /canonical url has already been taken/i.test(message)) {
        return "This canonical URL is already used on another Dev.to article. Use a different canonical URL or omit it.";
    }
    if (message) return message;
    if (status === 401 || status === 403) return "Invalid or revoked Dev.to API key";
    return `Dev.to request failed (${status})`;
}

function throwIfUnauthorized(status: number, json: unknown): void {
    if (status === 401 || status === 403) {
        throw new ProviderAccessTokenExpiredError(mapDevtoApiError(json, status));
    }
}

export function validateDevtoTitle(title: string): void {
    if (title.trim().length < DEVTO_TITLE_MIN_LENGTH) {
        throw new Error("Dev.to title must be at least 2 characters");
    }
}

export function resolveDevtoPublicMediaUrl(path: string): string {
    const raw = path.trim();
    if (!raw) {
        throw new Error("Media path is empty");
    }
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
        return raw;
    }
    const url = publicUrlForObjectKey(raw);
    if (!url) {
        throw new Error(
            "Cannot build a public media URL for Dev.to (set STORAGE_R2_PUBLIC_BASE_URL for R2, or use full https:// URLs)"
        );
    }
    return url;
}

export function buildDevtoArticlePayload(
    settings: DevtoResolvedPublishSettings,
    bodyMarkdown: string,
    mainImageUrl?: string
): { article: DevtoCreateArticleBody } {
    validateDevtoTitle(settings.title);
    const article: DevtoCreateArticleBody = {
        title: settings.title,
        published: true,
        body_markdown: typeof bodyMarkdown === "string" ? bodyMarkdown : "",
    };
    if (settings.tags.length > 0) article.tags = settings.tags;
    if (settings.canonical) article.canonical_url = settings.canonical;
    if (mainImageUrl) article.main_image = mainImageUrl;
    if (settings.organizationId !== undefined) article.organization_id = settings.organizationId;
    if (settings.series) article.series = settings.series;
    return { article };
}

export async function fetchDevtoCurrentUser(apiKey: string): Promise<DevtoUserProfile> {
    const res = await fetch(`${DEVTO_API_BASE}/users/me`, { headers: devtoHeaders(apiKey) });
    const json = await readJson(res);
    if (res.status === 401 || res.status === 403 || !res.ok) {
        throw new Error(res.status === 401 || res.status === 403 ? "Invalid API key" : mapDevtoApiError(json, res.status));
    }
    if (!isPlainObject(json) || json.id == null || json.id === "") {
        throw new Error("Invalid API key");
    }
    return {
        id: String(json.id),
        name: typeof json.name === "string" ? json.name : "",
        username: typeof json.username === "string" ? json.username : "",
        picture: typeof json.profile_image === "string" ? json.profile_image : "",
    };
}

export function mapDevtoTagOptions(rows: unknown): DevtoTagOption[] {
    if (!Array.isArray(rows)) return [];
    const out: DevtoTagOption[] = [];
    for (const row of rows) {
        if (!isPlainObject(row)) continue;
        const name = typeof row.name === "string" ? row.name.trim() : "";
        const id = typeof row.id === "number" && Number.isFinite(row.id) ? row.id : Number.parseInt(String(row.id ?? ""), 10);
        if (!name || !Number.isFinite(id)) continue;
        out.push({ value: id, label: name });
    }
    return out;
}

export async function fetchDevtoTagOptions(apiKey: string): Promise<DevtoTagOption[]> {
    const res = await fetch(`${DEVTO_API_BASE}/tags?per_page=1000`, { headers: devtoHeaders(apiKey) });
    const json = await readJson(res);
    throwIfUnauthorized(res.status, json);
    if (!res.ok) {
        throw new Error(mapDevtoApiError(json, res.status));
    }
    return mapDevtoTagOptions(json);
}

export function uniqueOrganizationUsernamesFromArticles(articles: unknown): string[] {
    if (!Array.isArray(articles)) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const article of articles) {
        if (!isPlainObject(article)) continue;
        const org = article.organization;
        if (!isPlainObject(org)) continue;
        const username =
            (typeof org.username === "string" && org.username.trim()) ||
            (typeof org.slug === "string" && org.slug.trim()) ||
            "";
        if (!username) continue;
        const key = username.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(username);
    }
    return out;
}

function mapDevtoOrganization(json: unknown): DevtoOrganizationOption | undefined {
    if (!isPlainObject(json)) return undefined;
    const id =
        typeof json.id === "number" && Number.isFinite(json.id)
            ? json.id
            : Number.parseInt(String(json.id ?? ""), 10);
    const name = typeof json.name === "string" ? json.name.trim() : "";
    const username = typeof json.username === "string" ? json.username.trim() : "";
    if (!Number.isFinite(id) || !username) return undefined;
    return { id, name: name || username, username };
}

export async function fetchDevtoOrganizationOptions(apiKey: string): Promise<DevtoOrganizationOption[]> {
    const articles: unknown[] = [];
    for (let page = 1; page <= 10; page += 1) {
        const res = await fetch(`${DEVTO_API_BASE}/articles/me/all?page=${page}&per_page=1000`, {
            headers: devtoHeaders(apiKey),
        });
        const json = await readJson(res);
        throwIfUnauthorized(res.status, json);
        if (!res.ok) {
            throw new Error(mapDevtoApiError(json, res.status));
        }
        if (!Array.isArray(json) || json.length === 0) break;
        articles.push(...json);
        if (json.length < 1000) break;
    }

    const usernames = uniqueOrganizationUsernamesFromArticles(articles);
    if (usernames.length === 0) return [];

    const settled = await Promise.allSettled(
        usernames.map(async (username) => {
            const res = await fetch(`${DEVTO_API_BASE}/organizations/${encodeURIComponent(username)}`, {
                headers: devtoHeaders(apiKey),
            });
            const json = await readJson(res);
            throwIfUnauthorized(res.status, json);
            if (!res.ok) return undefined;
            return mapDevtoOrganization(json);
        })
    );

    const out: DevtoOrganizationOption[] = [];
    for (const result of settled) {
        if (result.status === "rejected") {
            if (result.reason instanceof ProviderAccessTokenExpiredError) throw result.reason;
            continue;
        }
        if (!result.value) continue;
        out.push(result.value);
    }
    return out;
}

export async function publishDevtoArticle(accessToken: string, postDetails: PostDetails): Promise<PostResponse> {
    const settings = resolveDevtoSettings(postDetails.settings);
    const mainImageUrl = settings.mainImagePath ? resolveDevtoPublicMediaUrl(settings.mainImagePath) : undefined;
    const payload = buildDevtoArticlePayload(settings, postDetails.message ?? "", mainImageUrl);

    const res = await fetch(`${DEVTO_API_BASE}/articles`, {
        method: "POST",
        headers: devtoHeaders(accessToken),
        body: JSON.stringify(payload),
    });
    const json = await readJson(res);
    throwIfUnauthorized(res.status, json);
    if (!res.ok) {
        throw new Error(mapDevtoApiError(json, res.status));
    }
    if (!isPlainObject(json)) {
        throw new Error("Dev.to publish succeeded but no article was returned");
    }
    const postId = json.id == null ? "" : String(json.id).trim();
    const releaseURL = typeof json.url === "string" ? json.url.trim() : "";
    if (!postId) {
        throw new Error("Dev.to publish succeeded but no article id was returned");
    }

    return {
        id: postDetails.id,
        postId,
        status: "success",
        releaseURL,
    };
}
