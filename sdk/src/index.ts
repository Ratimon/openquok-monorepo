import type { Buffer } from "node:buffer";

import { withAgentCreatePayload } from "./agent";
import type {
    PublicCreatePostDto,
    PublicDeletePostDataDto,
    PublicFlipPostStatusDto,
    PublicIntegrationTriggerDto,
    PublicListPostsQueryDto,
    PublicPostSummaryDto,
    PublicUpdatePostReleaseIdDataDto,
    PublicUpdatePostReviewTodoDto,
    PublicWorkspaceDto,
} from "./dtos";
import { OpenquokHttpError, requestJson } from "./http";

export { withAgentCreatePayload } from "./agent";
export { OpenquokHttpError } from "./http";
export type {
    PublicCreatePostDto,
    PublicCreatePostMediaItemDto,
    PublicDeletePostDataDto,
    PublicFlipPostStatusDto,
    PublicIntegrationTriggerDto,
    PublicListPostsQueryDto,
    PublicPostSummaryDto,
    PublicUpdatePostReleaseIdDataDto,
    PublicUpdatePostReviewTodoDto,
    PublicWorkspaceDto,
} from "./dtos";

function toQueryString(obj: Record<string, unknown>): string {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });
    return params.toString();
}

export type OpenquokClientOptions = {
    /**
     * Base URL without a trailing slash, e.g. `http://localhost:3000` or `https://api.openquok.com`.
     */
    baseUrl?: string;
    /**
     * API prefix used by the backend (defaults to `/api/v1`).
     */
    apiPrefix?: string;
};

export default class Openquok {
    private readonly apiRoot: string;

    constructor(
        private readonly apiKey: string,
        options: OpenquokClientOptions = {}
    ) {
        const baseUrl = (options.baseUrl ?? "https://api.openquok.com").replace(/\/+$/g, "");
        const apiPrefix = options.apiPrefix ?? "/api/v1";
        this.apiRoot = `${baseUrl}${apiPrefix}`;
    }

    private url(pathname: string): string {
        return `${this.apiRoot}${pathname}`;
    }

    private async json<T>(pathname: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
        return await requestJson<T>({
            url: this.url(pathname),
            apiKey: this.apiKey,
            method: init.method,
            body: init.body,
        });
    }

    /** `GET /public/is-connected` — verify the API key and subscription. */
    async isConnected(): Promise<unknown> {
        return await this.json("/public/is-connected");
    }

    /** Workspace bound to the current API credentials (`GET /public/workspace`). */
    async getWorkspace(): Promise<PublicWorkspaceDto> {
        return await this.json<PublicWorkspaceDto>("/public/workspace");
    }

