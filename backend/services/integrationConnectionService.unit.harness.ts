import type { IntegrationService } from "./IntegrationService";
import type { PlugService } from "./PlugService";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { PostsRepository } from "../repositories/PostsRepository";
import type { UserOrganizationLike } from "../utils/dtos/OrganizationDTO";
import type { IntegrationLike } from "../utils/dtos/IntegrationDTO";
import type { RefreshIntegrationService } from "./RefreshIntegrationService";
import type { AuthTokenDetails, SocialProvider } from "../integrations/social.integrations.interface";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import type { IntegrationManager } from "../integrations/integrationManager";

import { faker } from "@faker-js/faker";
import { IntegrationConnectionService } from "./IntegrationConnectionService";

export const orgId = faker.string.uuid();
export const authUserId = faker.string.uuid();
export const userId = faker.string.uuid();
export const integrationId = faker.string.uuid();

export function mockFindUserIdByAuthIdResult(userIdValue: string | null) {
    return { userId: userIdValue, error: null };
}

export function mockFindMembershipResult(membership: UserOrganizationLike | null) {
    return { membership, error: null };
}

export function activeMembershipRow(): UserOrganizationLike {
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

export function sampleRow(overrides: Partial<IntegrationLike> = {}): IntegrationLike {
    const base: IntegrationLike = {
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

export function createMockIntegrations(): jest.Mocked<
    Pick<
        IntegrationService,
        | "listByOrganization"
        | "getById"
        | "findActiveByInternalId"
        | "upsertIntegration"
        | "updateIntegrationById"
        | "setRefreshNeeded"
        | "setPostingTimes"
        | "disableChannel"
        | "enableChannel"
        | "softDeleteChannel"
        | "customers"
        | "createIntegrationCustomer"
        | "updateIntegrationGroup"
        | "updateOnCustomerName"
    >
> {
    return {
        listByOrganization: jest.fn(),
        getById: jest.fn(),
        findActiveByInternalId: jest.fn().mockResolvedValue(null),
        upsertIntegration: jest.fn(),
        updateIntegrationById: jest.fn(),
        setRefreshNeeded: jest.fn().mockResolvedValue(undefined),
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

export function createMockPlugService(): jest.Mocked<
    Pick<
        PlugService,
        | "listIntegrationPlugs"
        | "getPlugRowById"
        | "upsertIntegrationPlug"
        | "deleteIntegrationPlug"
        | "setIntegrationPlugActivated"
    >
> {
    return {
        listIntegrationPlugs: jest.fn(),
        getPlugRowById: jest.fn(),
        upsertIntegrationPlug: jest.fn(),
        deleteIntegrationPlug: jest.fn(),
        setIntegrationPlugActivated: jest.fn(),
    };
}

export function createMockPostsRepo(): jest.Mocked<
    Pick<
        PostsRepository,
        | "listPostGroupsForIntegration"
        | "listPostsByGroup"
        | "softDeletePostsByGroup"
        | "deleteTagAssignmentsForPostIds"
    >
> {
    return {
        listPostGroupsForIntegration: jest.fn().mockResolvedValue([]),
        listPostsByGroup: jest.fn().mockResolvedValue([]),
        softDeletePostsByGroup: jest.fn().mockResolvedValue([]),
        deleteTagAssignmentsForPostIds: jest.fn().mockResolvedValue(undefined),
    };
}

export function createMockOrgRepo(): jest.Mocked<Pick<OrganizationRepository, "findUserIdByAuthId" | "findMembership">> {
    return {
        findUserIdByAuthId: jest.fn(),
        findMembership: jest.fn(),
    };
}

export function createMockCache(): jest.Mocked<Pick<CacheService, "get" | "set" | "del">> {
    return {
        get: jest.fn(),
        set: jest.fn().mockResolvedValue(true),
        del: jest.fn().mockResolvedValue(true),
    };
}

export const defaultOAuthUser: AuthTokenDetails = {
    id: "acct-1",
    accessToken: "access",
    expiresIn: 3600,
    refreshToken: "refresh",
    name: "Name",
    username: "user",
    additionalSettings: [],
};

/** Minimal {@link SocialProvider} for unit tests; override fields per scenario. */
export function createMockProvider(overrides: Partial<SocialProvider> = {}): SocialProvider {
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

export type MockManager = jest.Mocked<
    Pick<
        IntegrationManager,
        | "getAllowedSocialsIntegrations"
        | "getSocialIntegration"
        | "listGlobalPlugCatalog"
        | "getInternalPlugDefinitionsForProvider"
        | "validatePlugFieldsAgainstCatalog"
        | "getAllTools"
        | "getAllRulesDescription"
    >
>;

export function createMockManager(provider: SocialProvider, plugCatalog?: IntegrationManager): MockManager {
    return {
        getAllowedSocialsIntegrations: jest.fn().mockReturnValue([provider.identifier]),
        getSocialIntegration: jest.fn((id: string) => (id === provider.identifier ? provider : undefined)),
        listGlobalPlugCatalog: jest.fn(() => plugCatalog?.listGlobalPlugCatalog() ?? { plugs: [] }),
        getInternalPlugDefinitionsForProvider: jest.fn((id: string) =>
            plugCatalog?.getInternalPlugDefinitionsForProvider(id) ?? []
        ),
        validatePlugFieldsAgainstCatalog: jest.fn((params) =>
            plugCatalog ? plugCatalog.validatePlugFieldsAgainstCatalog(params) : null
        ),
        getAllTools: jest.fn(() => ({ [provider.identifier]: provider.tools?.() ?? [] })),
        getAllRulesDescription: jest.fn(() => ({ [provider.identifier]: provider.rules ?? "" })),
    };
}

export type IntegrationConnectionHarness = {
    integrations: ReturnType<typeof createMockIntegrations>;
    plugs: ReturnType<typeof createMockPlugService>;
    orgRepo: ReturnType<typeof createMockOrgRepo>;
    postsRepo: ReturnType<typeof createMockPostsRepo>;
    manager: MockManager;
    refresh: jest.Mocked<Pick<RefreshIntegrationService, "startRefreshWorkflow" | "refresh">>;
    storageRepository: { uploadIntegrationProfilePicture: jest.Mock };
    cache: ReturnType<typeof createMockCache>;
    cacheInvalidator: jest.Mocked<
        Pick<CacheInvalidationService, "invalidateKey" | "invalidatePattern" | "invalidateEntity">
    >;
    service: (overrides?: { cache?: CacheService; cacheInvalidator?: CacheInvalidationService }) => IntegrationConnectionService;
};

export function createIntegrationConnectionHarness(options?: {
    provider?: SocialProvider;
    plugCatalog?: IntegrationManager;
}): IntegrationConnectionHarness {
    const provider = options?.provider ?? createMockProvider();
    const integrations = createMockIntegrations();
    const plugs = createMockPlugService();
    const orgRepo = createMockOrgRepo();
    const postsRepo = createMockPostsRepo();
    const cache = createMockCache();
    const cacheInvalidator = {
        invalidateKey: jest.fn().mockResolvedValue(true),
        invalidatePattern: jest.fn().mockResolvedValue(true),
        invalidateEntity: jest.fn().mockResolvedValue(true),
    };
    const refresh = {
        startRefreshWorkflow: jest.fn().mockResolvedValue(true),
        refresh: jest.fn().mockResolvedValue(false),
    };
    const storageRepository = {
        uploadIntegrationProfilePicture: jest.fn().mockResolvedValue({ error: null }),
    };
    const state = {
        manager: createMockManager(provider, options?.plugCatalog),
    };

    function service(overrides?: { cache?: CacheService; cacheInvalidator?: CacheInvalidationService }) {
        const resolvedCache =
            overrides !== undefined && "cache" in overrides ? overrides.cache : (cache as unknown as CacheService);
        const resolvedInvalidator =
            overrides !== undefined && "cacheInvalidator" in overrides
                ? overrides.cacheInvalidator
                : (cacheInvalidator as unknown as CacheInvalidationService);
        return new IntegrationConnectionService(
            integrations as unknown as IntegrationService,
            plugs as unknown as PlugService,
            orgRepo as unknown as OrganizationRepository,
            state.manager as unknown as IntegrationManager,
            refresh as unknown as RefreshIntegrationService,
            storageRepository as never,
            postsRepo as unknown as PostsRepository,
            resolvedCache,
            resolvedInvalidator
        );
    }

    return {
        integrations,
        plugs,
        orgRepo,
        postsRepo,
        get manager() {
            return state.manager;
        },
        set manager(next: MockManager) {
            state.manager = next;
        },
        refresh,
        storageRepository,
        cache,
        cacheInvalidator,
        service,
    };
}
