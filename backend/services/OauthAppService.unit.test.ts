import { faker } from "@faker-js/faker";
import type { OauthAppLike } from "../repositories/OauthAppRepository";
import type { OauthAppRepository } from "../repositories/OauthAppRepository";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import { hashProgrammaticToken } from "../utils/tokenHash";

/** Mutable so tests can simulate missing `SECURITY_SECRET` / JWT fallback */
const oauthAuthConfig = { programmaticTokenSecret: "oauth-unit-test-secret-fixed-for-hashing" };

jest.mock("../config/GlobalConfig", () => ({
    config: {
        auth: oauthAuthConfig,
    },
}));

import { OauthAppService } from "./OauthAppService";

faker.seed(42_001);

const authUserId = faker.string.uuid();
const userId = faker.string.uuid();
const orgId = faker.string.uuid();
const oauthAppId = faker.string.uuid();
const secretKey = oauthAuthConfig.programmaticTokenSecret;

function baseAppRow(overrides: Partial<OauthAppLike> = {}): OauthAppLike {
    const now = new Date().toISOString();
    return {
        id: oauthAppId,
        organization_id: orgId,
        created_by_user_id: userId,
        name: faker.company.name(),
        description: null,
        picture_id: null,
        redirect_url: "https://app.example.com/callback",
        client_id: `opo_${faker.string.alphanumeric(24)}`,
        client_secret_hash: hashProgrammaticToken("opo_clientsecret", secretKey),
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

describe("OauthAppService", () => {
    let oauthRepo: jest.Mocked<OauthAppRepository>;
    let orgRepo: jest.Mocked<Pick<OrganizationRepository, "findUserIdByAuthId" | "findMembership">>;

    beforeEach(() => {
        oauthAuthConfig.programmaticTokenSecret = "oauth-unit-test-secret-fixed-for-hashing";
        oauthRepo = createMockOauthRepo();
        orgRepo = createMockOrgRepo();
        orgRepo.findUserIdByAuthId.mockResolvedValue({ userId, error: null });
        orgRepo.findMembership.mockResolvedValue({
            membership: {
                id: faker.string.uuid(),
                user_id: userId,
                organization_id: orgId,
                role: "admin",
                disabled: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            error: null,
        });
    });

    describe("createApp", () => {
        it("throws 403 when caller is not org admin", async () => {
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
            const service = new OauthAppService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            await expect(
                service.createApp(authUserId, {
                    organizationId: orgId,
                    name: "App",
                    redirectUrl: "https://example.com/cb",
                })
            ).rejects.toMatchObject({ statusCode: 403 });
            expect(oauthRepo.createApp).not.toHaveBeenCalled();
        });

        it("throws 400 when organization already has an OAuth app", async () => {
            oauthRepo.getAppByOrganizationId.mockResolvedValue(baseAppRow());
            const service = new OauthAppService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            await expect(
                service.createApp(authUserId, {
                    organizationId: orgId,
                    name: "Second",
                    redirectUrl: "https://example.com/cb",
                })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: expect.stringContaining("only have one OAuth"),
            });
            expect(oauthRepo.createApp).not.toHaveBeenCalled();
        });

        it("throws 400 when name is empty", async () => {
            oauthRepo.getAppByOrganizationId.mockResolvedValue(null);
            const service = new OauthAppService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            await expect(
                service.createApp(authUserId, {
                    organizationId: orgId,
                    name: "   ",
                    redirectUrl: "https://example.com/cb",
                })
            ).rejects.toMatchObject({ statusCode: 400 });
        });

        it("throws 400 when redirect URL is invalid", async () => {
            oauthRepo.getAppByOrganizationId.mockResolvedValue(null);
            const service = new OauthAppService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            await expect(
                service.createApp(authUserId, {
                    organizationId: orgId,
                    name: "Valid",
                    redirectUrl: "not-a-url",
                })
            ).rejects.toMatchObject({ statusCode: 400 });
        });

        it("creates app with hashed client secret and opo_ ids", async () => {
            oauthRepo.getAppByOrganizationId.mockResolvedValue(null);
            const created = baseAppRow();
            oauthRepo.createApp.mockResolvedValue(created);

            const service = new OauthAppService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            const result = await service.createApp(authUserId, {
                organizationId: orgId,
                name: "My App",
                redirectUrl: "https://example.com/oauth/callback",
            });

            expect(result.clientId).toMatch(/^opo_/);
            expect(result.clientSecret).toMatch(/^opo_/);
            expect(oauthRepo.createApp).toHaveBeenCalledWith(
                expect.objectContaining({
                    organizationId: orgId,
                    createdByUserId: userId,
                    name: "My App",
                    redirectUrl: "https://example.com/oauth/callback",
                    clientId: result.clientId,
                })
            );
            const call = oauthRepo.createApp.mock.calls[0][0];
            expect(call.clientSecretHash).toMatch(/^hmac_sha256:/);
            expect(call.clientSecretHash).toBe(hashProgrammaticToken(result.clientSecret, secretKey));
        });

        it("throws 500 when programmatic token secret is not configured", async () => {
            oauthRepo.getAppByOrganizationId.mockResolvedValue(null);
            oauthAuthConfig.programmaticTokenSecret = "";

            const service = new OauthAppService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            await expect(
                service.createApp(authUserId, {
                    organizationId: orgId,
                    name: "App",
                    redirectUrl: "https://example.com/cb",
                })
            ).rejects.toMatchObject({ statusCode: 500 });
        });
    });

    describe("verifyProgrammaticToken", () => {
        it("returns null when secret is empty", async () => {
            oauthAuthConfig.programmaticTokenSecret = "";
            const service = new OauthAppService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            expect(await service.verifyProgrammaticToken("opo_any")).toBeNull();
            expect(oauthRepo.findActiveAuthorizationByAccessTokenHash).not.toHaveBeenCalled();
        });

        it("returns org + app + token id when repository resolves authorization by access token hash", async () => {
            oauthAuthConfig.programmaticTokenSecret = secretKey;
            const authzId = faker.string.uuid();
            const raw = `opo_${faker.string.alphanumeric(40)}`;
            const v2 = hashProgrammaticToken(raw, secretKey);
            oauthRepo.findActiveAuthorizationByAccessTokenHash.mockImplementation(async (h: string) => {
                if (h === v2) {
                    return {
                        id: authzId,
                        oauth_app_id: oauthAppId,
                        user_id: userId,
                        organization_id: orgId,
                        access_token_hash: v2,
                        authorization_code_hash: null,
                        code_expires_at: null,
                        revoked_at: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };
                }
                return null;
            });

            const service = new OauthAppService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            const out = await service.verifyProgrammaticToken(raw);
            expect(out).toEqual({
                organizationId: orgId,
                oauthAppId,
                tokenId: authzId,
            });
        });
    });

    describe("deleteApp", () => {
        it("revokes authorizations then soft-deletes app", async () => {
            const service = new OauthAppService(oauthRepo, orgRepo as unknown as OrganizationRepository);
            await service.deleteApp(authUserId, { organizationId: orgId, oauthAppId });

            expect(oauthRepo.revokeAllForApp).toHaveBeenCalledWith(oauthAppId);
            expect(oauthRepo.deleteApp).toHaveBeenCalledWith(orgId, oauthAppId);
        });
    });
});
