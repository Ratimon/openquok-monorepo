import type {
    AuthTokenDetails,
    GenerateAuthUrlResponse,
    IntegrationRecord,
    PostDetails,
    PostResponse,
    SocialProvider,
    ValidateCreatePostInput,
} from "../../social.integrations.interface";

import { AppError } from "../../../errors/AppError";
import { makeId } from "../../../utils/ids/makeId";
import {
    checkLinkedInScopes,
    linkedinOAuth,
    linkedinRedirectUri,
    LINKEDIN_SCOPES,
    linkedinRestHeaders,
} from "./linkedinCommon";
import {
    LINKEDIN_INTERNAL_PLUG_CATALOG,
    linkedInResharePost,
    runLinkedInAddCommentPlug,
} from "./linkedinPlugs";
import { publishLinkedInComment, publishLinkedInPost, type LinkedInAuthorType } from "./linkedinPublish";

/**
 * LinkedIn personal profile publishing via LinkedIn REST Posts API.
 */
export class LinkedInProvider implements SocialProvider {
    identifier = "linkedin";
    name = "LinkedIn";
    editor = "normal" as const;
    isBetweenSteps = false;
    refreshWait = true;
    refreshCron = true;
    oneTimeToken = true;

    scopes = [...LINKEDIN_SCOPES];

    rules =
        "LinkedIn posts support up to 3,000 characters, images, a single MP4 video, or a document carousel (2+ images converted to PDF). Follow-up comments are text-only. Video posts allow one attachment.";

    maxLength(_additionalSettings?: unknown): number {
        return 3000;
    }

    validateCreatePost(_input: ValidateCreatePostInput): string | null {
        return null;
    }

    internalPlugCatalog() {
        return LINKEDIN_INTERNAL_PLUG_CATALOG;
    }

    tools() {
        return [
            {
                methodName: "company",
                description: "Resolve a linkedin.com/company/{vanity} URL to an organization mention tag.",
                dataSchema: {
                    type: "object",
                    properties: { url: { type: "string" } },
                    required: ["url"],
                },
            },
        ];
    }

    async company(
        token: string,
        data: { url: string },
        _internalId: string,
        _integration: IntegrationRecord
    ): Promise<{
        options: { label: string; value: string };
    }> {
        const url = typeof data.url === "string" ? data.url.trim() : "";
        const match = url.match(/^https?:\/\/(?:www\.)?linkedin\.com\/company\/([^/]+)\/?$/i);
        if (!match?.[1]) {
            throw new Error("Invalid LinkedIn company URL");
        }

        const res = await fetch(
            `https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=${encodeURIComponent(match[1])}`,
            { headers: linkedinRestHeaders(token) }
        );
        const json = (await res.json()) as {
            elements?: Array<{ id: string | number; localizedName?: string }>;
            message?: string;
        };
        if (!res.ok || !json.elements?.length) {
            throw new Error(json.message ?? "Company not found");
        }

        const org = json.elements[0]!;
        const name = org.localizedName ?? String(org.id);
        return {
            options: {
                label: name,
                value: `@[${name}](urn:li:organization:${org.id})`,
            },
        };
    }

    /**
     * Cross-account internal plug: comment from another connected LinkedIn channel.
     */
    async addComment(
        acting: IntegrationRecord,
        _original: IntegrationRecord,
        postId: string,
        information: { comment?: string },
        authorType: LinkedInAuthorType = "personal"
    ): Promise<void> {
        await runLinkedInAddCommentPlug(acting, postId, information, authorType);
    }

    /**
     * Cross-account internal plug: reshare from another connected LinkedIn channel.
     */
    async repostPostUsers(
        acting: IntegrationRecord,
        _original: IntegrationRecord,
        postId: string,
        _information: Record<string, unknown>,
        authorType: LinkedInAuthorType = "personal"
    ): Promise<void> {
        await linkedInResharePost(acting, postId, authorType);
    }

    async generateAuthUrl(): Promise<GenerateAuthUrlResponse> {
        const { clientId } = linkedinOAuth();
        if (!clientId) {
            throw new AppError(
                "LinkedIn OAuth is not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET.",
                503
            );
        }

        const state = makeId(6);
        const codeVerifier = makeId(30);
        const url =
            `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(clientId)}` +
            `&prompt=none&redirect_uri=${encodeURIComponent(linkedinRedirectUri("linkedin"))}` +
            `&state=${encodeURIComponent(state)}` +
            `&scope=${encodeURIComponent(this.scopes.join(" "))}`;

        return { url, codeVerifier, state };
    }

