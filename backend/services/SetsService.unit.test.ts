import { faker } from "@faker-js/faker";

import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import type CacheService from "../connections/cache/CacheService";
import { SetNotFoundError } from "../errors/SetError";
import type { SetsRepository } from "../repositories/SetsRepository";
import type { SetLike } from "../utils/dtos/SetDTO";
import { logger } from "../utils/Logger";
import type { IntegrationConnectionService } from "./IntegrationConnectionService";
import { SetsService } from "./SetsService";

const authUserId = faker.string.uuid();
const organizationId = faker.string.uuid();

function setRow(overrides: Partial<SetLike> = {}): SetLike {
    return {
        id: faker.string.uuid(),
        organization_id: organizationId,
        name: faker.lorem.words(2),
        content: "{}",
        created_at: faker.date.recent().toISOString(),
        updated_at: faker.date.recent().toISOString(),
        ...overrides,
    };
}

function createMockSetsRepo(): jest.Mocked<SetsRepository> {
    return {
        listByOrganization: jest.fn(),
        findById: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    } as unknown as jest.Mocked<SetsRepository>;
}

function createMockIntegration(): jest.Mocked<Pick<IntegrationConnectionService, "assertOrganizationMember">> {
    return {
        assertOrganizationMember: jest.fn().mockResolvedValue(undefined),
    };
}

function asIntegrationConnectionService(
    mock: jest.Mocked<Pick<IntegrationConnectionService, "assertOrganizationMember">>
): IntegrationConnectionService {
    return mock as unknown as IntegrationConnectionService;
}

function listCacheKeyForOrg(orgId: string): string {
    return `sets:list:byOrgId:${orgId}`;
}

function byIdCacheKey(setId: string): string {
    return `sets:bySetId:${setId}`;
}

