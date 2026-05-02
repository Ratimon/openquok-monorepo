/**
 * Social provider contracts for OAuth, tokens, and posting.
 * Shaped like the upstream social integration library; `IntegrationRecord` replaces ORM rows.
 */

/** DB row shape used where the upstream library. */
export type IntegrationRecord = {
    id: string;
    organization_id: string;
    internal_id: string;
    name: string;
    picture: string | null;
    provider_identifier: string;
    type: string;
    token: string;
    refresh_token: string | null;
    token_expiration: string | null;
    root_internal_id: string | null;
    in_between_steps: boolean;
    refresh_needed: boolean;
    deleted_at: string | null;
};

export type ClientInformation = {
    client_id: string;
    client_secret: string;
    instanceUrl: string;
};

export type GenerateAuthUrlResponse = {
    url: string;
    codeVerifier: string;
    state: string;
};

export type AuthTokenDetails = {
    id: string;
    name: string;
    error?: string;
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    picture?: string;
    username: string;
    additionalSettings?: {
        title: string;
        description: string;
        type: "checkbox" | "text" | "textarea";
        value: unknown;
        regex?: string;
    }[];
};

export type PostResponse = {
    id: string;
    postId: string;
    releaseURL: string;
    status: string;
};

export type PostDetails<T = unknown> = {
    id: string;
    message: string;
    settings: T;
};

export type ValidateCreatePostInput = {
    status: "draft" | "scheduled";
    mediaCount: number;
};

export type AnalyticsData = {
    label: string;
    data: Array<{ total: string; date: string }>;
    percentageChange: number;
    /** When true, totals are averaged over `data` (e.g. rate-style metrics). */
    average?: boolean;
};

export interface IAuthenticator {
    authenticate(
        params: { code: string; codeVerifier: string; refresh?: string },
        clientInformation?: ClientInformation
    ): Promise<AuthTokenDetails | string>;
    refreshToken(refreshToken: string): Promise<AuthTokenDetails>;
    reConnect?(
        id: string,
        requiredId: string,
        accessToken: string
    ): Promise<Omit<AuthTokenDetails, "refreshToken" | "expiresIn">>;
    generateAuthUrl(clientInformation?: ClientInformation): Promise<GenerateAuthUrlResponse>;
    analytics?(id: string, accessToken: string, date: number): Promise<AnalyticsData[]>;
    /**
     * Per-post (published media / thread) insights. `postId` here is the provider’s public object id
     * stored in `posts.release_id` after publish, not the app’s `posts.id`.
     */
    postAnalytics?(
        integrationId: string,
        accessToken: string,
        releaseId: string,
        fromDateDays: number
    ): Promise<AnalyticsData[]>;
    changeNickname?(id: string, accessToken: string, name: string): Promise<{ name: string }>;
    changeProfilePicture?(id: string, accessToken: string, url: string): Promise<{ url: string }>;
    missing?(id: string, accessToken: string): Promise<{ id: string; url: string }[]>;
}

export interface ISocialMediaIntegration {
    post(
        id: string,
        accessToken: string,
        postDetails: PostDetails[],
        integration: IntegrationRecord
    ): Promise<PostResponse[]>;
    comment?(
        id: string,
        postId: string,
        lastCommentId: string | undefined,
        accessToken: string,
        postDetails: PostDetails[],
        integration: IntegrationRecord
    ): Promise<PostResponse[]>;
}

export type FetchPageInformationResult = {
    id: string;
    name: string;
    access_token: string;
    picture: string;
    username: string;
};

export interface SocialProvider extends IAuthenticator, ISocialMediaIntegration {
    identifier: string;
    name: string;
    refreshWait?: boolean;
    convertToJPEG?: boolean;
    refreshCron?: boolean;
    dto?: unknown;
    maxLength: (additionalSettings?: unknown) => number;
    isWeb3?: boolean;
    isChromeExtension?: boolean;
    extensionCookies?: { name: string; domain: string }[];
    editor: "none" | "normal" | "markdown" | "html";
    customFields?: () => Promise<
        {
            key: string;
            label: string;
            defaultValue?: string;
            validation: string;
            type: "text" | "password";
        }[]
    >;
    toolTip?: string;
    oneTimeToken?: boolean;
    isBetweenSteps: boolean;
    /**
     * Optional account list after OAuth when {@link isBetweenSteps} is true (e.g. Instagram Business).
     * Returned in the same HTTP response as connect, matching common “social-connect + pages” flows.
     */
    pages?(accessToken: string): Promise<unknown[]>;
    scopes: string[];
    externalUrl?: (url: string) => Promise<{ client_id: string; client_secret: string }>;
    mention?: (
        token: string,
        data: { query: string },
        id: string,
        integration: IntegrationRecord
    ) => Promise<{ id: string; label: string; image: string; doNotCache?: boolean }[] | { none: true }>;
    mentionFormat?(idOrHandle: string, name: string): string;
    fetchPageInformation?(accessToken: string, data: unknown): Promise<FetchPageInformationResult>;

    /**
     * Optional provider-owned validation for creating/scheduling posts in our app.
     * Return a human-friendly message when invalid; return null/undefined when valid.
     */
    validateCreatePost?(input: ValidateCreatePostInput): string | null | undefined;
}
