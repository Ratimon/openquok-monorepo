import type { OauthAppLike, OauthAuthorizationLike, OauthAppRepository } from "../repositories/OauthAppRepository";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import { AppError } from "../errors/AppError";
import { config } from "../config/GlobalConfig";
import { makeId } from "../utils/make.is";
import { hashProgrammaticToken, hashProgrammaticTokenCandidates, timingSafeEqualHexOrPrefixed } from "../utils/tokenHash";

export class OauthService {
    constructor(
        private readonly oauthAppRepository: OauthAppRepository,
        private readonly organizationRepository: OrganizationRepository
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
        organizationId: string;
        state?: string;
        action: "approve" | "deny";
    }): Promise<{ redirect: string }> {
        const app = await this.validateAuthorizationRequest(params.clientId);

        // Ensure user is a member of the org they’re authorizing for.
        const userId = await this.resolveAuthUserToUserId(params.authUserId);
        const { membership } = await this.organizationRepository.findMembership(userId, params.organizationId);
        if (!membership || membership.disabled) throw new AppError("Workspace not found", 404);

        if (app.organization_id !== params.organizationId) throw new AppError("Invalid organization", 400);

        if (params.action === "deny") {
            const redirectUrl = new URL(app.redirect_url);
            redirectUrl.searchParams.set("error", "access_denied");
            if (params.state?.trim()) redirectUrl.searchParams.set("state", params.state);
            return { redirect: redirectUrl.toString() };
        }

        const code = `opo_${makeId(32)}`;
        const secretKey = this.mustGetSecretKey();
        const codeHash = hashProgrammaticToken(code, secretKey);
        const expiresAtIso = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        const authz = await this.oauthAppRepository.upsertAuthorization({
            oauthAppId: app.id,
            userId,
            organizationId: params.organizationId,
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

    async getApprovedApps(authUserId: string): Promise<OauthAuthorizationLike[]> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        return this.oauthAppRepository.listApprovedAuthorizationsByUserId(userId);
    }

    async revokeApp(authUserId: string, authorizationId: string): Promise<{ success: true }> {
        const userId = await this.resolveAuthUserToUserId(authUserId);
        await this.oauthAppRepository.revokeAuthorizationByIdAndUserId({ authorizationId, userId });
        return { success: true };
    }
}

