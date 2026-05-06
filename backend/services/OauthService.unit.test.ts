import { faker } from "@faker-js/faker";
import type { OauthAppLike } from "../repositories/OauthAppRepository";
import type { OauthAppRepository } from "../repositories/OauthAppRepository";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import { hashProgrammaticToken } from "../utils/tokenHash";

const oauthAuthConfig = { programmaticTokenSecret: "oauth-service-unit-test-secret-key" };

jest.mock("../config/GlobalConfig", () => ({
    config: {
        auth: oauthAuthConfig,
    },
}));

import { OauthService } from "./OauthService";

faker.seed(42_002);

const authUserId = faker.string.uuid();
const userId = faker.string.uuid();
const orgId = faker.string.uuid();
const appId = faker.string.uuid();
const secretKey = oauthAuthConfig.programmaticTokenSecret;

function oauthApp(overrides: Partial<OauthAppLike> = {}): OauthAppLike {
    const now = new Date().toISOString();
    return {
        id: appId,
        organization_id: orgId,
        created_by_user_id: userId,
        name: "Test OAuth App",
        description: null,
        picture_id: null,
        redirect_url: "https://client.example.com/callback",
        client_id: "opo_clientidunit",
        client_secret_hash: hashProgrammaticToken("opo_unit_client_secret", secretKey),
        deleted_at: null,
        created_at: now,
        updated_at: now,
        ...overrides,
    };
}

function createMockOauthRepo(): jest.Mocked<OauthAppRepository> {
    return {
        listAppsByOrganization: jest.fn(),
        getAppByOrganizationId: jest.fn(),
        createApp: jest.fn(),
        updateApp: jest.fn(),
        updateClientSecretHash: jest.fn(),
        deleteApp: jest.fn(),
        findActiveAppByClientId: jest.fn(),
        upsertAuthorization: jest.fn(),
        setAuthorizationCode: jest.fn(),
        exchangeCodeForAccessToken: jest.fn(),
        findAuthorizationByCodeHash: jest.fn(),
        listAuthorizationsByApp: jest.fn(),
        findActiveAuthorizationByAccessTokenHash: jest.fn(),
        revokeAuthorizationByAccessTokenHash: jest.fn(),
        revokeAllForApp: jest.fn(),
        listApprovedAuthorizationsByUserId: jest.fn(),
        revokeAuthorizationByIdAndUserId: jest.fn(),
    } as unknown as jest.Mocked<OauthAppRepository>;
}

function createMockOrgRepo(): jest.Mocked<Pick<OrganizationRepository, "findUserIdByAuthId" | "findMembership">> {
    return {
        findUserIdByAuthId: jest.fn(),
        findMembership: jest.fn(),
    } as unknown as jest.Mocked<Pick<OrganizationRepository, "findUserIdByAuthId" | "findMembership">>;
}