describe("SetsService", () => {
    let repo: jest.Mocked<SetsRepository>;
    let integration: jest.Mocked<Pick<IntegrationConnectionService, "assertOrganizationMember">>;

    beforeEach(() => {
        repo = createMockSetsRepo();
        integration = createMockIntegration();
        jest.spyOn(logger, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("listForOrganization", () => {
        it("asserts membership then returns repository list when no cache", async () => {
            const rows = [setRow()];
            repo.listByOrganization.mockResolvedValue(rows);
            const service = new SetsService(repo, asIntegrationConnectionService(integration));
            const result = await service.listForOrganization(authUserId, organizationId);
            expect(result).toEqual(rows);
            expect(integration.assertOrganizationMember).toHaveBeenCalledWith(authUserId, organizationId);
            expect(repo.listByOrganization).toHaveBeenCalledWith(organizationId);
        });

        it("uses getOrSet with per-org list key and TTL when cache is provided", async () => {
            const rows = [setRow()];
            repo.listByOrganization.mockResolvedValue(rows);
            const getOrSet = jest.fn().mockImplementation(async (_k: string, factory: () => Promise<unknown>) =>
                factory()
            );
            const cache = { getOrSet } as unknown as CacheService;
            const service = new SetsService(repo, asIntegrationConnectionService(integration), cache);
            const result = await service.listForOrganization(authUserId, organizationId);
            expect(result).toEqual(rows);
            expect(getOrSet).toHaveBeenCalledWith(listCacheKeyForOrg(organizationId), expect.any(Function), 300);
        });

        it("propagates when assertOrganizationMember rejects", async () => {
            const err = new Error("forbidden");
            integration.assertOrganizationMember.mockRejectedValue(err);
            const service = new SetsService(repo, asIntegrationConnectionService(integration));
            await expect(service.listForOrganization(authUserId, organizationId)).rejects.toBe(err);
            expect(repo.listByOrganization).not.toHaveBeenCalled();
        });
    });

    describe("getByIdForMember", () => {
        it("returns null when row is missing; does not assert membership", async () => {
            repo.findById.mockResolvedValue(null);
            const service = new SetsService(repo, asIntegrationConnectionService(integration));
            const setId = faker.string.uuid();
            expect(await service.getByIdForMember(authUserId, setId)).toBeNull();
            expect(integration.assertOrganizationMember).not.toHaveBeenCalled();
        });

        it("uses getOrSet with per-set key and TTL when cache is provided", async () => {
            const row = setRow();
            const getOrSet = jest.fn().mockImplementation(async (_k: string, factory: () => Promise<unknown>) =>
                factory()
            );
            repo.findById.mockResolvedValue(row);
            const cache = { getOrSet } as unknown as CacheService;
            const service = new SetsService(repo, asIntegrationConnectionService(integration), cache);
            const result = await service.getByIdForMember(authUserId, row.id);
            expect(result).toEqual(row);
            expect(getOrSet).toHaveBeenCalledWith(byIdCacheKey(row.id), expect.any(Function), 300);
            expect(integration.assertOrganizationMember).toHaveBeenCalledWith(authUserId, row.organization_id);
        });

        it("asserts membership and returns row without cache", async () => {
            const row = setRow();
            repo.findById.mockResolvedValue(row);
            const service = new SetsService(repo, asIntegrationConnectionService(integration));
            expect(await service.getByIdForMember(authUserId, row.id)).toEqual(row);
            expect(integration.assertOrganizationMember).toHaveBeenCalledWith(authUserId, row.organization_id);
        });

        it("propagates when assertOrganizationMember rejects for an existing row", async () => {
            const row = setRow();
            repo.findById.mockResolvedValue(row);
            const err = new Error("forbidden");
            integration.assertOrganizationMember.mockRejectedValue(err);
            const service = new SetsService(repo, asIntegrationConnectionService(integration));
            await expect(service.getByIdForMember(authUserId, row.id)).rejects.toBe(err);
        });
    });

    describe("upsert", () => {
        const bodyBase = { name: faker.lorem.word(), content: "{}" };

        it("inserts when no id and invalidates list cache only", async () => {
            const inserted = setRow({ name: bodyBase.name });
            repo.insert.mockResolvedValue(inserted);
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const service = new SetsService(
                repo,
                asIntegrationConnectionService(integration),
                undefined,
                { invalidateKey } as unknown as CacheInvalidationService
            );
            const out = await service.upsert(authUserId, organizationId, bodyBase);
            expect(out).toEqual({ id: inserted.id });
            expect(repo.insert).toHaveBeenCalledWith(
                expect.objectContaining({ organizationId, name: bodyBase.name, content: bodyBase.content })
            );
            expect(repo.update).not.toHaveBeenCalled();
            expect(invalidateKey).toHaveBeenCalledTimes(1);
            expect(invalidateKey).toHaveBeenCalledWith(listCacheKeyForOrg(organizationId));
        });

        it("updates when id exists in same org and invalidates list and by-id keys", async () => {
            const existing = setRow();
            const updated = setRow({
                id: existing.id,
                organization_id: existing.organization_id,
                name: "new",
            });
            repo.findById.mockResolvedValue(existing);
            repo.update.mockResolvedValue(updated);
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const service = new SetsService(
                repo,
                asIntegrationConnectionService(integration),
                undefined,
                { invalidateKey } as unknown as CacheInvalidationService
            );
            const out = await service.upsert(authUserId, organizationId, {
                id: existing.id,
                name: updated.name,
                content: updated.content,
            });
            expect(out.id).toBe(updated.id);
            expect(repo.update).toHaveBeenCalled();
            expect(repo.insert).not.toHaveBeenCalled();
            expect(invalidateKey).toHaveBeenCalledWith(listCacheKeyForOrg(organizationId));
            expect(invalidateKey).toHaveBeenCalledWith(byIdCacheKey(existing.id));
        });

        it("inserts when id provided but existing belongs to another organization", async () => {
            const otherOrg = faker.string.uuid();
            const existing = setRow({ organization_id: otherOrg });
            const inserted = setRow();
            repo.findById.mockResolvedValue(existing);
            repo.insert.mockResolvedValue(inserted);
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const service = new SetsService(
                repo,
                asIntegrationConnectionService(integration),
                undefined,
                { invalidateKey } as unknown as CacheInvalidationService
            );
            await service.upsert(authUserId, organizationId, { id: existing.id, ...bodyBase });
            expect(repo.insert).toHaveBeenCalled();
            expect(repo.update).not.toHaveBeenCalled();
            expect(invalidateKey).toHaveBeenCalledTimes(1);
            expect(invalidateKey).toHaveBeenCalledWith(listCacheKeyForOrg(organizationId));
        });

        it("returns body id when update resolves to null row", async () => {
            const existing = setRow();
            repo.findById.mockResolvedValue(existing);
            repo.update.mockResolvedValue(null as unknown as SetLike);
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const service = new SetsService(
                repo,
                asIntegrationConnectionService(integration),
                undefined,
                { invalidateKey } as unknown as CacheInvalidationService
            );
            const out = await service.upsert(authUserId, organizationId, { id: existing.id, ...bodyBase });
            expect(out).toEqual({ id: existing.id });
        });

        it("propagates when assertOrganizationMember rejects before upsert", async () => {
            const err = new Error("forbidden");
            integration.assertOrganizationMember.mockRejectedValue(err);
            const service = new SetsService(repo, asIntegrationConnectionService(integration));
            await expect(service.upsert(authUserId, organizationId, bodyBase)).rejects.toBe(err);
            expect(repo.findById).not.toHaveBeenCalled();
        });
    });

    describe("delete", () => {
        it("throws SetNotFoundError when row missing", async () => {
            repo.findById.mockResolvedValue(null);
            const service = new SetsService(repo, asIntegrationConnectionService(integration));
            const setId = faker.string.uuid();
            await expect(service.delete(authUserId, setId)).rejects.toBeInstanceOf(SetNotFoundError);
        });

        it("throws SetNotFoundError when repository delete returns false", async () => {
            const existing = setRow();
            repo.findById.mockResolvedValue(existing);
            repo.delete.mockResolvedValue(false);
            const service = new SetsService(repo, asIntegrationConnectionService(integration));
            await expect(service.delete(authUserId, existing.id)).rejects.toBeInstanceOf(SetNotFoundError);
        });

        it("deletes and invalidates list and by-id cache keys", async () => {
            const existing = setRow();
            repo.findById.mockResolvedValue(existing);
            repo.delete.mockResolvedValue(true);
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const service = new SetsService(
                repo,
                asIntegrationConnectionService(integration),
                undefined,
                { invalidateKey } as unknown as CacheInvalidationService
            );
            await service.delete(authUserId, existing.id);
            expect(repo.delete).toHaveBeenCalledWith(existing.id, existing.organization_id);
            expect(invalidateKey).toHaveBeenCalledWith(listCacheKeyForOrg(existing.organization_id));
            expect(invalidateKey).toHaveBeenCalledWith(byIdCacheKey(existing.id));
        });

        it("falls back to cache.del when invalidator rejects", async () => {
            const existing = setRow();
            repo.findById.mockResolvedValue(existing);
            repo.delete.mockResolvedValue(true);
            const invalidateKey = jest.fn().mockRejectedValue(new Error("redis down"));
            const del = jest.fn().mockResolvedValue(true);
            const cache = { del, getOrSet: jest.fn() } as unknown as CacheService;
            const service = new SetsService(
                repo,
                asIntegrationConnectionService(integration),
                cache,
                { invalidateKey } as unknown as CacheInvalidationService
            );
            await service.delete(authUserId, existing.id);
            expect(del).toHaveBeenCalledWith(listCacheKeyForOrg(existing.organization_id));
            expect(del).toHaveBeenCalledWith(byIdCacheKey(existing.id));
        });
    });
});
