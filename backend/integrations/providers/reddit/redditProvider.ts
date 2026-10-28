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
    REDDIT_MAX_LENGTH,
    REDDIT_SETTINGS_SCHEMA,
    REDDIT_TITLE_MIN_LENGTH,
    redditPerChannelSettingsActive,
    resolveRedditSettings,
    validateRedditSubredditSlug,
} from "./resolveRedditSettings";
import { decodeRedditManualConnectCode } from "./redditCredentials";
import { REDDIT_TITLE_MAX_LENGTH } from "./redditOAuth";

const REDDIT_TOKEN_TTL_YEARS = 100;

const REDDIT_SERVER_PUBLISH_MESSAGE =
    "Reddit posts must be completed in the member browser; server publish is not supported.";

function tokenTtlSeconds(): number {
    return dayjs().add(REDDIT_TOKEN_TTL_YEARS, "year").unix() - dayjs().unix();
}

/**
 * Reddit manual channel — no Reddit login stored on the server. Publish completes on reddit.com
 * (copy, open submit, autofill); optional OpenQuok browser extension assists at due time.
 */
export class RedditProvider implements SocialProvider {
    identifier = "reddit";
    name = "Reddit";
    editor = "markdown" as const;
    isBetweenSteps = false;
    isChromeExtension = false;
    extensionPublishMode = "member_browser_handoff" as const;
    scopes: string[] = [];

    toolTip = "Add a Reddit channel to draft and schedule in OpenQuok; you post on reddit.com when due";

    rules =
        "Reddit posts are drafted and scheduled in OpenQuok. At publish time you complete the submit form on reddit.com in your browser (autofill only — you click Post). OpenQuok does not store your Reddit login or publish from the server.";

    maxLength(_additionalSettings?: unknown): number {
        return REDDIT_MAX_LENGTH;
    }

    validateCreatePost(input: ValidateCreatePostInput): string | null {
        const resolved = resolveRedditSettings({
            providerSettings: input.providerSettings,
        });
        if (!redditPerChannelSettingsActive(resolved)) {
            return null;
        }

        const subredditError = validateRedditSubredditSlug(resolved.subreddit);
        if (subredditError) return subredditError;

        if (!resolved.title || resolved.title.length < REDDIT_TITLE_MIN_LENGTH) {
            return "Reddit posts require a title";
        }
        if (resolved.title.length > REDDIT_TITLE_MAX_LENGTH) {
            return `Reddit titles must be at most ${REDDIT_TITLE_MAX_LENGTH} characters`;
        }
        return null;
    }

    async customFields() {
        return [
            {
                key: "label",
                label: "Channel label (optional)",
                validation: "/^.{0,80}$/",
                type: "text" as const,
            },
        ];
    }

    settingsSchema() {
        return REDDIT_SETTINGS_SCHEMA;
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
            const { label } = decodeRedditManualConnectCode(params.code);
            const id = makeId(12);
            const displayName = label || "Reddit";
            return {
                refreshToken: "",
                expiresIn: tokenTtlSeconds(),
                accessToken: "",
                id,
                name: displayName,
                picture: "",
                username: displayName,
            };
        } catch (e) {
            const message = e instanceof Error ? e.message : "Invalid connect payload";
            return message;
        }
    }

    /** Manual channel — no Reddit token to refresh on the server. */
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

    async post(
        _id: string,
        _accessToken: string,
        _postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        throw new Error(REDDIT_SERVER_PUBLISH_MESSAGE);
    }

    async comment(
        _id: string,
        _postId: string,
        _lastCommentId: string | undefined,
        _accessToken: string,
        _postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        throw new Error(REDDIT_SERVER_PUBLISH_MESSAGE);
    }
}