    /**
     * Upload media via programmatic API (`POST /public/upload`).
     * Field name `file`; organization is inferred from the API key.
     */
    async upload(file: Buffer, extension: string) {
        const ext = extension.replace(/^\./, "").toLowerCase();
        const type =
            ext === "png"
                ? "image/png"
                : ext === "jpg" || ext === "jpeg"
                  ? "image/jpeg"
                  : ext === "gif"
                    ? "image/gif"
                    : "image/jpeg";

        const formData = new FormData();
        const blob = new Blob([new Uint8Array(file)], { type });
        formData.append("file", blob, ext);

        const res = await fetch(this.url("/public/upload"), {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                Accept: "application/json",
            },
            body: formData,
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

        return parsed;
    }

    /**
     * Upload media from a public URL. Server-side fetches the resource and stores it
     * just like `upload(file, extension)`; returns the same upload response shape.
     */
    async uploadFromUrl(url: string) {
        return await this.json("/public/upload-from-url", {
            method: "POST",
            body: { url },
        });
    }

    async post(body: PublicCreatePostDto) {
        return await this.json("/public/posts", {
            method: "POST",
            body,
        });
    }

    /** Agent/CLI create with `isAgent: true` (kanban review workflow). */
    async postAsAgent(body: PublicCreatePostDto) {
        return await this.post(withAgentCreatePayload(body));
    }

    async postList(filters: PublicListPostsQueryDto) {
        const qs = toQueryString(filters as Record<string, unknown>);
        return await this.json(`/public/posts/list?${qs}`);
    }

    /** Row id and parent `postGroup` (for correlating list rows with the workspace). */
    async getPost(postId: string): Promise<{ success: boolean; data: PublicPostSummaryDto }> {
        return await this.json(`/public/posts/${encodeURIComponent(postId)}`);
    }

    /**
     * Flip the post group that `postId` belongs to between `draft` and `scheduled`
     * at the stored publish time (`PUT /public/posts/:postId/status`).
     */
    async flipPostStatus(
        postId: string,
        statusOrBody: PublicFlipPostStatusDto | "draft" | "scheduled"
    ) {
        const body: PublicFlipPostStatusDto =
            typeof statusOrBody === "string" ? { status: statusOrBody } : statusOrBody;
        return await this.json(`/public/posts/${encodeURIComponent(postId)}/status`, {
            method: "PUT",
            body,
        });
    }

    /** Update kanban review note / reviewed flag (`PUT /public/posts/:postId/review-todo`). */
    async updatePostReviewTodo(postId: string, body: PublicUpdatePostReviewTodoDto) {
        return await this.json(`/public/posts/${encodeURIComponent(postId)}/review-todo`, {
            method: "PUT",
            body,
        });
    }

    async integrations() {
        return await this.json("/public/integrations");
    }

    /**
     * Provider rules, max length, settings schema, and allow-listed tools
     * (`GET /public/integration-settings/:id`).
     */
    async getIntegrationSettings(integrationId: string) {
        return await this.json(`/public/integration-settings/${encodeURIComponent(integrationId)}`);
    }

    /**
     * Invoke an allow-listed provider tool (`POST /public/integration-trigger/:id`).
     * `data` shape is provider-specific — see `output.tools` from `getIntegrationSettings`.
     */
    async triggerIntegration(integrationId: string, body: PublicIntegrationTriggerDto) {
        return await this.json(`/public/integration-trigger/${encodeURIComponent(integrationId)}`, {
            method: "POST",
            body,
        });
    }

    /**
     * OAuth connect URL for a provider identifier (`GET /public/social/:integration`).
     * Pass `refresh` to reconnect an existing integration row.
     */
    async getIntegrationOAuthUrl(integrationIdentifier: string, options?: { refresh?: string }) {
        const qs = options?.refresh ? toQueryString({ refresh: options.refresh }) : "";
        const path = `/public/social/${encodeURIComponent(integrationIdentifier)}${qs ? `?${qs}` : ""}`;
        return await this.json(path);
    }

    async deleteIntegrationChannel(id: string) {
        return await this.json(`/public/integrations/${encodeURIComponent(id)}`, {
            method: "DELETE",
        });
    }

    /** Delete a single post by row id (soft-deletes the whole post group). */
    async deletePost(postId: string): Promise<{ success: boolean; data: PublicDeletePostDataDto }> {
        return await this.json(`/public/posts/${encodeURIComponent(postId)}`, {
            method: "DELETE",
        });
    }

    /** Provider-side candidate ids/URLs when a published row has `release_id === "missing"`. */
    async getMissingContent(postId: string) {
        return await this.json(`/public/posts/${encodeURIComponent(postId)}/missing`);
    }

    /** Manually link a published row to a platform-native id (e.g. Threads media id). */
    async updateReleaseId(postId: string, releaseId: string) {
        return await this.json<{ success: boolean; data: PublicUpdatePostReleaseIdDataDto }>(
            `/public/posts/${encodeURIComponent(postId)}/release-id`,
            {
                method: "PUT",
                body: { releaseId },
            }
        );
    }

    /** Platform analytics for one channel over the given window (`7`, `30`, or `90` days). */
    async getIntegrationAnalytics(integrationId: string, date: 7 | 30 | 90) {
        return await this.json(
            `/public/analytics/${encodeURIComponent(integrationId)}?date=${date}`
        );
    }

    /** Per-post analytics over the given window. Returns `{ missing: true }` envelope when unlinked. */
    async getPostAnalytics(postId: string, date: 7 | 30 | 90) {
        return await this.json(`/public/analytics/post/${encodeURIComponent(postId)}?date=${date}`);
    }

    /** Paginated in-app notifications (page size 100). `page` is zero-based. */
    async listNotifications(page = 0) {
        const qs = page > 0 ? `?page=${page}` : "";
        return await this.json(`/public/notifications${qs}`);
    }
}
