import type { OauthAppRepository, OauthAppLike } from "../repositories/OauthAppRepository";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import { AppError } from "../errors/AppError";
import { makeId } from "../utils/make.is";
import { hashProgrammaticToken, hashProgrammaticTokenCandidates } from "../utils/tokenHash";
import { config } from "../config/GlobalConfig";

function assertValidUrl(url: string, errorMsg: string): void {
    try {
        new URL(url);
    } catch {
        throw new AppError(errorMsg, 400);
    }
}

export class OauthAppService {
    constructor(
        private readonly oauthAppRepository: OauthAppRepository,
        private readonly organizationRepository: OrganizationRepository
    ) {}

    private async resolveAuthUserToUserId(authUserId: string): Promise<string> {
        const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId);
        if (!userId) throw new AppError("User not found", 404);
        return userId;
    }

    private async assertOrgAdmin(authUserId: string, organizationId: string): Promise<{ userId: string }> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        if (!membership || membership.disabled) throw new AppError("Workspace not found", 404);
        if (membership.role !== "admin" && membership.role !== "superadmin") {
            throw new AppError("Only admins can manage OAuth apps", 403);
        }
        return { userId };
    }

    async listApps(authUserId: string, organizationId: string): Promise<OauthAppLike[]> {
        // members can list; keep it strict (admin-only) for now.
        await this.assertOrgAdmin(authUserId, organizationId);
        return this.oauthAppRepository.listAppsByOrganization(organizationId);
    }

    async getApp(authUserId: string, organizationId: string): Promise<OauthAppLike | false> {
        await this.assertOrgAdmin(authUserId, organizationId);
        const app = await this.oauthAppRepository.getAppByOrganizationId(organizationId);
        return app ?? false;
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
    }): Promise<{ app: OauthAppLike; clientId: string; clientSecret: string }> {
        const { userId } = await this.assertOrgAdmin(authUserId, input.organizationId);
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

        const clientId = `opo_${makeId(32)}`;
        const clientSecret = `opo_${makeId(48)}`;
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
        return { app, clientId, clientSecret };
    }

    async updateApp(authUserId: string, input: {
        organizationId: string;
        oauthAppId: string;
        name?: string;
        description?: string | null;
        pictureId?: string | null;
        redirectUrl?: string;
    }): Promise<OauthAppLike | null> {
        await this.assertOrgAdmin(authUserId, input.organizationId);
        if (input.redirectUrl !== undefined) {
            const redirectUrl = input.redirectUrl.trim();
            if (!redirectUrl) throw new AppError("Redirect URL is invalid", 400);
            assertValidUrl(redirectUrl, "Redirect URL is invalid");
        }
        return this.oauthAppRepository.updateApp({
            organizationId: input.organizationId,
            oauthAppId: input.oauthAppId,
            name: input.name?.trim(),
            description: input.description,
            pictureId: input.pictureId,
            redirectUrl: input.redirectUrl?.trim(),
        });
    }

    async rotateSecret(authUserId: string, input: { organizationId: string; oauthAppId: string }): Promise<{ clientSecret: string }> {
        await this.assertOrgAdmin(authUserId, input.organizationId);
        const secretKey = (config.auth as { programmaticTokenSecret?: string })?.programmaticTokenSecret ?? "";
        if (!secretKey.trim()) throw new AppError("SECURITY_SECRET is not configured", 500);
        const newSecret = `opo_${makeId(48)}`;
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
        await this.assertOrgAdmin(authUserId, input.organizationId);
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

