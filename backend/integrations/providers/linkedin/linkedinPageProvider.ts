import type {
    AnalyticsData,
    AuthTokenDetails,
    FetchPageInformationResult,
    IntegrationRecord,
    PostDetails,
    PostResponse,
    SocialProvider,
} from "../../social.integrations.interface";

import { AppError } from "../../../errors/AppError";
import { makeId } from "../../../utils/ids/makeId";
import { fetchLinkedInPageAnalytics, fetchLinkedInPostAnalytics } from "./linkedinAnalytics";
import {
    LINKEDIN_PAGE_GLOBAL_PLUG_CATALOG,
    fetchLinkedInPostLikes,
    linkedInResharePost,
    runLinkedInAddCommentPlug,
    runLinkedInAutoPlugPost,
} from "./linkedinPlugs";
import {
    checkLinkedInScopes,
    linkedinOAuth,
    linkedinRedirectUri,
    linkedinRestHeaders,
    resolveLinkedInPageIdFromPayload,
} from "./linkedinCommon";
import { publishLinkedInComment, publishLinkedInPost } from "./linkedinPublish";
import { LinkedInProvider } from "./linkedinProvider";

export type LinkedInPageOption = {
    id: string;
    name: string;
    username?: string;
    pictureUrl: string;
};

/**
 * LinkedIn company Page publishing. OAuth completes in two steps: user login, then Page picker.
 */
export class LinkedInPageProvider extends LinkedInProvider implements SocialProvider {
    override identifier = "linkedin-page";
    override name = "LinkedIn Page";
    override isBetweenSteps = true;
    override toolTip =
        "Company Page you administer — Page picker, document carousels, and analytics";

    globalPlugCatalog() {
        return LINKEDIN_PAGE_GLOBAL_PLUG_CATALOG;
    }

    override async addComment(
        acting: IntegrationRecord,
        original: IntegrationRecord,
        postId: string,
        information: { comment?: string }
    ): Promise<void> {
        return super.addComment(acting, original, postId, information, "company");
    }

    override async repostPostUsers(
        acting: IntegrationRecord,
        original: IntegrationRecord,
        postId: string,
        information: Record<string, unknown>
    ): Promise<void> {
        return super.repostPostUsers(acting, original, postId, information, "company");
    }

    async autoRepostPost(
        integration: IntegrationRecord,
        postId: string,
        fields: { likesAmount: string }
    ): Promise<boolean> {
        const threshold = Number(fields.likesAmount);
        if (!Number.isFinite(threshold) || threshold < 0) return false;

        const totalLikes = await fetchLinkedInPostLikes(integration.token, postId);
        if (totalLikes < threshold) return false;

        await linkedInResharePost(integration, postId, "company");
        return true;
    }

    async autoPlugPost(
        integration: IntegrationRecord,
        postId: string,
        fields: { likesAmount: string; post: string }
    ): Promise<boolean> {
        return runLinkedInAutoPlugPost(integration, postId, fields, "company");
    }

    override async generateAuthUrl() {
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
            `&prompt=none&redirect_uri=${encodeURIComponent(linkedinRedirectUri("linkedin-page"))}` +
            `&state=${encodeURIComponent(state)}` +
            `&scope=${encodeURIComponent(this.scopes.join(" "))}`;

        return { url, codeVerifier, state };
    }

    override async authenticate(params: {
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
        body.append("redirect_uri", linkedinRedirectUri("linkedin-page"));
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
            id: `p_${profile.id}`,
            name: profile.name,
            accessToken: tokenJson.access_token,
            refreshToken: tokenJson.refresh_token,
            expiresIn: tokenJson.expires_in,
            picture: profile.picture,
            username: profile.username,
        };
    }

    async pages(accessToken: string): Promise<LinkedInPageOption[]> {
        const rows = await this.listAdminOrganizations(accessToken);
        return rows.map((row) => ({
            id: row.id,
            name: row.name,
            username: row.username,
            pictureUrl: row.picture ?? "",
        }));
    }

