import type {
    AuthTokenDetails,
    GenerateAuthUrlResponse,
    IntegrationRecord,
    PostDetails,
    PostResponse,
    SocialProvider,
    ValidateCreatePostInput,
} from "../../social.integrations.interface";

import dayjs from "dayjs";
import { makeId } from "../../../utils/ids/makeId";
import {
    assertPublicHttpsBlueskyService,
    decodeBlueskyConnectCode,
    parseBlueskyToken,
    serializeBlueskyToken,
} from "./blueskyCredentials";
import { BLUESKY_MAX_LENGTH, extractBlueskyMediaFromSettings, validateBlueskyMediaMix } from "./blueskyMedia";
import {
    fetchBlueskyProfileForCredentials,
    publishBlueskyPost,
    publishBlueskyReply,
    searchBlueskyActors,
} from "./blueskyPublish";

const BLUESKY_TOKEN_TTL_YEARS = 100;

function tokenTtlSeconds(): number {
    return dayjs().add(BLUESKY_TOKEN_TTL_YEARS, "year").unix() - dayjs().unix();
}

function authTokenFromProfile(
    token: string,
    profile: Awaited<ReturnType<typeof fetchBlueskyProfileForCredentials>>
): AuthTokenDetails {
    return {
        id: profile.id,
        name: profile.name,
        accessToken: token,
        refreshToken: token,
        expiresIn: tokenTtlSeconds(),
        picture: profile.picture,
        username: profile.username,
    };
}

/**
 * Bluesky publishing via handle and app password (no operator OAuth app).
 */
export class BlueskyProvider implements SocialProvider {
    identifier = "bluesky";
    name = "Bluesky";
    editor = "normal" as const;
    isBetweenSteps = false;
    scopes: string[] = [];

    toolTip = "Connect with your Bluesky handle and an app password";

    rules =
        "Bluesky posts support plain text up to 300 characters, up to four images or one MP4 video (not mixed), and scheduled thread replies on the same account. Links and @handles become rich-text facets at publish time.";

    maxLength(_additionalSettings?: unknown): number {
        return BLUESKY_MAX_LENGTH;
    }

    validateCreatePost(input: ValidateCreatePostInput): string | null {
        const media = extractBlueskyMediaFromSettings(input.providerSettings);
        const mixError = validateBlueskyMediaMix(media);
        if (mixError) return mixError;
        if (input.status !== "scheduled") return null;
        const message = (input.message ?? "").trim();
        if (message.length > 0) return null;
        if (input.mediaCount > 0 || media.length > 0) return null;
        return "Bluesky requires text or at least one image or video.";
    }

    async customFields() {
        return [
            {
                key: "service",
                label: "Service",
                defaultValue: "https://bsky.social",
                validation: "/^https:\\/\\/.+/",
                type: "text" as const,
            },
            {
                key: "identifier",
                label: "Handle or email",
                validation: "/^.{1,}$/",
                type: "text" as const,
            },
            {
                key: "password",
                label: "App password",
                validation: "/^.{1,}$/",
                type: "password" as const,
            },
        ];
    }

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
            const credentials = decodeBlueskyConnectCode(params.code);
            await assertPublicHttpsBlueskyService(credentials.service);
            const profile = await fetchBlueskyProfileForCredentials(credentials);
            const token = serializeBlueskyToken(credentials);
            return authTokenFromProfile(token, profile);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Invalid account details";
            if (/invalid account details/i.test(msg)) {
                return "Invalid account details";
            }
            if (/service url|https/i.test(msg)) {
                return msg;
            }
            return "Invalid account details";
        }
    }

    /** Re-validates stored credentials and extends expiry; does not persist session JWTs. */
    async refreshToken(refreshToken: string): Promise<AuthTokenDetails> {
        const credentials = parseBlueskyToken(refreshToken);
        await assertPublicHttpsBlueskyService(credentials.service);
        const profile = await fetchBlueskyProfileForCredentials(credentials);
        const token = serializeBlueskyToken(credentials);
        return authTokenFromProfile(token, profile);
    }

    async post(
        _id: string,
        accessToken: string,
        postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];
        const result = await publishBlueskyPost(accessToken, postDetails[0]!);
        return [result];
    }

    async comment(
        _userId: string,
        postId: string,
        lastCommentId: string | undefined,
        accessToken: string,
        postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];
        const parentId = (lastCommentId ?? postId ?? "").trim();
        if (!postId.trim() || !parentId) {
            throw new Error("Bluesky reply root and parent references are required");
        }
        const result = await publishBlueskyReply(accessToken, postId, parentId, postDetails[0]!);
        return [result];
    }

    async mention(
        token: string,
        data: { query: string },
        _id: string,
        _integration: IntegrationRecord
    ): Promise<{ id: string; label: string; image: string }[] | { none: true }> {
        return searchBlueskyActors(token, data.query ?? "");
    }

    mentionFormat(idOrHandle: string, name: string): string {
        const handle = idOrHandle.replace(/^@/, "").trim();
        const display = name.replace(/^@/, "").trim();
        return `@${handle || display}`;
    }
}
