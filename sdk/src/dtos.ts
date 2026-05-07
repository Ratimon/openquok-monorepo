export type PublicListPostsQueryDto = {
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

export type PublicCreatePostMediaItemDto = {
    id: string;
    path: string;
    /**
     * Storage bucket name (optional).
     */
    bucket?: string;
};

export type PublicCreatePostDto = {
    body?: string;
    bodiesByIntegrationId?: Record<string, string>;
    media?: PublicCreatePostMediaItemDto[];
    integrationIds?: string[];
    isGlobal?: boolean;
    scheduledAt: string;
    repeatInterval?:
        | "day"
        | "two_days"
        | "three_days"
        | "four_days"
        | "five_days"
        | "six_days"
        | "week"
        | "two_weeks"
        | "month"
        | null;
    tagNames?: string[];
    providerSettingsByIntegrationId?: Record<string, Record<string, unknown>>;
    status: "draft" | "scheduled";
};

export type PublicUpdatePostGroupDto = PublicCreatePostDto;

