type PublicListPostsQueryDto = {
    /**
     * ISO string (or any backend-supported date string).
     * Mirrors backend `listPostsQuerySchema.start`.
     */
    start: string;
    /**
     * ISO string (or any backend-supported date string).
     * Mirrors backend `listPostsQuerySchema.end`.
     */
    end: string;
    /**
     * Optional comma-separated integration ids to filter calendar data.
     * When omitted, all integrations (including ungrouped) are returned.
     */
    integrationIds?: string;
    /**
     * Optional channel group id (`integration_customers.id` for the workspace).
     * When set, only posts whose channel belongs to that group are returned.
     */
    customerGroupId?: string;
};
type PublicCreatePostMediaItemDto = {
    id: string;
    path: string;
    /**
     * Storage bucket name (optional).
     */
    bucket?: string;
};
type PublicCreatePostDto = {
    body?: string;
    bodiesByIntegrationId?: Record<string, string>;
    media?: PublicCreatePostMediaItemDto[];
    integrationIds?: string[];
    isGlobal?: boolean;
    scheduledAt: string;
    repeatInterval?: "day" | "two_days" | "three_days" | "four_days" | "five_days" | "six_days" | "week" | "two_weeks" | "month" | null;
    tagNames?: string[];
    providerSettingsByIntegrationId?: Record<string, Record<string, unknown>>;
    status: "draft" | "scheduled";
};
type PublicUpdatePostGroupDto = PublicCreatePostDto;
/** `GET /public/posts/{postId}` — row id and parent post group (programmatic API). */
type PublicPostSummaryDto = {
    id: string;
    postGroup: string;
};
/** `PUT /public/posts/{postId}/release-id` — `data` payload after a successful link (programmatic API). */
type PublicUpdatePostReleaseIdDataDto = {
    id: string;
    releaseId: string;
};

type OpenquokClientOptions = {
    /**
     * Base URL without a trailing slash, e.g. `http://localhost:3000` or `https://api.openquok.com`.
     */
    baseUrl?: string;
    /**
     * API prefix used by the backend (defaults to `/api/v1`).
     */
    apiPrefix?: string;
};
declare class Openquok {
    private readonly apiKey;
    private readonly apiRoot;
    constructor(apiKey: string, options?: OpenquokClientOptions);
    private json;
    /**
     * Upload media via programmatic API (`POST {apiPrefix}/public/upload`).
     * Field name `file`; organization is inferred from the API key.
     */
    upload(file: Buffer, extension: string): Promise<unknown>;
    post(body: PublicCreatePostDto): Promise<unknown>;
    postList(filters: PublicListPostsQueryDto): Promise<unknown>;
    getPostGroup(postGroup: string): Promise<unknown>;
    /** Row id and parent `postGroup` (for routing to group-scoped endpoints). */
    getPost(postId: string): Promise<{
        success: boolean;
        data: PublicPostSummaryDto;
    }>;
    updatePostGroup(postGroup: string, body: PublicUpdatePostGroupDto): Promise<unknown>;
    deletePostGroup(postGroup: string): Promise<unknown>;
    integrations(): Promise<unknown>;
    deleteIntegrationChannel(id: string): Promise<unknown>;
    /**
     * Upload media from a public URL. Server-side fetches the resource and stores it
     * just like `upload(file, extension)`; returns the same `MediaUploadResponse`.
     */
    uploadFromUrl(url: string): Promise<unknown>;
    /** Delete a single post by row id (soft-deletes the whole post group). */
    deletePost(postId: string): Promise<unknown>;
    /** Provider-side candidate ids/URLs when a published row has `release_id === "missing"`. */
    getMissingContent(postId: string): Promise<unknown>;
    /** Manually link a published row to a platform-native id (e.g. Threads media id). */
    updateReleaseId(postId: string, releaseId: string): Promise<{
        success: boolean;
        data: PublicUpdatePostReleaseIdDataDto;
    }>;
    /** Platform analytics for one channel over the given window (`7`, `30`, or `90` days). */
    getIntegrationAnalytics(integrationId: string, date: 7 | 30 | 90): Promise<unknown>;
    /** Per-post analytics over the given window. Returns `{ missing: true }` envelope when unlinked. */
    getPostAnalytics(postId: string, date: 7 | 30 | 90): Promise<unknown>;
    /** Paginated in-app notifications (page size 100). `page` is zero-based. */
    listNotifications(page?: number): Promise<unknown>;
}

export { type OpenquokClientOptions, Openquok as default };
