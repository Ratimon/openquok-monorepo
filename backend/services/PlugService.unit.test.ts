import { faker } from "@faker-js/faker";
import { PlugService } from "./PlugService";
import type { IntegrationRepository } from "../repositories/IntegrationRepository";
import type { PlugRepository } from "../repositories/PlugRepository";
import type { IntegrationLike } from "../utils/dtos/IntegrationDTO";
import type { IntegrationPlugRowDto } from "../utils/dtos/PlugDTO";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import type CacheService from "../connections/cache/CacheService";

const orgId = faker.string.uuid();
const integrationId = faker.string.uuid();

function createPlugRepoMock(): jest.Mocked<
    Pick<
        PlugRepository,
        | "listPlugsByIntegration"
        | "listActivatedPlugsByIntegration"
        | "getPlugRowById"
        | "insertPlug"
        | "updatePlugData"
        | "deletePlugById"
        | "setPlugActivated"
    >
> {
    return {
        listPlugsByIntegration: jest.fn(),
        listActivatedPlugsByIntegration: jest.fn(),
        getPlugRowById: jest.fn(),
        insertPlug: jest.fn(),
        updatePlugData: jest.fn(),
        deletePlugById: jest.fn(),
        setPlugActivated: jest.fn(),
    };
}

function createIntegrationRepoMock(): jest.Mocked<Pick<IntegrationRepository, "getById">> {
    return {
        getById: jest.fn(),
    };
}

/** Minimal cache double for plug read-through + invalidation assertions. */
function createCacheMock(): CacheService {
    return {
        getOrSet: jest.fn(async (_key: string, factory: () => Promise<unknown>) => factory()),
        del: jest.fn().mockResolvedValue(true),
    } as unknown as CacheService;
}

