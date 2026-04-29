import { faker } from "@faker-js/faker";
import { IntegrationService } from "./IntegrationService";
import type { IntegrationRepository } from "../repositories/IntegrationRepository";
import type { IntegrationLike } from "../utils/dtos/IntegrationDTO";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";

const orgId = faker.string.uuid();
const integrationId = faker.string.uuid();

function minimalUpsertParams() {
    return {
        organizationId: orgId,
        internalId: "int-1",
        name: "N",
        picture: null as string | null,
        providerIdentifier: "threads",
        integrationType: "social" as const,
        token: "t",
        refreshToken: "",
        expiresInSeconds: 3600,
        profile: null as string | null,
        inBetweenSteps: false,
        additionalSettingsJson: "[]",
        customInstanceDetails: null as string | null,
        postingTimesJson: "[]",
        rootInternalId: null as string | null,
    };
}

function createMockRepo(): jest.Mocked<
    Pick<
        IntegrationRepository,
        | "listByOrganization"
        | "getById"
        | "upsertIntegration"
        | "setPostingTimes"
        | "disableChannel"
        | "enableChannel"
        | "softDeleteChannel"
        | "customers"
        | "createIntegrationCustomer"
        | "updateIntegrationById"
        | "updateIntegrationGroup"
        | "updateOnCustomerName"
    >
> {
    return {
        listByOrganization: jest.fn(),
        getById: jest.fn(),
        upsertIntegration: jest.fn(),
        setPostingTimes: jest.fn(),
        disableChannel: jest.fn(),
        enableChannel: jest.fn(),
        softDeleteChannel: jest.fn(),
        customers: jest.fn(),
        createIntegrationCustomer: jest.fn(),
        updateIntegrationById: jest.fn(),
        updateIntegrationGroup: jest.fn(),
        updateOnCustomerName: jest.fn(),
    };
}

type IntegrationServiceCacheMock = jest.Mocked<Pick<CacheService, "get" | "set" | "del" | "getOrSet">>;

function createMockCache(): IntegrationServiceCacheMock {
    return {
        get: jest.fn(),
        set: jest.fn().mockResolvedValue(true),
        del: jest.fn().mockResolvedValue(true),
        getOrSet: jest.fn(async (_key: string, factory: () => Promise<unknown>) => factory()) as IntegrationServiceCacheMock["getOrSet"],
    };
}

