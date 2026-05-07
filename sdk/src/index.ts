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
        const baseUrl = (options.baseUrl ?? "http://localhost:3000").replace(/\/+$/g, "");
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

    async createPost(body: PublicCreatePostDto) {
        return await this.json(`${this.apiRoot}/public/posts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
            body: JSON.stringify(body),
        });
    }

    async listPosts(filters: PublicListPostsQueryDto) {
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

    async isConnected() {
        return await this.json(`${this.apiRoot}/public/is-connected`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.apiKey,
            },
        });
    }

    async getIntegrationOauthUrl(integrationIdentifier: string, refresh?: string) {
        const qs = toQueryString({ refresh });
        const url = `${this.apiRoot}/public/social/${integrationIdentifier}${qs ? `?${qs}` : ""}`;
        return await this.json(url, {
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
     * Anonymous endpoint (no API key required).
     * Included for parity with the backend's public comment surface.
     */
    async getPublicPostComments(postId: string) {
        return await this.json(`${this.apiRoot}/public/posts/${postId}/comments`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}