describe("PlugService", () => {
    let plugRepo: ReturnType<typeof createPlugRepoMock>;
    let integrationRepo: ReturnType<typeof createIntegrationRepoMock>;
    let cacheInvalidator: jest.Mocked<Pick<CacheInvalidationService, "invalidatePattern" | "invalidateKey">>;

    beforeEach(() => {
        plugRepo = createPlugRepoMock();
        integrationRepo = createIntegrationRepoMock();
        cacheInvalidator = {
            invalidatePattern: jest.fn().mockResolvedValue(true),
            invalidateKey: jest.fn().mockResolvedValue(true),
        };
    });

    function service(overrides?: {
        cache?: CacheService;
        cacheInvalidator?: CacheInvalidationService;
    }) {
        const inv =
            overrides !== undefined && "cacheInvalidator" in overrides
                ? overrides.cacheInvalidator
                : (cacheInvalidator as unknown as CacheInvalidationService);
        const cache =
            overrides !== undefined && "cache" in overrides ? overrides.cache : undefined;
        return new PlugService(
            plugRepo as unknown as PlugRepository,
            integrationRepo as unknown as IntegrationRepository,
            cache,
            inv
        );
    }

    describe("plugs", () => {
        const plugRow = {
            id: faker.string.uuid(),
            organization_id: orgId,
            integration_id: integrationId,
            plug_function: "autoPlugPost",
            data: "{}",
            activated: true,
        } satisfies IntegrationPlugRowDto;

        it("listIntegrationPlugs forwards to plug repository", async () => {
            plugRepo.listPlugsByIntegration.mockResolvedValue([plugRow]);
            const out = await service().listIntegrationPlugs(orgId, integrationId);
            expect(out).toEqual([plugRow]);
            expect(plugRepo.listPlugsByIntegration).toHaveBeenCalledWith(orgId, integrationId);
        });

        it("listIntegrationPlugs uses cache getOrSet when cache is provided", async () => {
            const cache = createCacheMock();
            plugRepo.listPlugsByIntegration.mockResolvedValue([plugRow]);
            await service({ cache }).listIntegrationPlugs(orgId, integrationId);
            expect(cache.getOrSet).toHaveBeenCalledWith(
                `plug:list:${orgId}:${integrationId}`,
                expect.any(Function),
                expect.any(Number)
            );
            expect(plugRepo.listPlugsByIntegration).toHaveBeenCalledWith(orgId, integrationId);
        });

        it("listActivatedPlugsByIntegration uses cache getOrSet when cache is provided", async () => {
            const cache = createCacheMock();
            plugRepo.listActivatedPlugsByIntegration.mockResolvedValue([plugRow]);
            await service({ cache }).listActivatedPlugsByIntegration(orgId, integrationId);
            expect(cache.getOrSet).toHaveBeenCalledWith(
                `plug:activated:${orgId}:${integrationId}`,
                expect.any(Function),
                expect.any(Number)
            );
            expect(plugRepo.listActivatedPlugsByIntegration).toHaveBeenCalledWith(orgId, integrationId);
        });

        it("getPlugRowById forwards to plug repository", async () => {
            plugRepo.getPlugRowById.mockResolvedValue(plugRow);
            const out = await service().getPlugRowById(plugRow.id);
            expect(out).toBe(plugRow);
            expect(plugRepo.getPlugRowById).toHaveBeenCalledWith(plugRow.id);
        });

        it("getPlugRowById uses cache getOrSet when cache is provided", async () => {
            const cache = createCacheMock();
            plugRepo.getPlugRowById.mockResolvedValue(plugRow);
            await service({ cache }).getPlugRowById(plugRow.id);
            expect(cache.getOrSet).toHaveBeenCalledWith(
                `plug:row:${plugRow.id}`,
                expect.any(Function),
                expect.any(Number)
            );
            expect(plugRepo.getPlugRowById).toHaveBeenCalledWith(plugRow.id);
        });

        it("upsertIntegrationPlug inserts then invalidates integration domain cache", async () => {
            const plugId = faker.string.uuid();
            integrationRepo.getById.mockResolvedValue({ provider_identifier: "threads" } as unknown as IntegrationLike);
            plugRepo.insertPlug.mockResolvedValue({ id: plugId, activated: true });
            const out = await service().upsertIntegrationPlug({
                organizationId: orgId,
                integrationId,
                plugFunction: "autoPlugPost",
                dataJson: "{}",
            });
            expect(out).toEqual({ id: plugId, activated: true });
            expect(plugRepo.insertPlug).toHaveBeenCalledWith({
                organizationId: orgId,
                integrationId,
                plugFunction: "autoPlugPost",
                dataJson: "{}",
            });
            expect(plugRepo.updatePlugData).not.toHaveBeenCalled();
            expect(integrationRepo.getById).toHaveBeenCalledWith(orgId, integrationId);
            expect(cacheInvalidator.invalidatePattern).toHaveBeenCalledWith(`integration:${orgId}:threads:*`);
        });

        it("upsertIntegrationPlug deletes plug read cache keys when cache is provided", async () => {
            const plugId = faker.string.uuid();
            const cache = createCacheMock();
            integrationRepo.getById.mockResolvedValue({ provider_identifier: "threads" } as unknown as IntegrationLike);
            plugRepo.insertPlug.mockResolvedValue({ id: plugId, activated: true });
            await service({ cache }).upsertIntegrationPlug({
                organizationId: orgId,
                integrationId,
                plugFunction: "autoPlugPost",
                dataJson: "{}",
            });
            expect(cache.del).toHaveBeenCalledWith(`plug:list:${orgId}:${integrationId}`);
            expect(cache.del).toHaveBeenCalledWith(`plug:activated:${orgId}:${integrationId}`);
            expect(cache.del).toHaveBeenCalledWith(`plug:row:${plugId}`);
        });

        it("upsertIntegrationPlug updates by plugId then invalidates cache", async () => {
            const plugId = faker.string.uuid();
            integrationRepo.getById.mockResolvedValue({ provider_identifier: "threads" } as unknown as IntegrationLike);
            plugRepo.updatePlugData.mockResolvedValue({ id: plugId, activated: false });
            const out = await service().upsertIntegrationPlug({
                organizationId: orgId,
                integrationId,
                plugFunction: "autoPlugPost",
                dataJson: "{}",
                plugId,
            });
            expect(out).toEqual({ id: plugId, activated: false });
            expect(plugRepo.updatePlugData).toHaveBeenCalledWith({
                organizationId: orgId,
                integrationId,
                plugId,
                dataJson: "{}",
            });
            expect(plugRepo.insertPlug).not.toHaveBeenCalled();
            expect(cacheInvalidator.invalidatePattern).toHaveBeenCalledWith(`integration:${orgId}:threads:*`);
        });

        it("upsertIntegrationPlug skips invalidator when cacheInvalidator omitted", async () => {
            integrationRepo.getById.mockResolvedValue({ provider_identifier: "threads" } as unknown as IntegrationLike);
            plugRepo.insertPlug.mockResolvedValue({ id: faker.string.uuid(), activated: false });
            await service({ cacheInvalidator: undefined }).upsertIntegrationPlug({
                organizationId: orgId,
                integrationId,
                plugFunction: "autoPlugPost",
                dataJson: "{}",
            });
            expect(cacheInvalidator.invalidatePattern).not.toHaveBeenCalled();
        });

        it("setIntegrationPlugActivated invalidates using plug.integration_id when plug existed before update", async () => {
            const plugId = plugRow.id;
            plugRepo.getPlugRowById.mockResolvedValue(plugRow);
            plugRepo.setPlugActivated.mockResolvedValue({ id: plugId });
            integrationRepo.getById.mockResolvedValue({ provider_identifier: "threads" } as unknown as IntegrationLike);
            const out = await service().setIntegrationPlugActivated(orgId, plugId, false);
            expect(out).toEqual({ id: plugId });
            expect(plugRepo.setPlugActivated).toHaveBeenCalledWith(orgId, plugId, false);
            expect(integrationRepo.getById).toHaveBeenCalledWith(orgId, integrationId);
            expect(cacheInvalidator.invalidatePattern).toHaveBeenCalledWith(`integration:${orgId}:threads:*`);
        });

        it("setIntegrationPlugActivated deletes plug read cache keys when cache is provided", async () => {
            const cache = createCacheMock();
            plugRepo.getPlugRowById.mockResolvedValue(plugRow);
            plugRepo.setPlugActivated.mockResolvedValue({ id: plugRow.id });
            integrationRepo.getById.mockResolvedValue({ provider_identifier: "threads" } as unknown as IntegrationLike);
            await service({ cache }).setIntegrationPlugActivated(orgId, plugRow.id, false);
            expect(cache.del).toHaveBeenCalledWith(`plug:list:${orgId}:${integrationId}`);
            expect(cache.del).toHaveBeenCalledWith(`plug:activated:${orgId}:${integrationId}`);
            expect(cache.del).toHaveBeenCalledWith(`plug:row:${plugRow.id}`);
        });

        it("setIntegrationPlugActivated skips invalidation when no plug row before update", async () => {
            const plugId = faker.string.uuid();
            plugRepo.getPlugRowById.mockResolvedValue(null);
            plugRepo.setPlugActivated.mockResolvedValue({ id: plugId });
            cacheInvalidator.invalidatePattern.mockClear();
            await service().setIntegrationPlugActivated(orgId, plugId, true);
            expect(cacheInvalidator.invalidatePattern).not.toHaveBeenCalled();
        });

        it("setIntegrationPlugActivated skips invalidation when getById returns null after existing plug", async () => {
            plugRepo.getPlugRowById.mockResolvedValue(plugRow);
            plugRepo.setPlugActivated.mockResolvedValue({ id: plugRow.id });
            integrationRepo.getById.mockResolvedValue(null);
            cacheInvalidator.invalidatePattern.mockClear();
            await service().setIntegrationPlugActivated(orgId, plugRow.id, true);
            expect(cacheInvalidator.invalidatePattern).not.toHaveBeenCalled();
        });

        it("deleteIntegrationPlug removes row and invalidates cache", async () => {
            plugRepo.getPlugRowById.mockResolvedValue(plugRow);
            plugRepo.deletePlugById.mockResolvedValue({ id: plugRow.id });
            integrationRepo.getById.mockResolvedValue({ provider_identifier: "threads" } as unknown as IntegrationLike);
            const out = await service().deleteIntegrationPlug(orgId, plugRow.id);
            expect(out).toEqual({ id: plugRow.id });
            expect(plugRepo.deletePlugById).toHaveBeenCalledWith(orgId, plugRow.id);
            expect(cacheInvalidator.invalidatePattern).toHaveBeenCalledWith(`integration:${orgId}:threads:*`);
        });

        it("deleteIntegrationPlug deletes plug read cache keys when cache is provided", async () => {
            const cache = createCacheMock();
            plugRepo.getPlugRowById.mockResolvedValue(plugRow);
            plugRepo.deletePlugById.mockResolvedValue({ id: plugRow.id });
            integrationRepo.getById.mockResolvedValue({ provider_identifier: "threads" } as unknown as IntegrationLike);
            await service({ cache }).deleteIntegrationPlug(orgId, plugRow.id);
            expect(cache.del).toHaveBeenCalledWith(`plug:list:${orgId}:${integrationId}`);
            expect(cache.del).toHaveBeenCalledWith(`plug:activated:${orgId}:${integrationId}`);
            expect(cache.del).toHaveBeenCalledWith(`plug:row:${plugRow.id}`);
        });

        it("deleteIntegrationPlug skips invalidation when delete returns null", async () => {
            plugRepo.getPlugRowById.mockResolvedValue(plugRow);
            plugRepo.deletePlugById.mockResolvedValue(null);
            cacheInvalidator.invalidatePattern.mockClear();
            const out = await service().deleteIntegrationPlug(orgId, plugRow.id);
            expect(out).toBeNull();
            expect(cacheInvalidator.invalidatePattern).not.toHaveBeenCalled();
        });
    });
});