describe("IntegrationService", () => {
    let repo: ReturnType<typeof createMockRepo>;
    let cache: ReturnType<typeof createMockCache>;
    let cacheInvalidator: jest.Mocked<Pick<CacheInvalidationService, "invalidatePattern" | "invalidateKey">>;

    beforeEach(() => {
        repo = createMockRepo();
        cache = createMockCache();
        cacheInvalidator = {
            invalidatePattern: jest.fn().mockResolvedValue(true),
            invalidateKey: jest.fn().mockResolvedValue(true),
        };
    });

    function service(overrides?: { cache?: CacheService; cacheInvalidator?: CacheInvalidationService }) {
        const resolvedCache =
            overrides !== undefined && "cache" in overrides ? overrides.cache : (cache as unknown as CacheService);
        const resolvedInvalidator =
            overrides !== undefined && "cacheInvalidator" in overrides
                ? overrides.cacheInvalidator
                : (cacheInvalidator as unknown as CacheInvalidationService);
        return new IntegrationService(
            repo as unknown as IntegrationRepository,
            resolvedCache,
            resolvedInvalidator
        );
    }

    describe("repository delegation", () => {
        it("listByOrganization forwards to repository", async () => {
            const rows = [{} as unknown as IntegrationLike];
            repo.listByOrganization.mockResolvedValue(rows);
            const out = await service().listByOrganization(orgId);
            expect(out).toBe(rows);
            expect(repo.listByOrganization).toHaveBeenCalledWith(orgId);
        });

        it("getById forwards to repository", async () => {
            const row = {} as unknown as IntegrationLike;
            repo.getById.mockResolvedValue(row);
            const out = await service().getById(orgId, integrationId);
            expect(out).toBe(row);
            expect(repo.getById).toHaveBeenCalledWith(orgId, integrationId);
        });

        it("customers forwards to repository when cache is not configured", async () => {
            const list = [{ id: faker.string.uuid(), name: "Acme" }];
            repo.customers.mockResolvedValue(list);
            const out = await service({ cache: undefined }).customers(orgId);
            expect(out).toEqual(list);
            expect(repo.customers).toHaveBeenCalledWith(orgId);
            expect(cache.getOrSet).not.toHaveBeenCalled();
        });

        it("customers uses getOrSet with expected cache key when cache is configured", async () => {
            const list = [{ id: "c2", name: "Beta" }];
            repo.customers.mockResolvedValue(list);
            const out = await service().customers(orgId);
            expect(out).toEqual(list);
            expect(cache.getOrSet).toHaveBeenCalledWith(
                `integration:customers:list:${orgId}`,
                expect.any(Function),
                expect.any(Number)
            );
            expect(repo.customers).toHaveBeenCalledWith(orgId);
        });

        it("customers returns getOrSet result without calling repository when getOrSet returns cached list", async () => {
            const list = [{ id: "c1", name: "Acme" }];
            cache.getOrSet.mockResolvedValue(list);
            const out = await service().customers(orgId);
            expect(out).toEqual(list);
            expect(repo.customers).not.toHaveBeenCalled();
        });
    });

    describe("createIntegrationCustomer", () => {
        it("returns row and invalidates customers list cache key", async () => {
            const row = { id: faker.string.uuid(), name: "New" };
            repo.createIntegrationCustomer.mockResolvedValue(row);
            const out = await service().createIntegrationCustomer(orgId, "New");
            expect(out).toBe(row);
            expect(cacheInvalidator.invalidateKey).toHaveBeenCalledWith(`integration:customers:list:${orgId}`);
        });

        it("uses cache.del when invalidator omitted but cache present", async () => {
            const row = { id: faker.string.uuid(), name: "X" };
            repo.createIntegrationCustomer.mockResolvedValue(row);
            await service({ cacheInvalidator: undefined }).createIntegrationCustomer(orgId, "X");
            expect(cache.del).toHaveBeenCalledWith(`integration:customers:list:${orgId}`);
        });
    });

    describe("updateOnCustomerName", () => {
        beforeEach(() => {
            repo.getById.mockResolvedValue({ provider_identifier: "threads" } as unknown as IntegrationLike);
            repo.updateOnCustomerName.mockResolvedValue(undefined);
        });

        it("invalidates customers list cache and integration domain cache", async () => {
            await service().updateOnCustomerName(orgId, integrationId, "Label");
            expect(repo.updateOnCustomerName).toHaveBeenCalledWith(orgId, integrationId, "Label");
            expect(cacheInvalidator.invalidateKey).toHaveBeenCalledWith(`integration:customers:list:${orgId}`);
            expect(cacheInvalidator.invalidatePattern).toHaveBeenCalledWith(`integration:${orgId}:threads:*`);
        });
    });

    describe("upsertIntegration", () => {
        it("returns repository row and invalidates integration domain pattern for provider", async () => {
            const row = {} as unknown as IntegrationLike;
            repo.upsertIntegration.mockResolvedValue(row);
            const params = minimalUpsertParams();
            const out = await service().upsertIntegration(params);
            expect(out).toBe(row);
            expect(cacheInvalidator.invalidatePattern).toHaveBeenCalledWith(`integration:${orgId}:threads:*`);
        });

        it("does not call invalidator when cacheInvalidator omitted", async () => {
            const row = {} as unknown as IntegrationLike;
            repo.upsertIntegration.mockResolvedValue(row);
            await service({ cacheInvalidator: undefined }).upsertIntegration(minimalUpsertParams());
            expect(cacheInvalidator.invalidatePattern).not.toHaveBeenCalled();
        });
    });

    describe("mutations with per-integration invalidation", () => {
        beforeEach(() => {
            repo.getById.mockResolvedValue({ provider_identifier: "threads" } as unknown as IntegrationLike);
        });

        it("setPostingTimes updates then invalidates by provider from row", async () => {
            await service().setPostingTimes(orgId, integrationId, "[{}]");
            expect(repo.setPostingTimes).toHaveBeenCalledWith(orgId, integrationId, "[{}]");
            expect(repo.getById).toHaveBeenCalledWith(orgId, integrationId);
            expect(cacheInvalidator.invalidatePattern).toHaveBeenCalledWith(`integration:${orgId}:threads:*`);
        });

        it("disableChannel and enableChannel invalidate after repository call", async () => {
            await service().disableChannel(orgId, integrationId);
            expect(repo.disableChannel).toHaveBeenCalledWith(orgId, integrationId);
            expect(cacheInvalidator.invalidatePattern).toHaveBeenCalledWith(`integration:${orgId}:threads:*`);

            cacheInvalidator.invalidatePattern.mockClear();
            await service().enableChannel(orgId, integrationId);
            expect(repo.enableChannel).toHaveBeenCalledWith(orgId, integrationId);
            expect(cacheInvalidator.invalidatePattern).toHaveBeenCalledWith(`integration:${orgId}:threads:*`);
        });

        it("softDeleteChannel invalidates before delete using getById", async () => {
            repo.softDeleteChannel.mockResolvedValue(true);
            await service().softDeleteChannel(orgId, integrationId, "int-internal");
            expect(repo.getById).toHaveBeenCalledWith(orgId, integrationId);
            expect(cacheInvalidator.invalidatePattern).toHaveBeenCalledWith(`integration:${orgId}:threads:*`);
            expect(repo.softDeleteChannel).toHaveBeenCalledWith(orgId, integrationId, "int-internal");
        });

        it("softDeleteChannel skips invalidation when getById returns null but still deletes", async () => {
            repo.getById.mockResolvedValue(null);
            repo.softDeleteChannel.mockResolvedValue(true);
            cacheInvalidator.invalidatePattern.mockClear();
            await service().softDeleteChannel(orgId, integrationId, "int-internal");
            expect(cacheInvalidator.invalidatePattern).not.toHaveBeenCalled();
            expect(repo.softDeleteChannel).toHaveBeenCalledWith(orgId, integrationId, "int-internal");
        });
    });

    describe("getCachedIntegrationPayload", () => {
        it("returns null when cache is not configured", async () => {
            const out = await service({ cache: undefined }).getCachedIntegrationPayload(orgId, "threads", "2026-04-01");
            expect(out).toBeNull();
            expect(cache.get).not.toHaveBeenCalled();
        });

        it("returns array when cache returns array", async () => {
            const payload = [{ a: 1 }];
            cache.get.mockResolvedValue(payload);
            const out = await service().getCachedIntegrationPayload(orgId, "threads", "2026-04-01");
            expect(out).toEqual(payload);
            expect(cache.get).toHaveBeenCalledWith(`integration:${orgId}:threads:2026-04-01`);
        });

        it("returns null when cache returns non-array", async () => {
            cache.get.mockResolvedValue({ not: "array" });
            const out = await service().getCachedIntegrationPayload(orgId, "threads", "seg");
            expect(out).toBeNull();
        });
    });

    describe("setCachedIntegrationPayload", () => {
        it("no-ops when cache is not configured", async () => {
            await service({ cache: undefined }).setCachedIntegrationPayload(orgId, "threads", "seg", [{ x: 1 }]);
            expect(cache.set).not.toHaveBeenCalled();
        });

        it("sets JSON payload with expected key and ttl", async () => {
            const data = [{ t: 1 }];
            await service().setCachedIntegrationPayload(orgId, "threads", "2026-04-02", data, 42);
            expect(cache.set).toHaveBeenCalledWith(`integration:${orgId}:threads:2026-04-02`, data, 42);
        });
    });
});