describe("OauthService", () => {
    let oauthRepo: jest.Mocked<OauthAppRepository>;
    let orgRepo: jest.Mocked<Pick<OrganizationRepository, "findUserIdByAuthId" | "findMembership">>;

    beforeEach(() => {
        oauthAuthConfig.programmaticTokenSecret = "oauth-service-unit-test-secret-key";
        oauthRepo = createMockOauthRepo();
        orgRepo = createMockOrgRepo();
        orgRepo.findUserIdByAuthId.mockResolvedValue({ userId, error: null });
        orgRepo.findMembership.mockResolvedValue({
            membership: {
                id: faker.string.uuid(),
                user_id: userId,
                organization_id: orgId,
                role: "user",
                disabled: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            error: null,
        });
    });

    describe("validateAuthorizationRequest", () => {
        it("throws when client_id is unknown", async () => {
            oauthRepo.findActiveAppByClientId.mockResolvedValue(null);
            const service = new OauthService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            await expect(service.validateAuthorizationRequest("unknown")).rejects.toMatchObject({
                statusCode: 400,
                message: "Invalid client_id",
            });
        });

        it("returns app when client exists", async () => {
            const app = oauthApp();
            oauthRepo.findActiveAppByClientId.mockResolvedValue(app);
            const service = new OauthService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            await expect(service.validateAuthorizationRequest(app.client_id)).resolves.toEqual(app);
        });
    });

    describe("approveOrDeny", () => {
        it("returns redirect with access_denied on deny", async () => {
            const app = oauthApp();
            oauthRepo.findActiveAppByClientId.mockResolvedValue(app);
            const service = new OauthService(oauthRepo, orgRepo as unknown as OrganizationRepository);

            const { redirect } = await service.approveOrDeny({
                authUserId,
                clientId: app.client_id,
                organizationId: orgId,
                action: "deny",
                state: "xyz",
            });

            const u = new URL(redirect);
            expect(u.searchParams.get("error")).toBe("access_denied");
            expect(u.searchParams.get("state")).toBe("xyz");
            expect(oauthRepo.upsertAuthorization).not.toHaveBeenCalled();
        });

        it("throws when app organization does not match requested organization", async () => {
            const app = oauthApp({ organization_id: faker.string.uuid() });
            oauthRepo.findActiveAppByClientId.mockResolvedValue(app);
            const service = new OauthService(oauthRepo, orgRepo as unknown as OrganizationRepository);

            await expect(
                service.approveOrDeny({
                    authUserId,
                    clientId: app.client_id,
                    organizationId: orgId,
                    action: "approve",
                })
            ).rejects.toMatchObject({ statusCode: 400, message: "Invalid organization" });
        });

        it("on approve upserts authorization and sets authorization code", async () => {
            const app = oauthApp();
            oauthRepo.findActiveAppByClientId.mockResolvedValue(app);
            const authzId = faker.string.uuid();
            oauthRepo.upsertAuthorization.mockResolvedValue({
                id: authzId,
                oauth_app_id: appId,
                user_id: userId,
                organization_id: orgId,
                access_token_hash: null,
                authorization_code_hash: null,
                code_expires_at: null,
                revoked_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            oauthRepo.setAuthorizationCode.mockResolvedValue(undefined);

            const service = new OauthService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            const { redirect } = await service.approveOrDeny({
                authUserId,
                clientId: app.client_id,
                organizationId: orgId,
                action: "approve",
                state: "state-123",
            });

            expect(oauthRepo.upsertAuthorization).toHaveBeenCalledWith({
                oauthAppId: app.id,
                userId,
                organizationId: orgId,
            });
            expect(oauthRepo.setAuthorizationCode).toHaveBeenCalledWith({
                authorizationId: authzId,
                codeHash: expect.stringMatching(/^hmac_sha256:/),
                expiresAtIso: expect.any(String),
            });

            const u = new URL(redirect);
            expect(u.searchParams.get("code")).toMatch(/^opo_/);
            expect(u.searchParams.get("state")).toBe("state-123");
        });
    });

    describe("exchangeCodeForToken", () => {
        it("throws invalid_client when app is unknown", async () => {
            oauthRepo.findActiveAppByClientId.mockResolvedValue(null);
            const service = new OauthService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            await expect(
                service.exchangeCodeForToken({
                    clientId: "bad",
                    clientSecret: "x",
                    code: "opo_code",
                })
            ).rejects.toMatchObject({ statusCode: 401, message: "invalid_client" });
        });

        it("throws invalid_client when client_secret does not match stored hash", async () => {
            const app = oauthApp();
            oauthRepo.findActiveAppByClientId.mockResolvedValue(app);
            const service = new OauthService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            await expect(
                service.exchangeCodeForToken({
                    clientId: app.client_id,
                    clientSecret: "wrong-secret",
                    code: "opo_any",
                })
            ).rejects.toMatchObject({ statusCode: 401, message: "invalid_client" });
        });

        it("throws invalid_grant when authorization row is missing", async () => {
            const clientSecret = "opo_unit_client_secret";
            const app = oauthApp({
                client_secret_hash: hashProgrammaticToken(clientSecret, secretKey),
            });
            oauthRepo.findActiveAppByClientId.mockResolvedValue(app);
            oauthRepo.findAuthorizationByCodeHash.mockResolvedValue(null);
            const service = new OauthService(oauthRepo, orgRepo as unknown as OrganizationRepository);

            await expect(
                service.exchangeCodeForToken({
                    clientId: app.client_id,
                    clientSecret,
                    code: "opo_unknown_code",
                })
            ).rejects.toMatchObject({ statusCode: 400, message: "invalid_grant" });
        });

        it("throws invalid_grant when code is expired", async () => {
            const clientSecret = "opo_unit_client_secret";
            const code = "opo_auth_code";
            const codeHashV2 = hashProgrammaticToken(code, secretKey);
            const app = oauthApp({
                client_secret_hash: hashProgrammaticToken(clientSecret, secretKey),
            });
            oauthRepo.findActiveAppByClientId.mockResolvedValue(app);
            oauthRepo.findAuthorizationByCodeHash.mockResolvedValue({
                id: faker.string.uuid(),
                oauth_app_id: appId,
                user_id: userId,
                organization_id: orgId,
                access_token_hash: null,
                authorization_code_hash: codeHashV2,
                code_expires_at: new Date(Date.now() - 60_000).toISOString(),
                revoked_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            const service = new OauthService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            await expect(
                service.exchangeCodeForToken({
                    clientId: app.client_id,
                    clientSecret,
                    code,
                })
            ).rejects.toMatchObject({ statusCode: 400, message: "invalid_grant" });
            expect(oauthRepo.exchangeCodeForAccessToken).not.toHaveBeenCalled();
        });

        it("returns bearer access_token when exchange succeeds", async () => {
            const clientSecret = "opo_unit_client_secret";
            const code = "opo_auth_code_ok";
            const codeHashV2 = hashProgrammaticToken(code, secretKey);
            const app = oauthApp({
                client_secret_hash: hashProgrammaticToken(clientSecret, secretKey),
            });
            oauthRepo.findActiveAppByClientId.mockResolvedValue(app);
            const authzRow = {
                id: faker.string.uuid(),
                oauth_app_id: appId,
                user_id: userId,
                organization_id: orgId,
                access_token_hash: null,
                authorization_code_hash: codeHashV2,
                code_expires_at: new Date(Date.now() + 600_000).toISOString(),
                revoked_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            oauthRepo.findAuthorizationByCodeHash.mockResolvedValue(authzRow);
            oauthRepo.exchangeCodeForAccessToken.mockResolvedValue({
                ...authzRow,
                organization_id: orgId,
            });

            const service = new OauthService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            const out = await service.exchangeCodeForToken({
                clientId: app.client_id,
                clientSecret,
                code,
            });

            expect(out.token_type).toBe("bearer");
            expect(out.organizationId).toBe(orgId);
            expect(out.access_token).toMatch(/^opo_/);
            expect(oauthRepo.exchangeCodeForAccessToken).toHaveBeenCalled();
        });

        it("throws 500 when secret is not configured", async () => {
            oauthAuthConfig.programmaticTokenSecret = "";
            const app = oauthApp();
            oauthRepo.findActiveAppByClientId.mockResolvedValue(app);
            const service = new OauthService(oauthRepo, orgRepo as unknown as OrganizationRepository);

            await expect(
                service.exchangeCodeForToken({
                    clientId: app.client_id,
                    clientSecret: "x",
                    code: "opo_c",
                })
            ).rejects.toMatchObject({
                statusCode: 500,
                message: expect.stringContaining("SECURITY_SECRET"),
            });
        });
    });

    describe("getOrgByOAuthToken", () => {
        it("returns null when secret is empty", async () => {
            oauthAuthConfig.programmaticTokenSecret = "";
            const service = new OauthService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            expect(await service.getOrgByOAuthToken("opo_tok")).toBeNull();
        });
    });

    describe("getApprovedApps", () => {
        it("lists approved authorizations for resolved user", async () => {
            const rows = [
                {
                    id: faker.string.uuid(),
                    oauth_app_id: appId,
                    user_id: userId,
                    organization_id: orgId,
                    access_token_hash: "h",
                    authorization_code_hash: null,
                    code_expires_at: null,
                    revoked_at: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ];
            oauthRepo.listApprovedAuthorizationsByUserId.mockResolvedValue(rows as never);

            const service = new OauthService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            const out = await service.getApprovedApps(authUserId);
            expect(out).toEqual(rows);
            expect(oauthRepo.listApprovedAuthorizationsByUserId).toHaveBeenCalledWith(userId);
        });
    });

    describe("revokeApp", () => {
        it("revokes authorization for user", async () => {
            const authorizationId = faker.string.uuid();
            const service = new OauthService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            const out = await service.revokeApp(authUserId, authorizationId);
            expect(out).toEqual({ success: true });
            expect(oauthRepo.revokeAuthorizationByIdAndUserId).toHaveBeenCalledWith({
                authorizationId,
                userId,
            });
        });
    });
});
