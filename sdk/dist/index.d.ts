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
    createPost(body: PublicCreatePostDto): Promise<unknown>;
    listPosts(filters: PublicListPostsQueryDto): Promise<unknown>;
    getPostGroup(postGroup: string): Promise<unknown>;
    updatePostGroup(postGroup: string, body: PublicUpdatePostGroupDto): Promise<unknown>;
    deletePostGroup(postGroup: string): Promise<unknown>;
    integrations(): Promise<unknown>;
    isConnected(): Promise<unknown>;
    getIntegrationOauthUrl(integrationIdentifier: string, refresh?: string): Promise<unknown>;
    deleteIntegrationChannel(id: string): Promise<unknown>;
    /**
     * Anonymous endpoint (no API key required).
     * Included for parity with the backend's public comment surface.
     */
    getPublicPostComments(postId: string): Promise<unknown>;
}

export { type OpenquokClientOptions, Openquok as default };
