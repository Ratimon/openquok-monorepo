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
    SKOOL_MAX_LENGTH,
    SKOOL_SETTINGS_SCHEMA,
    SKOOL_TITLE_MIN_LENGTH,
    resolveSkoolSettings,
} from "./resolveSkoolSettings";
import {
    decodeSkoolConnectCode,
    parseSkoolSessionToken,
    serializeSkoolSessionToken,
} from "./skoolCredentials";
import { fetchSkoolSelf } from "./skoolApi";
import {
    fetchSkoolGroupOptions,
    fetchSkoolLabelOptions,
    publishSkoolComment,
    publishSkoolPost,
} from "./skoolPublish";

const SKOOL_TOKEN_TTL_YEARS = 100;

function tokenTtlSeconds(): number {
    return dayjs().add(SKOOL_TOKEN_TTL_YEARS, "year").unix() - dayjs().unix();
}

/**
 * Skool publishing via browser-extension session cookies (no operator OAuth app).
 */
export class SkoolProvider implements SocialProvider {
    identifier = "skool";
    name = "Skool";
    editor = "normal" as const;
    isBetweenSteps = false;
    isChromeExtension = true;
    scopes: string[] = [];

    extensionCookies = [
        { name: "client_id", domain: ".skool.com" },
        { name: "auth_token", domain: ".skool.com" },
    ];

    toolTip = "Connect with the OpenQuok browser extension while logged in to Skool";

    rules =
        "Skool posts require a title, a group, and optional label. Body text is plain. Images upload to Skool storage at publish time. Follow-up comments on your own posts are supported when the group allows it.";

    maxLength(_additionalSettings?: unknown): number {
        return SKOOL_MAX_LENGTH;
    }

    validateCreatePost(input: ValidateCreatePostInput): string | null {
        const resolved = resolveSkoolSettings({
            providerSettings: input.providerSettings,
        });
        if (!resolved.title || resolved.title.length < SKOOL_TITLE_MIN_LENGTH) {
            return "Skool posts require a title";
        }
        if (!resolved.groupId) {
            return "Select a Skool group";
        }
        return null;
    }

    tools() {
        return [
            {
                methodName: "groups",
                description: "List Skool groups as { value: id, label: name } options.",
            },
            {
                methodName: "label",
                description: "List labels for a Skool group ({ id: group id } in request data).",
                dataSchema: {
                    type: "object",
                    required: ["id"],
                    properties: { id: { type: "string", description: "Skool group id" } },
                },
            },
        ];
    }

    settingsSchema() {
        return SKOOL_SETTINGS_SCHEMA;
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
            const cookies = decodeSkoolConnectCode(params.code);
            const data = await fetchSkoolSelf(cookies);
            const first = data.first_name?.trim() ?? "";
            const last = data.last_name?.trim() ?? "";
            const displayName = [first, last].filter(Boolean).join(" ").trim() || data.name || "Skool";

            return {
                refreshToken: "",
                expiresIn: tokenTtlSeconds(),
                accessToken: serializeSkoolSessionToken(cookies),
                id: String(data.id),
                name: displayName,
                picture: data.metadata?.picture_profile?.trim() || "",
                username: data.name ?? String(data.id),
            };
        } catch (e) {
            const message = e instanceof Error ? e.message : "Invalid cookie data";
            if (message.includes("Missing required cookies")) {
                return message;
            }
            return "Invalid cookie data";
        }
    }

    /** Session cookies are refreshed by the browser extension, not server cron. */
    async refreshToken(_refreshToken: string): Promise<AuthTokenDetails> {
        return {
            refreshToken: "",
            expiresIn: 0,
            accessToken: "",
            id: "",
            name: "",
            picture: "",
            username: "",
        };
    }

    async groups(
        accessToken: string,
        _data: unknown,
        internalId: string,
        _integration: IntegrationRecord
    ) {
        try {
            const cookies = parseSkoolSessionToken(accessToken);
            return await fetchSkoolGroupOptions(cookies, internalId);
        } catch {
            return [];
        }
    }

    async label(
        accessToken: string,
        data: Record<string, unknown>,
        _internalId: string,
        _integration: IntegrationRecord
    ) {
        try {
            const groupId = typeof data?.id === "string" ? data.id.trim() : "";
            if (!groupId) return [];
            const cookies = parseSkoolSessionToken(accessToken);
            return await fetchSkoolLabelOptions(cookies, groupId);
        } catch {
            return [];
        }
    }

    async post(
        id: string,
        accessToken: string,
        postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];
        const result = await publishSkoolPost(accessToken, id, postDetails[0]!);
        return [result];
    }

    async comment(
        id: string,
        postId: string,
        lastCommentId: string | undefined,
        accessToken: string,
        postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];
        const parentId = lastCommentId?.trim() || postId;
        const result = await publishSkoolComment(accessToken, id, postId, parentId, postDetails[0]!);
        return [result];
    }
}
