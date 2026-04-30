import { faker } from "@faker-js/faker";

import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import type CacheService from "../connections/cache/CacheService";
import { SignatureNotFoundError } from "../errors/SignatureError";
import type { SignatureRepository } from "../repositories/SignatureRepository";
import type { SignatureLike } from "../utils/dtos/SignatureDTO";
import { logger } from "../utils/Logger";
import type { IntegrationConnectionService } from "./IntegrationConnectionService";
import { SignatureService } from "./SignatureService";

const authUserId = faker.string.uuid();
const organizationId = faker.string.uuid();

function signatureRow(overrides: Partial<SignatureLike> = {}): SignatureLike {
    return {
        id: faker.string.uuid(),
        organization_id: organizationId,
        title: faker.lorem.words(3),
        content: faker.lorem.sentence(),
        is_default: false,
        created_at: faker.date.recent().toISOString(),
        updated_at: faker.date.recent().toISOString(),
        ...overrides,
    };
}

function createMockSignatureRepo(): jest.Mocked<SignatureRepository> {
    return {
        listByOrganization: jest.fn(),
        findById: jest.fn(),
        clearDefaultForOrganization: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    } as unknown as jest.Mocked<SignatureRepository>;
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
    return `signature:list:byOrgId:${orgId}`;
}