    private async listAdminOrganizations(accessToken: string): Promise<
        Array<{ id: string; name: string; username?: string; picture?: string }>
    > {
        const res = await fetch(
            "https://api.linkedin.com/v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR" +
                "&projection=(elements*(organizationalTarget~(localizedName,vanityName,logoV2(original~:playableStreams))))",
            { headers: linkedinRestHeaders(accessToken) }
        );
        const json = (await res.json()) as {
            elements?: Array<{
                organizationalTarget?: string;
                "organizationalTarget~"?: {
                    localizedName?: string;
                    vanityName?: string;
                    logoV2?: { "original~"?: { elements?: Array<{ identifiers?: Array<{ identifier?: string }> }> } };
                };
            }>;
            message?: string;
        };

        if (!res.ok) {
            throw new Error(json.message ?? "Could not list LinkedIn Pages");
        }

        return (json.elements ?? []).map((e) => {
            const target = e.organizationalTarget ?? "";
            const id = target.split(":").pop() ?? "";
            const meta = e["organizationalTarget~"];
            return {
                id,
                name: meta?.localizedName ?? id,
                username: meta?.vanityName,
                picture: meta?.logoV2?.["original~"]?.elements?.[0]?.identifiers?.[0]?.identifier,
            };
        });
    }

    async fetchPageInformation(accessToken: string, data: unknown): Promise<FetchPageInformationResult> {
        const pageId = resolveLinkedInPageIdFromPayload(data);
        const res = await fetch(
            `https://api.linkedin.com/v2/organizations/${pageId}?projection=(id,localizedName,vanityName,logoV2(original~:playableStreams))`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const org = (await res.json()) as {
            id?: string | number;
            localizedName?: string;
            vanityName?: string;
            logoV2?: { "original~"?: { elements?: Array<{ identifiers?: Array<{ identifier?: string }> }> } };
            message?: string;
        };

        if (!res.ok || org.id == null) {
            throw new Error(org.message ?? "Could not load LinkedIn Page");
        }

        return {
            id: String(org.id),
            name: org.localizedName ?? String(org.id),
            access_token: accessToken,
            picture: org.logoV2?.["original~"]?.elements?.[0]?.identifiers?.[0]?.identifier ?? "",
            username: org.vanityName ?? "",
        };
    }

    async reConnect(
        _userSub: string,
        pageId: string,
        accessToken: string
    ): Promise<Omit<AuthTokenDetails, "refreshToken" | "expiresIn">> {
        const information = await this.fetchPageInformation(accessToken, { page: pageId });
        return {
            id: information.id,
            name: information.name,
            accessToken: information.access_token,
            picture: information.picture,
            username: information.username,
        };
    }

    override async post(
        id: string,
        accessToken: string,
        postDetails: PostDetails[],
        integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];
        const result = await publishLinkedInPost(id, accessToken, postDetails[0]!, "company");
        return [result];
    }

    override async comment(
        id: string,
        postId: string,
        lastCommentId: string | undefined,
        accessToken: string,
        postDetails: PostDetails[],
        integration: IntegrationRecord
    ): Promise<PostResponse[]> {
        if (!postDetails.length) return [];
        const result = await publishLinkedInComment(id, accessToken, postId, postDetails[0]!, "company");
        return [result];
    }

    async analytics(id: string, accessToken: string, dateWindowDays: number): Promise<AnalyticsData[]> {
        return fetchLinkedInPageAnalytics(id, accessToken, dateWindowDays);
    }

    async postAnalytics(
        integrationId: string,
        accessToken: string,
        releaseId: string,
        fromDateDays: number
    ): Promise<AnalyticsData[]> {
        return fetchLinkedInPostAnalytics(integrationId, accessToken, releaseId, fromDateDays);
    }
}
