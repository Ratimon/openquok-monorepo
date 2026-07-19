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
    /**
     * Optional channel group id (`integration_customers.id` for the workspace).
     * When set, only posts whose channel belongs to that group are returned.
     */
    customerGroupId?: string;
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
    /** When true or omitted, sets `isAgentEdited` (CLI/agent). Omit on dashboard session creates. */
    isAgent?: boolean;
    /** Optional kanban review checklist for humans (agent/CLI creates). */
    note?: string | null;
};

/** `PUT /public/posts/{postId}/status` — body uses `schedule` as a synonym for `scheduled`. */
export type PublicFlipPostStatusDto = {
    status: "draft" | "schedule" | "scheduled";
};

/** `GET /public/posts/{postId}` — row id and parent post group (programmatic API). */
export type PublicPostSummaryDto = {
    id: string;
    postGroup: string;
};

/** `DELETE /public/posts/{postId}` — deleted row id and parent post group (programmatic API). */
export type PublicDeletePostDataDto = {
    postId: string;
    postGroup: string;
};

/** `PUT /public/posts/{postId}/release-id` — `data` payload after a successful link (programmatic API). */
export type PublicUpdatePostReleaseIdDataDto = {
    id: string;
    releaseId: string;
};

/** `PUT /public/posts/{postId}/review-todo` — kanban review note / reviewed flag (programmatic API). */
export type PublicUpdatePostReviewTodoDto = {
    note?: string | null;
    isReviewed?: boolean;
    kanbanManualFinishAcknowledged?: boolean;
    /** When true (CLI/agent), keeps `isAgentEdited` on the post group. */
    isAgent?: boolean;
};

/** `GET /public/workspace` — workspace bound to the API key. */
export type PublicWorkspaceDto = {
    workspace: {
        id: string;
        name: string;
    };
};

/** `POST /public/integration-trigger/{id}` */
export type PublicIntegrationTriggerDto = {
    methodName: string;
    data?: Record<string, unknown>;
};

/** `GET /public/groups` — channel group row (`integration_customers`). */
export type PublicChannelGroupDto = {
    id: string;
    name: string;
};

/** `GET /public/integrations` — connected channel summary. */
export type PublicIntegrationDto = {
    id: string;
    name: string;
    identifier: string;
    picture: string;
    disabled: boolean;
    profile: unknown;
    customer: { id: string; name: string } | null;
};

/** `POST /public/integration-plugs/{id}` — field name/value pairs for a plug rule. */
export type PublicPlugFieldDto = {
    name: string;
    value: string;
};

/** `POST /public/integration-plugs/{id}` */
export type PublicPlugUpsertBodyDto = {
    func: string;
    fields: PublicPlugFieldDto[];
    /** When set, updates this plug row; omit to create another rule for the same plug type. */
    plugId?: string;
};

/** `GET /public/integration-plugs/{id}` — saved global plug rule row. */
export type PublicIntegrationPlugRowDto = {
    id: string;
    organization_id: string;
    integration_id: string;
    plug_function: string;
    data: string;
    activated: boolean;
};

/** `GET /public/plug-catalog` — field metadata for a global plug type. */
export type PublicPlugCatalogFieldDto = {
    name: string;
    description: string;
    type: string;
    placeholder: string;
    validation?: string;
};

/** `GET /public/plug-catalog` — one global plug type for a provider. */
export type PublicPlugCatalogEntryDto = {
    methodName: string;
    identifier: string;
    title: string;
    description: string;
    runEveryMilliseconds: number;
    totalRuns: number;
    fields: PublicPlugCatalogFieldDto[];
};

/** `GET /public/plug-catalog` — global plug types grouped by provider. */
export type PublicProviderPlugsCatalogDto = {
    name: string;
    identifier: string;
    plugs: PublicPlugCatalogEntryDto[];
};

/** `GET /public/plug-catalog` */
export type PublicPlugCatalogDto = {
    plugs: PublicProviderPlugsCatalogDto[];
};

/** `POST /public/integration-plugs/{id}` — upsert response. */
export type PublicPlugUpsertResultDto = {
    id: string;
    activated: boolean;
};

/** `DELETE /public/plugs/{plugId}` and `PUT /public/plugs/{plugId}/activate` — mutation response. */
export type PublicPlugMutationResultDto = {
    id: string;
};

