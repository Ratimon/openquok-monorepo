import type { PublicCreatePostDto, PublicListPostsQueryDto, PublicUpdatePostGroupDto } from "./dtos";

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

    private async json<T = unknown>(input: string, init: RequestInit): Promise<T> {
        const res = await fetch(input, init);
        return (await res.json()) as T;
    }

    /**
     * Upload media via programmatic API (`POST {apiPrefix}/public/upload`).
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

        return await this.json(`${this.apiRoot}/public/upload`, {
            method: "POST",
            headers: {
                Authorization: this.apiKey,
            },
            body: formData,
        });
    }

    async post(body: PublicCreatePostDto) {
        return await this.json(`${this.apiRoot}/public/posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
            body: JSON.stringify(body),
        });
    }

    async postList(filters: PublicListPostsQueryDto) {
        return await this.json(`${this.apiRoot}/public/posts/list?${toQueryString(filters as Record<string, unknown>)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
        });
    }

    async getPostGroup(postGroup: string) {
        return await this.json(`${this.apiRoot}/public/posts/group/${postGroup}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
        });
    }

    async updatePostGroup(postGroup: string, body: PublicUpdatePostGroupDto) {
        return await this.json(`${this.apiRoot}/public/posts/group/${postGroup}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
            body: JSON.stringify(body),
        });
    }

    async deletePostGroup(postGroup: string) {
        return await this.json(`${this.apiRoot}/public/posts/group/${postGroup}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
        });
    }

    async integrations() {
        return await this.json(`${this.apiRoot}/public/integrations`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
        });
    }

    async deleteIntegrationChannel(id: string) {
        return await this.json(`${this.apiRoot}/public/integrations/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
        });
    }

    /**
     * Upload media from a public URL. Server-side fetches the resource and stores it
     * just like `upload(file, extension)`; returns the same `MediaUploadResponse`.
     */
    async uploadFromUrl(url: string) {
        return await this.json(`${this.apiRoot}/public/upload-from-url`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
            body: JSON.stringify({ url }),
        });
    }

    /** Suggest next free schedule slot. Optional `integrationId` limits to a single channel's posting times. */
    async findSlot(integrationId?: string) {
        const suffix = integrationId ? `/${encodeURIComponent(integrationId)}` : "";
        return await this.json(`${this.apiRoot}/public/posts/find-slot${suffix}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
        });
    }

    /** Delete a single post by row id (soft-deletes the whole post group). */
    async deletePost(postId: string) {
        return await this.json(`${this.apiRoot}/public/posts/${encodeURIComponent(postId)}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
        });
    }

    /** Provider-side candidate ids/URLs when a published row has `release_id === "missing"`. */
    async getMissingContent(postId: string) {
        return await this.json(`${this.apiRoot}/public/posts/${encodeURIComponent(postId)}/missing`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
        });
    }

    /** Manually link a published row to a provider-native id (e.g. Threads media id). */
    async updateReleaseId(postId: string, releaseId: string) {
        return await this.json(`${this.apiRoot}/public/posts/${encodeURIComponent(postId)}/release-id`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
            body: JSON.stringify({ releaseId }),
        });
    }

    /** Platform analytics for one channel over the given window (`7`, `30`, or `90` days). */
    async getIntegrationAnalytics(integrationId: string, date: 7 | 30 | 90) {
        return await this.json(
            `${this.apiRoot}/public/analytics/${encodeURIComponent(integrationId)}?date=${date}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
            }
        );
    }

    /** Per-post analytics over the given window. Returns `{ missing: true }` envelope when unlinked. */
    async getPostAnalytics(postId: string, date: 7 | 30 | 90) {
        return await this.json(
            `${this.apiRoot}/public/analytics/post/${encodeURIComponent(postId)}?date=${date}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiKey,
                },
            }
        );
    }

    /** Paginated in-app notifications (page size 100). `page` is zero-based. */
    async listNotifications(page = 0) {
        const qs = page > 0 ? `?page=${page}` : "";
        return await this.json(`${this.apiRoot}/public/notifications${qs}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
        });
    }
}

