import type { IntegrationLike } from "../utils/dtos/IntegrationDTO";
import type { AuthTokenDetails, SocialProvider } from "../integrations/social.integrations.interface";
import type { IntegrationRepository } from "../repositories/IntegrationRepository";
import type { StorageSupabaseRepository } from "../repositories/StorageSupabaseRepository";
import type { IntegrationManager } from "../integrations/integrationManager";

import { RefreshIntegrationService } from "./RefreshIntegrationService";

jest.mock("../utils/images/mirrorIntegrationProfilePicture", () => ({
    resolveIntegrationPictureForStorage: jest.fn(async ({ picture }: { picture?: string | null }) => picture ?? null),
}));

jest.mock("../utils/images/providerProfilePictureFetch", () => ({
    downloadProviderProfilePicture: jest.fn(async () => null),
}));

function sampleIntegration(overrides: Partial<IntegrationLike> = {}): IntegrationLike {
    return {
        id: "int-1",
        organization_id: "org-1",
        internal_id: "user-1",
        name: "Ada",
        picture: null,
        provider_identifier: "devto",
        type: "article",
        token: "api-key-stored",
        refresh_token: null,
        token_expiration: null,
        profile: "ada",
        in_between_steps: false,
        refresh_needed: false,
        deleted_at: null,
        additional_settings: "[]",
        custom_instance_details: null,
        posting_times: "[]",
        root_internal_id: null,
        disabled: false,
        customer_id: null,
        customer_name: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides,
    } as IntegrationLike;
}

