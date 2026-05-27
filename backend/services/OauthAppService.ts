import type { OauthAppRepository, OauthAppLike } from "../repositories/OauthAppRepository";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import { publicUrlForObjectKey, type MediaRepository } from "../repositories/MediaRepository";
import { AppError } from "../errors/AppError";
import type { PermissionsService } from "./PermissionsService";
import { makeId } from "../utils/ids/makeId";
import { hashProgrammaticToken, hashProgrammaticTokenCandidates } from "../utils/auth/tokenHash";
import { config } from "../config/GlobalConfig";
import { SubscriptionSection } from "openquok-common";

function assertValidUrl(url: string, errorMsg: string): void {
    try {
        new URL(url);
    } catch {
        throw new AppError(errorMsg, 400);
    }
}

/** Row returned from APIs so clients can render OAuth app icons without guessing R2 vs `/uploads`. */
export type OauthAppApiPayload = OauthAppLike & {
    picture_public_url: string | null;
    picture_thumbnail_public_url: string | null;
};

export class OauthAppService {
    constructor(
        private readonly oauthAppRepository: OauthAppRepository,
        private readonly organizationRepository: OrganizationRepository,
        private readonly mediaRepository: MediaRepository,
        private readonly permissionsService?: PermissionsService
    ) {}

    private async resolveAuthUserToUserId(authUserId: string): Promise<string> {
        const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId);
        if (!userId) throw new AppError("User not found", 404);
        return userId;
    }

    private async assertOrgAdmin(
        authUserId: string,
        organizationId: string,
        policy: "create" | "read" | "update" | "delete"
    ): Promise<{ userId: string }> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        if (!membership || membership.disabled) throw new AppError("Workspace not found", 404);
        if (membership.role !== "admin" && membership.role !== "owner") {
            throw new AppError("Only admins can manage OAuth apps", 403);
        }
        await this.permissionsService?.assertPolicies(
            organizationId,
            membership.role,
            [[policy, SubscriptionSection.PUBLIC_API]],
            authUserId
        );
        return { userId };
    }

    async listApps(authUserId: string, organizationId: string): Promise<OauthAppApiPayload[]> {
        // members can list; keep it strict (admin-only) for now.
        await this.assertOrgAdmin(authUserId, organizationId, "read");
        const apps = await this.oauthAppRepository.listAppsByOrganization(organizationId);
        return Promise.all(apps.map((a) => this.enrichAppWithPicturePublicUrls(a, organizationId)));
    }

    async getApp(authUserId: string, organizationId: string): Promise<OauthAppApiPayload | false> {
        await this.assertOrgAdmin(authUserId, organizationId, "read");
        const app = await this.oauthAppRepository.getAppByOrganizationId(organizationId);
        if (!app) return false;
        return this.enrichAppWithPicturePublicUrls(app, organizationId);
    }

    private async enrichAppWithPicturePublicUrls(app: OauthAppLike, organizationId: string): Promise<OauthAppApiPayload> {
        if (!app.picture_id) {
            return { ...app, picture_public_url: null, picture_thumbnail_public_url: null };
        }
        const media = await this.mediaRepository.getMediaById(organizationId, app.picture_id);
        if (!media || media.deleted_at) {
            return { ...app, picture_public_url: null, picture_thumbnail_public_url: null };
        }
        return {
            ...app,
            picture_public_url: publicUrlForObjectKey(media.path),
            picture_thumbnail_public_url: media.thumbnail ? publicUrlForObjectKey(media.thumbnail) : null,
        };
    }

    /**
     * Create an OAuth app (admin-only). Returns the raw clientSecret exactly once.
     */
    async createApp(authUserId: string, input: {
        organizationId: string;
        name: string;
        description?: string | null;
        redirectUrl: string;
        pictureId?: string | null;
    }): Promise<{ app: OauthAppApiPayload; clientId: string; clientSecret: string }> {
        const { userId } = await this.assertOrgAdmin(authUserId, input.organizationId, "create");
        const existing = await this.oauthAppRepository.getAppByOrganizationId(input.organizationId);
        if (existing) {
            throw new AppError("You can only have one OAuth application per organization", 400);
        }
        const name = input.name.trim();
        if (!name) throw new AppError("Name is required", 400);
        const redirectUrl = input.redirectUrl.trim();
        if (!redirectUrl) throw new AppError("Redirect URL is required", 400);
        assertValidUrl(redirectUrl, "Redirect URL is invalid");

        const secretKey = (config.auth as { programmaticTokenSecret?: string })?.programmaticTokenSecret ?? "";
        if (!secretKey.trim()) throw new AppError("SECURITY_SECRET is not configured", 500);

        // Distinct prefixes, so secrets/codes/tokens are visually distinguishable.
        const clientId = `oqc_${makeId(32)}`;
        const clientSecret = `oqs_${makeId(48)}`;
        const clientSecretHash = hashProgrammaticToken(clientSecret, secretKey);

        const app = await this.oauthAppRepository.createApp({
            organizationId: input.organizationId,
            createdByUserId: userId,
            name,
            description: input.description ?? null,
            pictureId: input.pictureId ?? null,
            redirectUrl,
            clientId,
            clientSecretHash,
        });
        const enriched = await this.enrichAppWithPicturePublicUrls(app, input.organizationId);
        return { app: enriched, clientId, clientSecret };
    }

    async updateApp(authUserId: string, input: {
        organizationId: string;
        oauthAppId: string;
        name?: string;
        description?: string | null;
        pictureId?: string | null;
        redirectUrl?: string;
    }): Promise<OauthAppApiPayload | null> {
        await this.assertOrgAdmin(authUserId, input.organizationId, "update");
        if (input.redirectUrl !== undefined) {
            const redirectUrl = input.redirectUrl.trim();
            if (!redirectUrl) throw new AppError("Redirect URL is invalid", 400);
            assertValidUrl(redirectUrl, "Redirect URL is invalid");
        }
        const updated = await this.oauthAppRepository.updateApp({
            organizationId: input.organizationId,
            oauthAppId: input.oauthAppId,
            name: input.name?.trim(),
            description: input.description,
            pictureId: input.pictureId,
            redirectUrl: input.redirectUrl?.trim(),
        });
        if (!updated) return null;
        return this.enrichAppWithPicturePublicUrls(updated, input.organizationId);
    }

    async rotateSecret(authUserId: string, input: { organizationId: string; oauthAppId: string }): Promise<{ clientSecret: string }> {
        await this.assertOrgAdmin(authUserId, input.organizationId, "update");
        const secretKey = (config.auth as { programmaticTokenSecret?: string })?.programmaticTokenSecret ?? "";
        if (!secretKey.trim()) throw new AppError("SECURITY_SECRET is not configured", 500);
        const newSecret = `oqs_${makeId(48)}`;
        const clientSecretHash = hashProgrammaticToken(newSecret, secretKey);
        await this.oauthAppRepository.updateClientSecretHash({
            organizationId: input.organizationId,
            oauthAppId: input.oauthAppId,
            clientSecretHash,
        });
        // Note: existing access tokens remain valid until revoked/rotated by policy.
        return { clientSecret: newSecret };
    }

    async deleteApp(authUserId: string, input: { organizationId: string; oauthAppId: string }): Promise<void> {
        await this.assertOrgAdmin(authUserId, input.organizationId, "delete");
        await this.oauthAppRepository.revokeAllForApp(input.oauthAppId);
        await this.oauthAppRepository.deleteApp(input.organizationId, input.oauthAppId);
    }

    /**
     * Programmatic access token verification for `/public/*` (OAuth2 access token).
     */
    async verifyProgrammaticToken(rawToken: string): Promise<{ organizationId: string; oauthAppId: string; tokenId: string } | null> {
        const secretKey = (config.auth as { programmaticTokenSecret?: string })?.programmaticTokenSecret ?? "";
        if (!secretKey.trim()) return null;
        const [v2, legacy] = hashProgrammaticTokenCandidates(rawToken, secretKey);
        const authz =
            (await this.oauthAppRepository.findActiveAuthorizationByAccessTokenHash(v2)) ??
            (await this.oauthAppRepository.findActiveAuthorizationByAccessTokenHash(legacy));
        if (!authz) return null;
        return { organizationId: authz.organization_id, oauthAppId: authz.oauth_app_id, tokenId: authz.id };
    }

}

