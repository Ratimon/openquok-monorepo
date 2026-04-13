import type { IntegrationService } from "./IntegrationService";
import type { OrganizationRepository, UserOrganizationRow } from "../repositories/OrganizationRepository";
import type { IntegrationRow } from "../repositories/IntegrationRepository";
import type { RefreshIntegrationService } from "./RefreshIntegrationService";
import type { IntegrationManager } from "../integrations/integrationManager";
import type { AuthTokenDetails, SocialProvider } from "../integrations/social.integrations.interface";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";

import { faker } from "@faker-js/faker";
import { IntegrationConnectionService } from "./IntegrationConnectionService";

import { UserNotFoundError } from "../errors/UserError";
import { OrganizationNotFoundError } from "../errors/OrganizationError";
import { AppError } from "../errors/AppError";

const orgId = faker.string.uuid();
const authUserId = faker.string.uuid();
const userId = faker.string.uuid();
const integrationId = faker.string.uuid();

function mockFindUserIdByAuthIdResult(userIdValue: string | null) {
    return { userId: userIdValue, error: null };
}

function mockFindMembershipResult(membership: UserOrganizationRow | null) {
    return { membership, error: null };
}

function activeMembershipRow(): UserOrganizationRow {
    return {
        id: faker.string.uuid(),
        user_id: userId,
        organization_id: orgId,
        role: "member",
        disabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
}

function sampleRow(overrides: Partial<IntegrationRow> = {}): IntegrationRow {
    const base: IntegrationRow = {
        id: integrationId,
        organization_id: orgId,
        internal_id: "int-internal",
        name: "Channel",
        picture: null,
        provider_identifier: "threads",
        type: "social",
        token: "tok",
        disabled: false,
        token_expiration: null,
        refresh_token: null,
        profile: "prof",
        deleted_at: null,
        in_between_steps: false,
        refresh_needed: false,
        posting_times: "[]",
        custom_instance_details: null,
        additional_settings: "[]",
        customer_id: null,
        customer_name: null,
        root_internal_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    return { ...base, ...overrides };
}

function createMockIntegrations(): jest.Mocked<Pick<
    IntegrationService,
    | "listByOrganization"
    | "getById"
    | "upsertIntegration"
    | "updateIntegrationById"
    | "setPostingTimes"
    | "disableChannel"
    | "enableChannel"
    | "softDeleteChannel"
    | "customers"
    | "createIntegrationCustomer"
    | "updateIntegrationGroup"
    | "updateOnCustomerName"
>> {
    return {
        listByOrganization: jest.fn(),
        getById: jest.fn(),
        upsertIntegration: jest.fn(),
        updateIntegrationById: jest.fn(),
        setPostingTimes: jest.fn(),
        disableChannel: jest.fn(),
        enableChannel: jest.fn(),
        softDeleteChannel: jest.fn(),
        customers: jest.fn(),
        createIntegrationCustomer: jest.fn(),
        updateIntegrationGroup: jest.fn(),
        updateOnCustomerName: jest.fn(),
    };
}

function createMockOrgRepo(): jest.Mocked<Pick<OrganizationRepository, "findUserIdByAuthId" | "findMembership">> {
    return {
        findUserIdByAuthId: jest.fn(),
        findMembership: jest.fn(),
    };
}

function createMockCache(): jest.Mocked<Pick<CacheService, "get" | "set" | "del">> {
    return {
        get: jest.fn(),
        set: jest.fn().mockResolvedValue(true),
        del: jest.fn().mockResolvedValue(true),
    };
}

const defaultOAuthUser: AuthTokenDetails = {
    id: "acct-1",
    accessToken: "access",
    expiresIn: 3600,
    refreshToken: "refresh",
    name: "Name",
    username: "user",
    additionalSettings: [],
};

/** Minimal {@link SocialProvider} for unit tests; override fields per scenario. */
function createMockProvider(overrides: Partial<SocialProvider> = {}): SocialProvider {
    const base: SocialProvider = {
        identifier: "threads",
        name: "Threads",
        editor: "normal",
        isBetweenSteps: false,
        scopes: [],
        maxLength: () => 10_000,
        generateAuthUrl: jest.fn().mockResolvedValue({
            codeVerifier: "code-verifier",
            state: "oauth-state-xyz",
            url: "https://oauth.example/authorize",
        }),
        authenticate: jest.fn().mockResolvedValue(defaultOAuthUser),
        refreshToken: jest.fn().mockResolvedValue({
            ...defaultOAuthUser,
            accessToken: "refreshed-access",
        }),
        post: jest.fn().mockResolvedValue([]),
    };
    return { ...base, ...overrides };
}

function createMockManager(provider: SocialProvider): jest.Mocked<
    Pick<IntegrationManager, "getAllowedSocialsIntegrations" | "getSocialIntegration">
> {
    return {
        getAllowedSocialsIntegrations: jest.fn().mockReturnValue(["threads"]),
        getSocialIntegration: jest.fn().mockReturnValue(provider),
    };
}

describe("IntegrationConnectionService", () => {
    let integrations: ReturnType<typeof createMockIntegrations>;
    let orgRepo: ReturnType<typeof createMockOrgRepo>;
    let manager: ReturnType<typeof createMockManager>;
    let refresh: jest.Mocked<Pick<RefreshIntegrationService, "startRefreshWorkflow">>;
    let cache: ReturnType<typeof createMockCache>;
    let cacheInvalidator: jest.Mocked<Pick<CacheInvalidationService, "invalidateKey">>;

    beforeEach(() => {
        integrations = createMockIntegrations();
        orgRepo = createMockOrgRepo();
        cache = createMockCache();
        cacheInvalidator = { invalidateKey: jest.fn().mockResolvedValue(true) };
        refresh = { startRefreshWorkflow: jest.fn().mockResolvedValue(true) };
        manager = createMockManager(createMockProvider());
    });

    function service(overrides?: { cache?: CacheService; cacheInvalidator?: CacheInvalidationService }) {
        const resolvedCache =
            overrides !== undefined && "cache" in overrides ? overrides.cache : (cache as unknown as CacheService);
        const resolvedInvalidator =
            overrides !== undefined && "cacheInvalidator" in overrides
                ? overrides.cacheInvalidator
                : (cacheInvalidator as unknown as CacheInvalidationService);
        return new IntegrationConnectionService(
            integrations as unknown as IntegrationService,
            orgRepo as unknown as OrganizationRepository,
            manager as unknown as IntegrationManager,
            refresh as unknown as RefreshIntegrationService,
            resolvedCache,
            resolvedInvalidator
        );
    }

    describe("publicListIntegrations", () => {
        it("maps repository rows to public list shape", async () => {
            const row = sampleRow({ name: "My channel", picture: "/pic.jpg" });
            integrations.listByOrganization.mockResolvedValue([row]);
            const out = await service().publicListIntegrations(orgId);
            expect(out).toEqual([
                {
                    id: row.id,
                    name: "My channel",
                    identifier: "threads",
                    picture: "/pic.jpg",
                    disabled: false,
                    profile: "prof",
                    customer: null,
                },
            ]);
            expect(integrations.listByOrganization).toHaveBeenCalledWith(orgId);
        });
    });

    describe("getIntegrationList", () => {
        it("throws UserNotFoundError when auth user has no internal user id", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(null));
            await expect(service().getIntegrationList(authUserId, orgId)).rejects.toBeInstanceOf(UserNotFoundError);
        });

        it("throws OrganizationNotFoundError when membership missing", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(null));
            await expect(service().getIntegrationList(authUserId, orgId)).rejects.toBeInstanceOf(
                OrganizationNotFoundError
            );
        });

        it("returns integrations shaped with manager metadata", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            integrations.listByOrganization.mockResolvedValue([sampleRow()]);
            const { integrations: list } = await service().getIntegrationList(authUserId, orgId);
            expect(list).toHaveLength(1);
            expect(list[0]).toMatchObject({
                name: "Channel",
                identifier: "threads",
                editor: "normal",
            });
        });
    });

    describe("getIntegrationUrl (session)", () => {
        it("throws AppError 503 when cache is not configured", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            const s = service({ cache: undefined, cacheInvalidator: undefined });
            await expect(s.getIntegrationUrl(authUserId, orgId, "threads", {})).rejects.toMatchObject({
                statusCode: 503,
            });
        });

        it("writes OAuth state keys to cache on success", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            await service().getIntegrationUrl(authUserId, orgId, "threads", {
                refresh: "old-int-id",
                onboarding: "true",
            });
            expect(cache.set).toHaveBeenCalledWith("refresh:oauth-state-xyz", "old-int-id", 3600);
            expect(cache.set).toHaveBeenCalledWith("onboarding:oauth-state-xyz", "true", 3600);
            expect(cache.set).toHaveBeenCalledWith("organization:oauth-state-xyz", orgId, 3600);
            expect(cache.set).toHaveBeenCalledWith("login:oauth-state-xyz", "code-verifier", 3600);
        });
    });

    describe("getIntegrationUrlPublicApi", () => {
        it("throws AppError when integration is not allowed", async () => {
            manager.getAllowedSocialsIntegrations.mockReturnValue([]);
            await expect(service().getIntegrationUrlPublicApi(orgId, "threads", {})).rejects.toBeInstanceOf(AppError);
        });

        it("returns auth URL without membership check", async () => {
            const result = await service().getIntegrationUrlPublicApi(orgId, "threads", {});
            expect(result).toEqual({ url: "https://oauth.example/authorize" });
        });
    });

    describe("publicDeleteChannel", () => {
        it("throws 404 when integration row missing", async () => {
            integrations.getById.mockResolvedValue(null);
            await expect(service().publicDeleteChannel(orgId, integrationId)).rejects.toMatchObject({ statusCode: 404 });
        });

        it("calls softDeleteChannel when row exists", async () => {
            const row = sampleRow();
            integrations.getById.mockResolvedValue(row);
            integrations.softDeleteChannel.mockResolvedValue(true);
            await service().publicDeleteChannel(orgId, integrationId);
            expect(integrations.softDeleteChannel).toHaveBeenCalledWith(orgId, integrationId, row.internal_id);
        });
    });

    describe("connectSocialMedia", () => {
        it("throws 503 when cache is missing", async () => {
            const s = service({ cache: undefined, cacheInvalidator: undefined });
            await expect(
                s.connectSocialMedia(authUserId, "threads", {
                    state: "st",
                    code: "c",
                    timezone: "0",
                })
            ).rejects.toMatchObject({ statusCode: 503 });
        });

        it("throws invalid state when login key missing for non-customFields provider", async () => {
            cache.get.mockResolvedValue(null);
            await expect(
                service().connectSocialMedia(authUserId, "threads", {
                    state: "st",
                    code: "c",
                    timezone: "0",
                })
            ).rejects.toMatchObject({ message: "Invalid state" });
        });

        it("removes OAuth keys via cacheInvalidator when present", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            cache.get.mockImplementation(async (key: string) => {
                if (key === "login:st") return "verifier";
                if (key === "organization:st") return orgId;
                if (key === "external:st") return null;
                if (key === "refresh:st") return null;
                if (key === "onboarding:st") return null;
                return null;
            });
            const row = sampleRow({ id: "new-id" });
            integrations.upsertIntegration.mockResolvedValue(row);

            await service().connectSocialMedia(authUserId, "threads", {
                state: "st",
                code: "c",
                timezone: "0",
            });

            expect(cacheInvalidator.invalidateKey).toHaveBeenCalledWith("login:st");
            expect(cacheInvalidator.invalidateKey).toHaveBeenCalledWith("organization:st");
            expect(integrations.upsertIntegration).toHaveBeenCalled();
            expect(refresh.startRefreshWorkflow).toHaveBeenCalledWith(orgId, row.id, expect.anything());
        });

        it("falls back to cache.del when no cacheInvalidator", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            cache.get.mockImplementation(async (key: string) => {
                if (key === "login:st") return "verifier";
                if (key === "organization:st") return orgId;
                return null;
            });
            integrations.upsertIntegration.mockResolvedValue(sampleRow({ id: "x" }));

            const s = new IntegrationConnectionService(
                integrations as unknown as IntegrationService,
                orgRepo as unknown as OrganizationRepository,
                manager as unknown as IntegrationManager,
                refresh as unknown as RefreshIntegrationService,
                cache as unknown as CacheService,
                undefined
            );
            await s.connectSocialMedia(authUserId, "threads", { state: "st", code: "c", timezone: "0" });
            expect(cache.del).toHaveBeenCalledWith("login:st");
            expect(cache.del).toHaveBeenCalledWith("organization:st");
        });

        it("returns pages from provider when isBetweenSteps and pages() exists", async () => {
            const pageRows = [{ id: "ig-1", pageId: "pg-1", name: "Biz", pictureUrl: "" }];
            const betweenProvider = createMockProvider({
                identifier: "instagram-business",
                name: "Instagram (Business)",
                isBetweenSteps: true,
                pages: jest.fn().mockResolvedValue(pageRows),
            });
            manager.getAllowedSocialsIntegrations.mockReturnValue(["instagram-business"]);
            manager.getSocialIntegration.mockReturnValue(betweenProvider);

            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            cache.get.mockImplementation(async (key: string) => {
                if (key === "login:st") return "verifier";
                if (key === "organization:st") return orgId;
                return null;
            });
            integrations.upsertIntegration.mockResolvedValue(
                sampleRow({
                    id: "conn-row",
                    provider_identifier: "instagram-business",
                    in_between_steps: true,
                    internal_id: "fb-user",
                    token: "fb-token",
                })
            );

            const out = await service().connectSocialMedia(authUserId, "instagram-business", {
                state: "st",
                code: "c",
                timezone: "0",
            });

            expect(betweenProvider.pages).toHaveBeenCalledWith("access");
            expect(out.pages).toEqual(pageRows);
            expect(out.inBetweenSteps).toBe(true);
        });

        it("skips pages fetch when refresh OAuth state is present", async () => {
            const betweenProvider = createMockProvider({
                identifier: "instagram-business",
                name: "Instagram (Business)",
                isBetweenSteps: true,
                authenticate: jest.fn().mockResolvedValue({
                    id: "fb-user",
                    accessToken: "access",
                    expiresIn: 3600,
                    refreshToken: "refresh",
                    name: "Name",
                    username: "user",
                    additionalSettings: [],
                }),
                pages: jest.fn().mockResolvedValue([{ id: "x", pageId: "y", name: "N", pictureUrl: "" }]),
            });
            manager.getAllowedSocialsIntegrations.mockReturnValue(["instagram-business"]);
            manager.getSocialIntegration.mockReturnValue(betweenProvider);

            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            cache.get.mockImplementation(async (key: string) => {
                if (key === "login:st") return "verifier";
                if (key === "organization:st") return orgId;
                if (key === "refresh:st") return "fb-user";
                return null;
            });
            integrations.upsertIntegration.mockResolvedValue(
                sampleRow({ provider_identifier: "instagram-business", in_between_steps: false })
            );

            const out = await service().connectSocialMedia(authUserId, "instagram-business", {
                state: "st",
                code: "c",
                timezone: "0",
            });

            expect(betweenProvider.pages).not.toHaveBeenCalled();
            expect(out.pages).toEqual([]);
        });
    });

    describe("saveProviderPage", () => {
        it("throws OrganizationNotFoundError when user is not a member", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(null));
            await expect(
                service().saveProviderPage(authUserId, orgId, integrationId, {
                    organizationId: orgId,
                    pageId: "p1",
                    id: "ig1",
                })
            ).rejects.toBeInstanceOf(OrganizationNotFoundError);
        });

        it("throws 404 when integration row is missing", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            integrations.getById.mockResolvedValue(null);
            await expect(
                service().saveProviderPage(authUserId, orgId, integrationId, {
                    organizationId: orgId,
                    pageId: "p1",
                    id: "ig1",
                })
            ).rejects.toMatchObject({ statusCode: 404 });
        });

        it("throws 400 when integration is not in between-steps", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            integrations.getById.mockResolvedValue(sampleRow({ in_between_steps: false }));
            await expect(
                service().saveProviderPage(authUserId, orgId, integrationId, {
                    organizationId: orgId,
                    pageId: "p1",
                    id: "ig1",
                })
            ).rejects.toMatchObject({ statusCode: 400, message: "Integration does not need account selection" });
        });

        it("throws 400 when provider has no fetchPageInformation", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            integrations.getById.mockResolvedValue(
                sampleRow({ in_between_steps: true, provider_identifier: "threads" })
            );
            await expect(
                service().saveProviderPage(authUserId, orgId, integrationId, {
                    organizationId: orgId,
                    pageId: "p1",
                    id: "ig1",
                })
            ).rejects.toMatchObject({ statusCode: 400, message: "Provider does not support page selection" });
        });

        it("throws 400 when selection payload is empty after removing organizationId", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            const fetchPageInformation = jest.fn();
            integrations.getById.mockResolvedValue(
                sampleRow({ in_between_steps: true, provider_identifier: "instagram-business" })
            );
            manager.getSocialIntegration.mockReturnValue(
                createMockProvider({
                    identifier: "instagram-business",
                    name: "Instagram (Business)",
                    fetchPageInformation,
                })
            );

            await expect(
                service().saveProviderPage(authUserId, orgId, integrationId, { organizationId: orgId })
            ).rejects.toMatchObject({ statusCode: 400, message: "Missing selection payload for this provider" });

            expect(fetchPageInformation).not.toHaveBeenCalled();
        });

        it("throws 400 with provider error message when fetchPageInformation fails", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            integrations.getById.mockResolvedValue(
                sampleRow({
                    in_between_steps: true,
                    provider_identifier: "instagram-business",
                    token: "fb-tok",
                    internal_id: "fb-internal",
                })
            );
            manager.getSocialIntegration.mockReturnValue(
                createMockProvider({
                    identifier: "instagram-business",
                    name: "Instagram (Business)",
                    fetchPageInformation: jest.fn().mockRejectedValue(new Error("Graph exploded")),
                })
            );

            await expect(
                service().saveProviderPage(authUserId, orgId, integrationId, {
                    organizationId: orgId,
                    pageId: "p1",
                    id: "ig1",
                })
            ).rejects.toMatchObject({ statusCode: 400, message: "Graph exploded" });
        });

        it("updates Instagram (Business) with page token and preserves FB user token in refresh_token", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            integrations.getById.mockResolvedValue(
                sampleRow({
                    in_between_steps: true,
                    provider_identifier: "instagram-business",
                    token: "fb-user-access",
                    internal_id: "fb-user-id",
                    refresh_token: "ignored-for-this-path",
                    root_internal_id: null,
                })
            );
            const fetchPageInformation = jest.fn().mockResolvedValue({
                id: "ig-99",
                name: "Shop",
                access_token: "page-access",
                picture: "https://pic",
                username: "shop_handle",
            });
            manager.getSocialIntegration.mockReturnValue(
                createMockProvider({
                    identifier: "instagram-business",
                    name: "Instagram (Business)",
                    fetchPageInformation,
                })
            );
            integrations.updateIntegrationById.mockResolvedValue(sampleRow());

            const out = await service().saveProviderPage(authUserId, orgId, integrationId, {
                organizationId: orgId,
                pageId: "page-1",
                id: "ig-99",
            });

            expect(fetchPageInformation).toHaveBeenCalledWith("fb-user-access", { pageId: "page-1", id: "ig-99" });
            expect(out).toEqual({ success: true });
            expect(integrations.updateIntegrationById).toHaveBeenCalledWith(
                orgId,
                integrationId,
                expect.objectContaining({
                    internalId: "ig-99",
                    name: "Shop",
                    token: "page-access",
                    refreshToken: "fb-user-access",
                    rootInternalId: "fb-user-id",
                    inBetweenSteps: false,
                    profile: "shop_handle",
                    picture: "https://pic",
                })
            );
            const updateArg = integrations.updateIntegrationById.mock.calls[0][2];
            expect(updateArg.expiresInSeconds).toBeGreaterThan(0);
        });

        it("for non-Instagram providers preserves refresh_token and root_internal_id from row", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            integrations.getById.mockResolvedValue(
                sampleRow({
                    in_between_steps: true,
                    provider_identifier: "other",
                    token: "tok-a",
                    internal_id: "int-a",
                    refresh_token: "rt-prior",
                    root_internal_id: "root-prior",
                })
            );
            manager.getSocialIntegration.mockReturnValue(
                createMockProvider({
                    identifier: "other",
                    name: "Other",
                    fetchPageInformation: jest.fn().mockResolvedValue({
                        id: "sel-1",
                        name: "Selected",
                        access_token: "new-access",
                        picture: "",
                        username: "u",
                    }),
                })
            );
            integrations.updateIntegrationById.mockResolvedValue(sampleRow());

            await service().saveProviderPage(authUserId, orgId, integrationId, {
                organizationId: orgId,
                customField: "x",
            });

            expect(integrations.updateIntegrationById).toHaveBeenCalledWith(
                orgId,
                integrationId,
                expect.objectContaining({
                    token: "new-access",
                    refreshToken: "rt-prior",
                    rootInternalId: "root-prior",
                })
            );
            const updateArg = integrations.updateIntegrationById.mock.calls[0][2];
            expect(updateArg.expiresInSeconds).toBeUndefined();
        });
    });

    describe("setTimes", () => {
        it("throws when integration not found", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            integrations.getById.mockResolvedValue(null);
            await expect(
                service().setTimes(authUserId, orgId, integrationId, { time: [{ time: 100 }] })
            ).rejects.toMatchObject({ statusCode: 404 });
        });

        it("persists posting times JSON", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            integrations.getById.mockResolvedValue(sampleRow());
            await service().setTimes(authUserId, orgId, integrationId, { time: [{ time: 200 }] });
            expect(integrations.setPostingTimes).toHaveBeenCalledWith(
                orgId,
                integrationId,
                JSON.stringify([{ time: 200 }])
            );
        });
    });

    describe("deleteChannel", () => {
        it("throws 404 when soft delete returns false", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
            orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));
            integrations.getById.mockResolvedValue(sampleRow());
            integrations.softDeleteChannel.mockResolvedValue(false);
            await expect(service().deleteChannel(authUserId, orgId, integrationId)).rejects.toMatchObject({
                statusCode: 404,
            });
        });
    });
});