describe("RefreshIntegrationService", () => {
    let integrationRepository: jest.Mocked<
        Pick<IntegrationRepository, "upsertIntegration" | "setRefreshNeeded" | "syncTokensByRootInternalId">
    >;
    let integrationManager: jest.Mocked<Pick<IntegrationManager, "getSocialIntegration">>;
    let storageRepository: jest.Mocked<Pick<StorageSupabaseRepository, never>>;
    let service: RefreshIntegrationService;
    let refreshTokenFn: jest.Mock<Promise<AuthTokenDetails>, [string]>;

    beforeEach(() => {
        integrationRepository = {
            upsertIntegration: jest.fn().mockResolvedValue(sampleIntegration()),
            setRefreshNeeded: jest.fn().mockResolvedValue(undefined),
            syncTokensByRootInternalId: jest.fn().mockResolvedValue(undefined),
        };
        refreshTokenFn = jest.fn(async (secret: string) => ({
            id: "1",
            name: "Ada",
            accessToken: secret,
            refreshToken: "",
            expiresIn: 3600,
            username: "ada",
        }));
        integrationManager = {
            getSocialIntegration: jest.fn().mockReturnValue({
                identifier: "devto",
                customFields: async () => [
                    {
                        key: "apiKey",
                        label: "API key",
                        validation: "/^.{3,}$/",
                        type: "password" as const,
                    },
                ],
                refreshToken: refreshTokenFn,
            } as Partial<SocialProvider>),
        };
        storageRepository = {} as jest.Mocked<Pick<StorageSupabaseRepository, never>>;
        service = new RefreshIntegrationService(
            integrationRepository as unknown as IntegrationRepository,
            integrationManager as unknown as IntegrationManager,
            storageRepository as unknown as StorageSupabaseRepository
        );
    });

    it("falls back to integrations.token when refresh_token is empty for customFields providers", async () => {
        const row = sampleIntegration({ refresh_token: null, token: "api-key-stored" });
        const result = await service.refresh(row);

        expect(refreshTokenFn).toHaveBeenCalledWith("api-key-stored");
        expect(result).toMatchObject({ accessToken: "api-key-stored", refreshToken: "" });
        expect(integrationRepository.upsertIntegration).toHaveBeenCalledWith(
            expect.objectContaining({
                token: "api-key-stored",
                refreshToken: "",
            })
        );
        expect(integrationRepository.setRefreshNeeded).toHaveBeenCalledWith("org-1", "int-1", false);
    });

    it("uses refresh_token when present", async () => {
        const row = sampleIntegration({ refresh_token: "oauth-refresh", token: "access" });
        integrationManager.getSocialIntegration.mockReturnValue({
            identifier: "threads",
            refreshToken: refreshTokenFn,
        } as Partial<SocialProvider> as SocialProvider);

        await service.refresh(row);

        expect(refreshTokenFn).toHaveBeenCalledWith("oauth-refresh");
    });

    it("marks refresh failed when customFields provider has neither refresh_token nor token", async () => {
        const row = sampleIntegration({ refresh_token: "", token: "" });
        const result = await service.refresh(row);

        expect(result).toBe(false);
        expect(refreshTokenFn).not.toHaveBeenCalled();
        expect(integrationRepository.setRefreshNeeded).toHaveBeenCalledWith("org-1", "int-1", true);
    });

    it("does not fall back to token for OAuth providers without customFields", async () => {
        const row = sampleIntegration({
            provider_identifier: "threads",
            refresh_token: null,
            token: "access-only",
        });
        integrationManager.getSocialIntegration.mockReturnValue({
            identifier: "threads",
            refreshToken: refreshTokenFn,
        } as Partial<SocialProvider> as SocialProvider);

        const result = await service.refresh(row);

        expect(result).toBe(false);
        expect(refreshTokenFn).not.toHaveBeenCalled();
        expect(integrationRepository.setRefreshNeeded).toHaveBeenCalledWith("org-1", "int-1", true);
        expect(integrationRepository.upsertIntegration).not.toHaveBeenCalled();
    });

    it("marks refresh failed when reConnect throws after a successful token refresh", async () => {
        const reConnectFn = jest.fn(async () => {
            throw new Error("page token exchange failed");
        });
        const row = sampleIntegration({
            provider_identifier: "facebook",
            refresh_token: "oauth-refresh",
            root_internal_id: "root-1",
            internal_id: "page-1",
        });
        integrationManager.getSocialIntegration.mockReturnValue({
            identifier: "facebook",
            refreshToken: refreshTokenFn,
            reConnect: reConnectFn,
        } as Partial<SocialProvider> as SocialProvider);

        const result = await service.refresh(row);

        expect(result).toBe(false);
        expect(refreshTokenFn).toHaveBeenCalledWith("oauth-refresh");
        expect(reConnectFn).toHaveBeenCalledWith("root-1", "page-1", "oauth-refresh");
        expect(integrationRepository.setRefreshNeeded).toHaveBeenCalledWith("org-1", "int-1", true);
        expect(integrationRepository.upsertIntegration).not.toHaveBeenCalled();
    });

    it("clears refresh_needed after full success including reConnect", async () => {
        const reConnectFn = jest.fn(async () => ({
            id: "page-1",
            name: "My Page",
            accessToken: "page-access",
            username: "mypage",
        }));
        const row = sampleIntegration({
            provider_identifier: "facebook",
            refresh_token: "oauth-refresh",
            root_internal_id: "root-1",
            internal_id: "page-1",
            refresh_needed: true,
        });
        integrationManager.getSocialIntegration.mockReturnValue({
            identifier: "facebook",
            refreshToken: refreshTokenFn,
            reConnect: reConnectFn,
        } as Partial<SocialProvider> as SocialProvider);

        const result = await service.refresh(row);

        expect(result).toMatchObject({ accessToken: "page-access" });
        expect(reConnectFn).toHaveBeenCalledWith("root-1", "page-1", "oauth-refresh");
        expect(integrationRepository.upsertIntegration).toHaveBeenCalled();
        expect(integrationRepository.setRefreshNeeded).toHaveBeenCalledWith("org-1", "int-1", false);
    });

    it("marks refresh failed when refreshProcess throws unexpectedly", async () => {
        const throwingRefreshToken = jest.fn(() => {
            throw new Error("network error");
        });
        const row = sampleIntegration({ refresh_token: "oauth-refresh" });
        integrationManager.getSocialIntegration.mockReturnValue({
            identifier: "threads",
            refreshToken: throwingRefreshToken,
        } as Partial<SocialProvider> as SocialProvider);

        const result = await service.refresh(row);

        expect(result).toBe(false);
        expect(integrationRepository.setRefreshNeeded).toHaveBeenCalledWith("org-1", "int-1", true);
        expect(integrationRepository.upsertIntegration).not.toHaveBeenCalled();
    });
});
