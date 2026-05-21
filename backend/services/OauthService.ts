import type {
    OauthAppLike,
    OauthAppPublicLike,
    OauthAuthorizationLike,
    OauthAppRepository,
} from "../repositories/OauthAppRepository";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { MediaRepository } from "../repositories/MediaRepository";
import { publicUrlForObjectKey } from "../repositories/MediaRepository";
import { AppError } from "../errors/AppError";
import { config } from "../config/GlobalConfig";
import { makeId } from "../utils/ids/makeId";
import { hashProgrammaticToken, hashProgrammaticTokenCandidates, timingSafeEqualHexOrPrefixed } from "../utils/auth/tokenHash";

/** API row for approved third-party OAuth apps (authorization + public app metadata + picture URLs). */
export type ApprovedAuthorizationApiItem = OauthAuthorizationLike & {
    oauth_app:
        | (OauthAppPublicLike & {
              picture_public_url: string | null;
              picture_thumbnail_public_url: string | null;
          })
        | null;
};

export class OauthService {
    constructor(
        private readonly oauthAppRepository: OauthAppRepository,
        private readonly organizationRepository: OrganizationRepository,
        private readonly mediaRepository: MediaRepository
    ) {}

    private mustGetSecretKey(): string {
        const secretKey = (config.auth as { programmaticTokenSecret?: string })?.programmaticTokenSecret ?? "";
        if (!secretKey.trim()) throw new AppError("SECURITY_SECRET is not configured", 500);
        return secretKey;
    }

    private async resolveAuthUserToUserId(authUserId: string): Promise<string> {
        const { userId } = await this.organizationRepository.findUserIdByAuthId(authUserId);
        if (!userId) throw new AppError("User not found", 404);
        return userId;
    }

    async validateAuthorizationRequest(clientId: string): Promise<OauthAppLike> {
        const app = await this.oauthAppRepository.findActiveAppByClientId(clientId);
        if (!app) throw new AppError("Invalid client_id", 400);
        return app;
    }

    async approveOrDeny(params: {
        authUserId: string;
        clientId: string;
        organizationId?: string;
        state?: string;
        action: "approve" | "deny";
    }): Promise<{ redirect: string }> {
        const app = await this.validateAuthorizationRequest(params.clientId);

        if (params.action === "deny") {
            const redirectUrl = new URL(app.redirect_url);
            redirectUrl.searchParams.set("error", "access_denied");
            if (params.state?.trim()) redirectUrl.searchParams.set("state", params.state);
            return { redirect: redirectUrl.toString() };
        }

        const organizationId = params.organizationId?.trim();
        if (!organizationId) throw new AppError("organizationId is required", 400);

        // Ensure user is a member of the org they’re authorizing for.
        const userId = await this.resolveAuthUserToUserId(params.authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, organizationId);
        if (!membership || membership.disabled) throw new AppError("Workspace not found", 404);

        if (app.organization_id !== organizationId) throw new AppError("Invalid organization", 400);

        const code = `oqo_${makeId(32)}`;
        const secretKey = this.mustGetSecretKey();
        const codeHash = hashProgrammaticToken(code, secretKey);
        const expiresAtIso = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        const authz = await this.oauthAppRepository.upsertAuthorization({
            oauthAppId: app.id,
            userId,
            organizationId,
        });
        await this.oauthAppRepository.setAuthorizationCode({
            authorizationId: authz.id,
            codeHash,
            expiresAtIso,
        });

        const redirectUrl = new URL(app.redirect_url);
        redirectUrl.searchParams.set("code", code);
        if (params.state?.trim()) redirectUrl.searchParams.set("state", params.state);
        return { redirect: redirectUrl.toString() };
    }

    async exchangeCodeForToken(params: {
        code: string;
        clientId: string;
        clientSecret: string;
    }): Promise<{ access_token: string; token_type: "bearer"; organizationId: string }> {
        const app = await this.oauthAppRepository.findActiveAppByClientId(params.clientId);
        if (!app) throw new AppError("invalid_client", 401);

        const secretKey = this.mustGetSecretKey();
        const providedSecretHash = hashProgrammaticToken(params.clientSecret, secretKey);
        const legacyProvidedSecretHash = hashProgrammaticTokenCandidates(params.clientSecret, secretKey)[1];
        const stored = app.client_secret_hash;
        const matches =
            stored.startsWith("hmac_sha256:")
                ? timingSafeEqualHexOrPrefixed(providedSecretHash, stored)
                : timingSafeEqualHexOrPrefixed(legacyProvidedSecretHash, stored);
        if (!matches) {
            throw new AppError("invalid_client", 401);
        }

        const [codeHashV2, codeHashLegacy] = hashProgrammaticTokenCandidates(params.code, secretKey);
        const authz =
            (await this.oauthAppRepository.findAuthorizationByCodeHash(codeHashV2)) ??
            (await this.oauthAppRepository.findAuthorizationByCodeHash(codeHashLegacy));
        if (!authz || authz.oauth_app_id !== app.id) {
            throw new AppError("invalid_grant", 400);
        }

        if (!authz.code_expires_at || new Date() > new Date(authz.code_expires_at)) {
            throw new AppError("invalid_grant", 400);
        }

        // Access tokens stay on the `opo_` convention for backwards compatibility with existing clients.
        const accessToken = `opo_${makeId(48)}`;
        const accessTokenHash = hashProgrammaticToken(accessToken, secretKey);
        const exchanged = await this.oauthAppRepository.exchangeCodeForAccessToken({
            oauthAppId: app.id,
            organizationId: authz.organization_id,
            codeHash: authz.authorization_code_hash ?? codeHashV2,
            accessTokenHash,
        });
        if (!exchanged) {
            throw new AppError("invalid_grant", 400);
        }

        return { organizationId: exchanged.organization_id, access_token: accessToken, token_type: "bearer" };
    }

    async getOrgByOAuthToken(rawAccessToken: string): Promise<OauthAuthorizationLike | null> {
        const secretKey = (config.auth as { programmaticTokenSecret?: string })?.programmaticTokenSecret ?? "";
        if (!secretKey.trim()) return null;
        const hash = hashProgrammaticToken(rawAccessToken, secretKey);
        return this.oauthAppRepository.findActiveAuthorizationByAccessTokenHash(hash);
    }

    private async enrichOauthAppPublicForApi(
        app: OauthAppPublicLike
    ): Promise<NonNullable<ApprovedAuthorizationApiItem["oauth_app"]>> {
        if (!app.picture_id) {
            return { ...app, picture_public_url: null, picture_thumbnail_public_url: null };
        }
        const media = await this.mediaRepository.getMediaById(app.organization_id, app.picture_id);
        if (!media || media.deleted_at) {
            return { ...app, picture_public_url: null, picture_thumbnail_public_url: null };
        }
        return {
            ...app,
            picture_public_url: publicUrlForObjectKey(media.path),
            picture_thumbnail_public_url: media.thumbnail ? publicUrlForObjectKey(media.thumbnail) : null,
        };
    }

    async getApprovedApps(authUserId: string): Promise<ApprovedAuthorizationApiItem[]> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        const rows = await this.oauthAppRepository.listApprovedAuthorizationsByUserId(userId);
        return Promise.all(
            rows.map(async (row) => ({
                ...row,
                oauth_app: row.oauth_app ? await this.enrichOauthAppPublicForApi(row.oauth_app) : null,
            }))
        );
    }

    async revokeApp(authUserId: string, authorizationId: string): Promise<{ success: true }> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        await this.oauthAppRepository.revokeAuthorizationByIdAndUserId({ authorizationId, userId });
        return { success: true };
    }
}