    async authenticate(params: {
        code: string;
        codeVerifier: string;
        refresh?: string;
    }): Promise<AuthTokenDetails> {
        const { clientId, clientSecret } = linkedinOAuth();
        if (!clientId || !clientSecret) {
            throw new AppError("LinkedIn OAuth is not configured.", 503);
        }

        const body = new URLSearchParams();
        body.append("grant_type", "authorization_code");
        body.append("code", params.code);
        body.append("redirect_uri", linkedinRedirectUri("linkedin"));
        body.append("client_id", clientId);
        body.append("client_secret", clientSecret);

        const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });
        const tokenJson = (await tokenRes.json()) as {
            access_token?: string;
            expires_in?: number;
            refresh_token?: string;
            scope?: string;
            error_description?: string;
        };

        if (!tokenJson.access_token) {
            throw new Error(tokenJson.error_description ?? "LinkedIn token exchange failed");
        }

        checkLinkedInScopes(this.scopes, tokenJson.scope);

        const profile = await this.fetchLinkedInProfile(tokenJson.access_token);
        return {
            id: profile.id,
            name: profile.name,
            accessToken: tokenJson.access_token,
            refreshToken: tokenJson.refresh_token,
            expiresIn: tokenJson.expires_in,
            picture: profile.picture,
            username: profile.username,
        };
    }

    async refreshToken(refresh_token: string): Promise<AuthTokenDetails> {
        const { clientId, clientSecret } = linkedinOAuth();
        if (!clientId || !clientSecret) {
            throw new AppError("LinkedIn OAuth is not configured.", 503);
        }

        const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token,
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        const tokenJson = (await tokenRes.json()) as {
            access_token?: string;
            expires_in?: number;
            refresh_token?: string;
            error_description?: string;
        };

        if (!tokenJson.access_token) {
            throw new Error(tokenJson.error_description ?? "LinkedIn token refresh failed");
        }

        const profile = await this.fetchLinkedInProfile(tokenJson.access_token);
        return {
            id: profile.id,
            name: profile.name,
            accessToken: tokenJson.access_token,
            refreshToken: tokenJson.refresh_token ?? refresh_token,
            expiresIn: tokenJson.expires_in,
            picture: profile.picture,
            username: profile.username,
        };
    }

    protected async fetchLinkedInProfile(accessToken: string): Promise<{
        id: string;
        name: string;
        picture: string;
        username: string;
    }> {
        const [userinfoRes, meRes] = await Promise.all([
            fetch("https://api.linkedin.com/v2/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
            fetch("https://api.linkedin.com/v2/me", {
                headers: { Authorization: `Bearer ${accessToken}` },
            }),
        ]);

        const userinfo = (await userinfoRes.json()) as {
            sub?: string;
            name?: string;
            picture?: string;
        };
        const me = (await meRes.json()) as { vanityName?: string };

        return {
            id: String(userinfo.sub ?? ""),
            name: userinfo.name ?? "",
            picture: userinfo.picture ?? "",
            username: me.vanityName ?? "",
        };
    }

    async post(
        id: string,
        accessToken: string,
        postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];
        const result = await publishLinkedInPost(id, accessToken, postDetails[0]!, "personal");
        return [result];
    }

    async comment(
        id: string,
        postId: string,
        _lastCommentId: string | undefined,
        accessToken: string,
        postDetails: PostDetails[],
        _integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];
        const result = await publishLinkedInComment(id, accessToken, postId, postDetails[0]!, "personal");
        return [result];
    }

    async mention(
        token: string,
        data: { query: string },
        _id: string,
        _integration: IntegrationRecord
    ): Promise<{ id: string; label: string; image: string }[] | { none: true }> {
        const res = await fetch(
            `https://api.linkedin.com/v2/organizations?q=vanityName&vanityName=${encodeURIComponent(data.query)}` +
                `&projection=(elements*(id,localizedName,logoV2(original~:playableStreams)))`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "X-Restli-Protocol-Version": "2.0.0",
                    "LinkedIn-Version": "202601",
                    "Content-Type": "application/json",
                },
            }
        );
        const json = (await res.json()) as {
            elements?: Array<{
                id: string | number;
                localizedName?: string;
                logoV2?: { "original~"?: { elements?: Array<{ identifiers?: Array<{ identifier?: string }> }> } };
            }>;
        };

        const elements = json.elements ?? [];
        if (!elements.length) return { none: true };

        return elements.map((p) => ({
            id: String(p.id),
            label: p.localizedName ?? String(p.id),
            image: p.logoV2?.["original~"]?.elements?.[0]?.identifiers?.[0]?.identifier ?? "",
        }));
    }

    mentionFormat(idOrHandle: string, name: string): string {
        return `@[${name.replace("@", "")}](urn:li:organization:${idOrHandle})`;
    }
}