describe("SignatureService", () => {
    let repo: jest.Mocked<SignatureRepository>;
    let integration: jest.Mocked<Pick<IntegrationConnectionService, "assertOrganizationMember">>;

    beforeEach(() => {
        repo = createMockSignatureRepo();
        integration = createMockIntegration();
        jest.spyOn(logger, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("listForOrganization", () => {
        it("asserts membership then returns repository list when no cache", async () => {
            const rows = [signatureRow()];
            repo.listByOrganization.mockResolvedValue(rows);
            const service = new SignatureService(repo, asIntegrationConnectionService(integration));
            const result = await service.listForOrganization(authUserId, organizationId);
            expect(result).toEqual(rows);
            expect(integration.assertOrganizationMember).toHaveBeenCalledWith(authUserId, organizationId);
            expect(repo.listByOrganization).toHaveBeenCalledWith(organizationId);
        });

        it("uses getOrSet with per-org list key and TTL when cache is provided", async () => {
            const rows = [signatureRow()];
            repo.listByOrganization.mockResolvedValue(rows);
            const getOrSet = jest.fn().mockImplementation(async (_k: string, factory: () => Promise<unknown>) =>
                factory()
            );
            const cache = { getOrSet } as unknown as CacheService;
            const service = new SignatureService(repo, asIntegrationConnectionService(integration), cache);
            const result = await service.listForOrganization(authUserId, organizationId);
            expect(result).toEqual(rows);
            expect(getOrSet).toHaveBeenCalledWith(
                listCacheKeyForOrg(organizationId),
                expect.any(Function),
                300
            );
        });

        it("propagates when assertOrganizationMember rejects", async () => {
            const err = new Error("forbidden");
            integration.assertOrganizationMember.mockRejectedValue(err);
            const service = new SignatureService(repo, asIntegrationConnectionService(integration));
            await expect(service.listForOrganization(authUserId, organizationId)).rejects.toBe(err);
            expect(repo.listByOrganization).not.toHaveBeenCalled();
        });
    });

    describe("getById", () => {
        it("returns null when row is missing", async () => {
            repo.findById.mockResolvedValue(null);
            const service = new SignatureService(repo, asIntegrationConnectionService(integration));
            expect(await service.getById(authUserId, faker.string.uuid())).toBeNull();
            expect(integration.assertOrganizationMember).not.toHaveBeenCalled();
        });

        it("asserts membership for row organization and returns row", async () => {
            const row = signatureRow();
            repo.findById.mockResolvedValue(row);
            const service = new SignatureService(repo, asIntegrationConnectionService(integration));
            const result = await service.getById(authUserId, row.id);
            expect(result).toEqual(row);
            expect(integration.assertOrganizationMember).toHaveBeenCalledWith(authUserId, row.organization_id);
        });
    });

    describe("create", () => {
        const inputBase = {
            organizationId,
            title: faker.lorem.words(2),
            content: faker.lorem.sentence(),
            isDefault: false,
        };

        it("inserts and returns id; invalidates list cache key", async () => {
            const inserted = signatureRow({ title: inputBase.title, content: inputBase.content });
            repo.insert.mockResolvedValue(inserted);
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const cacheInvalidator = { invalidateKey } as unknown as CacheInvalidationService;
            const service = new SignatureService(
                repo,
                asIntegrationConnectionService(integration),
                undefined,
                cacheInvalidator
            );
            const id = await service.create(authUserId, inputBase);
            expect(id).toBe(inserted.id);
            expect(repo.clearDefaultForOrganization).not.toHaveBeenCalled();
            expect(invalidateKey).toHaveBeenCalledWith(listCacheKeyForOrg(organizationId));
        });

        it("clears default for org when isDefault is true", async () => {
            const inserted = signatureRow({ is_default: true });
            repo.insert.mockResolvedValue(inserted);
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const service = new SignatureService(
                repo,
                asIntegrationConnectionService(integration),
                undefined,
                { invalidateKey } as unknown as CacheInvalidationService
            );
            await service.create(authUserId, { ...inputBase, isDefault: true });
            expect(repo.clearDefaultForOrganization).toHaveBeenCalledWith(organizationId);
            expect(repo.insert).toHaveBeenCalled();
        });

        it("falls back to cache.del when invalidator rejects", async () => {
            const inserted = signatureRow();
            repo.insert.mockResolvedValue(inserted);
            const invalidateKey = jest.fn().mockRejectedValue(new Error("redis down"));
            const del = jest.fn().mockResolvedValue(undefined);
            const cache = { del, getOrSet: jest.fn() } as unknown as CacheService;
            const service = new SignatureService(
                repo,
                asIntegrationConnectionService(integration),
                cache,
                { invalidateKey } as unknown as CacheInvalidationService
            );
            await service.create(authUserId, inputBase);
            expect(del).toHaveBeenCalledWith(listCacheKeyForOrg(organizationId));
        });
    });

    describe("update", () => {
        it("throws SignatureNotFoundError when row missing", async () => {
            repo.findById.mockResolvedValue(null);
            const service = new SignatureService(repo, asIntegrationConnectionService(integration));
            const sid = faker.string.uuid();
            await expect(service.update(authUserId, sid, { title: "x" })).rejects.toBeInstanceOf(
                SignatureNotFoundError
            );
        });

        it("updates, returns id, and invalidates list cache", async () => {
            const existing = signatureRow();
            const updated = signatureRow({
                id: existing.id,
                organization_id: existing.organization_id,
                title: faker.lorem.word(),
            });
            repo.findById.mockResolvedValue(existing);
            repo.update.mockResolvedValue(updated);
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const service = new SignatureService(
                repo,
                asIntegrationConnectionService(integration),
                undefined,
                { invalidateKey } as unknown as CacheInvalidationService
            );
            const id = await service.update(authUserId, existing.id, { title: updated.title });
            expect(id).toBe(updated.id);
            expect(repo.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    signatureId: existing.id,
                    organizationId: existing.organization_id,
                    title: updated.title,
                })
            );
            expect(invalidateKey).toHaveBeenCalledWith(listCacheKeyForOrg(existing.organization_id));
        });

        it("clears default when setting isDefault true", async () => {
            const existing = signatureRow({ is_default: false });
            const updated = signatureRow({ id: existing.id, organization_id: existing.organization_id, is_default: true });
            repo.findById.mockResolvedValue(existing);
            repo.update.mockResolvedValue(updated);
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const service = new SignatureService(
                repo,
                asIntegrationConnectionService(integration),
                undefined,
                { invalidateKey } as unknown as CacheInvalidationService
            );
            await service.update(authUserId, existing.id, { isDefault: true });
            expect(repo.clearDefaultForOrganization).toHaveBeenCalledWith(existing.organization_id);
        });
    });

    describe("delete", () => {
        it("throws SignatureNotFoundError when row missing", async () => {
            repo.findById.mockResolvedValue(null);
            const service = new SignatureService(repo, asIntegrationConnectionService(integration));
            await expect(service.delete(authUserId, faker.string.uuid())).rejects.toBeInstanceOf(
                SignatureNotFoundError
            );
        });

        it("throws when delete returns false", async () => {
            const existing = signatureRow();
            repo.findById.mockResolvedValue(existing);
            repo.delete.mockResolvedValue(false);
            const service = new SignatureService(repo, asIntegrationConnectionService(integration));
            await expect(service.delete(authUserId, existing.id)).rejects.toBeInstanceOf(SignatureNotFoundError);
        });

        it("deletes and invalidates list cache", async () => {
            const existing = signatureRow();
            repo.findById.mockResolvedValue(existing);
            repo.delete.mockResolvedValue(true);
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const service = new SignatureService(
                repo,
                asIntegrationConnectionService(integration),
                undefined,
                { invalidateKey } as unknown as CacheInvalidationService
            );
            await service.delete(authUserId, existing.id);
            expect(repo.delete).toHaveBeenCalledWith(existing.id, existing.organization_id);
            expect(invalidateKey).toHaveBeenCalledWith(listCacheKeyForOrg(existing.organization_id));
        });
    });
});
