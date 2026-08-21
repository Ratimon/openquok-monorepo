import type {
    AnalyticsData,
    AuthTokenDetails,
    GenerateAuthUrlResponse,
    IntegrationRecord,
    PostDetails,
    PostResponse,
    SocialProvider,
    ValidateCreatePostInput,
} from "../../social.integrations.interface";
import {
    DEVTO_MAX_LENGTH,
    DEVTO_SETTINGS_SCHEMA,
} from "./resolveDevtoSettings";
import { fetchDevtoAccountAnalytics, fetchDevtoPostAnalytics } from "./devtoAnalytics";
import {
    fetchDevtoCurrentUser,
    fetchDevtoOrganizationOptions,
    fetchDevtoTagOptions,
    publishDevtoArticle,
} from "./devtoPublish";

import dayjs from "dayjs";
import { makeId } from "../../../utils/ids/makeId";
import { ProviderAccessTokenExpiredError } from "../../../errors/ProviderIntegrationErrors";

const DEVTO_TOKEN_TTL_YEARS = 100;

function tokenTtlSeconds(): number {
    return dayjs().add(DEVTO_TOKEN_TTL_YEARS, "year").unix() - dayjs().unix();
}

export function decodeDevtoConnectCode(code: string): string {
    try {
        const raw = Buffer.from(code.trim(), "base64").toString("utf8");
        const parsed = JSON.parse(raw) as { apiKey?: unknown };
        if (typeof parsed.apiKey === "string" && parsed.apiKey.trim().length >= 3) {
            return parsed.apiKey.trim();
        }
    } catch {
        // Invalid base64 or JSON — treated as a bad key below.
    }
    throw new Error("Invalid API key");
}

function authTokenFromProfile(apiKey: string, profile: Awaited<ReturnType<typeof fetchDevtoCurrentUser>>): AuthTokenDetails {
    return {
        id: profile.id,
        name: profile.name,
        accessToken: apiKey,
        refreshToken: "",
        expiresIn: tokenTtlSeconds(),
        picture: profile.picture,
        username: profile.username,
    };
}

/**
 * Dev.to publishing via a user-pasted API key (no operator OAuth app).
 */
export class DevToProvider implements SocialProvider {
    identifier = "devto";
    name = "Dev.to";
    editor = "markdown" as const;
    isBetweenSteps = false;
    scopes: string[] = [];

    toolTip = "Connect with a Dev.to API key (no OAuth app)";

    rules =
        "Dev.to articles are markdown. Title must be at least 2 characters. Optional cover image, up to 4 tags, organization id, canonical URL, and series name. Follow-up comments are not supported.";

    maxLength(_additionalSettings?: unknown): number {
        return DEVTO_MAX_LENGTH;
    }

    validateCreatePost(_input: ValidateCreatePostInput): string | null {
        return null;
    }

    async customFields() {
        return [
            {
                key: "apiKey",
                label: "API key",
                validation: "/^.{3,}$/",
                type: "password" as const,
            },
        ];
    }

    tools() {
        return [
            {
                methodName: "tags",
                description: "List popular Dev.to tags as { value: id, label: name } options.",
            },
            {
                methodName: "organizations",
                description: "List Dev.to organizations this API key can publish under.",
            },
        ];
    }

    settingsSchema() {
        return DEVTO_SETTINGS_SCHEMA;
    }

    /**
     * Seeds session OAuth cache without a platform redirect. The returned `url` is the
     * random `state` so the credentials form can POST it back as `state`.
     */
    async generateAuthUrl(): Promise<GenerateAuthUrlResponse> {
        const state = makeId(6);
        const codeVerifier = makeId(10);
        return { url: state, codeVerifier, state };
    }

    async authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }): Promise<AuthTokenDetails | string> {
        try {
            const apiKey = decodeDevtoConnectCode(params.code);
            const profile = await fetchDevtoCurrentUser(apiKey);
            return authTokenFromProfile(apiKey, profile);
        } catch {
            return "Invalid API key";
        }
    }

    /** API keys do not rotate; re-validate the stored key and extend expiry. */
    async refreshToken(refreshToken: string): Promise<AuthTokenDetails> {
        const profile = await fetchDevtoCurrentUser(refreshToken);
        return authTokenFromProfile(refreshToken, profile);
    }

    async tags(
        token: string,
        _data: unknown,
        _internalId: string,
        _integration: IntegrationRecord
    ) {
        return fetchDevtoTagOptions(token);
    }

    async organizations(
        token: string,
        _data: unknown,
        _internalId: string,
        _integration: IntegrationRecord
    ) {
        return fetchDevtoOrganizationOptions(token);
    }

    async post(
        _id: string,
        accessToken: string,
        postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];
        const result = await publishDevtoArticle(accessToken, postDetails[0]!);
        return [result];
    }

    /**
     * Account-wide Dev.to insights (`GET /api/analytics/historical`).
     * Scoped to the API key owner; `id` is unused.
     */
    async analytics(_id: string, accessToken: string, dateWindowDays: number): Promise<AnalyticsData[]> {
        try {
            return await fetchDevtoAccountAnalytics(accessToken, dateWindowDays);
        } catch {
            return [];
        }
    }

    /**
     * Per-article insights using Forem historical + totals (`article_id` = `release_id`).
     */
    async postAnalytics(
        _integrationId: string,
        accessToken: string,
        releaseId: string,
        dateWindowDays: number
    ): Promise<AnalyticsData[]> {
        try {
            return await fetchDevtoPostAnalytics(accessToken, releaseId, dateWindowDays);
        } catch (e) {
            if (e instanceof ProviderAccessTokenExpiredError) throw e;
            if (e instanceof Error && /Missing Dev\.to article id/i.test(e.message)) {
                throw e;
            }
            return [];
        }
    }
}
