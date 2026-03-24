import { faker } from "@faker-js/faker";
import { RbacService } from "./RbacService";
import type { RbacRepository } from "../repositories/RbacRepository";

const roleId = faker.string.uuid();
const userId = faker.string.uuid();
const superAdminId = faker.string.uuid();
const adminUserId = faker.string.uuid();

function createMockRbacRepo(): jest.Mocked<RbacRepository> {
    return {
        getUserRoles: jest.fn(),
        getUserPermissions: jest.fn(),
        hasRole: jest.fn(),
        assignRole: jest.fn(),
        removeRole: jest.fn(),
        getUsersByRole: jest.fn(),
        getRolePermissions: jest.fn(),
        getPermissionsForRole: jest.fn(),
        assignPermissionToRole: jest.fn(),
        removePermissionFromRole: jest.fn(),
        isSuperAdmin: jest.fn(),
    } as unknown as jest.Mocked<RbacRepository>;
}

describe("RbacService", () => {
    let repo: jest.Mocked<RbacRepository>;

    beforeEach(() => {
        repo = createMockRbacRepo();
    });

    describe("getUserRoles", () => {
        it("returns roles from repository when no cache", async () => {
            repo.getUserRoles.mockResolvedValue({ roles: ["editor"] });
            const service = new RbacService(repo);
            const result = await service.getUserRoles(userId);
            expect(result.roles).toEqual(["editor"]);
            expect(repo.getUserRoles).toHaveBeenCalledWith(userId);
        });

        it("uses cache when provided", async () => {
            const getOrSet = jest.fn().mockResolvedValue({ roles: ["admin"] });
            const service = new RbacService(repo, { getOrSet } as never);
            const result = await service.getUserRoles(userId);
            expect(result.roles).toEqual(["admin"]);
            expect(getOrSet).toHaveBeenCalledWith(
                `rbac:user:roles:${userId}`,
                expect.any(Function),
                300
            );
            expect(repo.getUserRoles).not.toHaveBeenCalled();
        });

        it("calls repository when cache misses", async () => {
            repo.getUserRoles.mockResolvedValue({ roles: ["editor"] });
            const getOrSet = jest.fn().mockImplementation(async (_k: string, factory: () => Promise<unknown>) => factory());
            const service = new RbacService(repo, { getOrSet } as never);
            const result = await service.getUserRoles(userId);
            expect(result.roles).toEqual(["editor"]);
            expect(repo.getUserRoles).toHaveBeenCalledWith(userId);
        });
    });

    describe("getPermissionsForRole", () => {
        it("returns permissions from repository when no cache", async () => {
            repo.getPermissionsForRole.mockResolvedValue({ permissions: ["users.manage_roles"] });
            const service = new RbacService(repo);
            const result = await service.getPermissionsForRole("editor");
            expect(result.permissions).toEqual(["users.manage_roles"]);
            expect(repo.getPermissionsForRole).toHaveBeenCalledWith("editor");
        });

        it("uses cache when provided", async () => {
            const getOrSet = jest.fn().mockResolvedValue({ permissions: ["users.manage_roles"] });
            const service = new RbacService(repo, { getOrSet } as never);
            const result = await service.getPermissionsForRole("editor");
            expect(result.permissions).toEqual(["users.manage_roles"]);
            expect(getOrSet).toHaveBeenCalledWith(
                "rbac:role:permissions:editor",
                expect.any(Function),
                300
            );
            expect(repo.getPermissionsForRole).not.toHaveBeenCalled();
        });
    });

    describe("getAllRolePermissions", () => {
        it("returns role permissions from repository when no cache", async () => {
            const rolePerms = [{ role: "editor" as const, permission: "users.manage_roles" as const }];
            repo.getRolePermissions.mockResolvedValue({ permissions: rolePerms });
            const service = new RbacService(repo);
            const result = await service.getAllRolePermissions();
            expect(result.permissions).toEqual(rolePerms);
            expect(repo.getRolePermissions).toHaveBeenCalled();
        });

        it("uses cache when provided", async () => {
            const rolePerms = [{ role: "editor" as const, permission: "users.manage_roles" as const }];
            const getOrSet = jest.fn().mockResolvedValue({ permissions: rolePerms });
            const service = new RbacService(repo, { getOrSet } as never);
            const result = await service.getAllRolePermissions();
            expect(result.permissions).toEqual(rolePerms);
            expect(getOrSet).toHaveBeenCalledWith(
                "rbac:role-permissions:all",
                expect.any(Function),
                300
            );
            expect(repo.getRolePermissions).not.toHaveBeenCalled();
        });
    });

    describe("assignRoleBySuperAdmin", () => {
        it("assigns any role including admin", async () => {
            repo.assignRole.mockResolvedValue({ roleId });
            const service = new RbacService(repo);
            const result = await service.assignRoleBySuperAdmin(userId, "admin", superAdminId);
            expect(result.roleId).toBe(roleId);
            expect(repo.assignRole).toHaveBeenCalledWith(userId, "admin", superAdminId);
        });

        it("invalidates cache after assign when roleId returned", async () => {
            repo.assignRole.mockResolvedValue({ roleId });
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new RbacService(repo, undefined, {
                invalidateKey,
                invalidatePattern,
            } as never);
            await service.assignRoleBySuperAdmin(userId, "editor", superAdminId);
            expect(invalidateKey).toHaveBeenCalledWith("user:list:full:with_roles");
            expect(invalidateKey).toHaveBeenCalledWith("rbac:role-permissions:all");
            expect(invalidatePattern).toHaveBeenCalledWith("rbac:user:roles:*");
            expect(invalidatePattern).toHaveBeenCalledWith("rbac:role:permissions:*");
        });
    });

    describe("assignRoleByAdmin", () => {
        it("assigns editor but not admin", async () => {
            repo.assignRole.mockResolvedValue({ roleId });
            const service = new RbacService(repo);
            await service.assignRoleByAdmin(userId, "editor", adminUserId);
            expect(repo.assignRole).toHaveBeenCalledWith(userId, "editor", adminUserId);
        });

        it("throws when admin tries to assign admin role", async () => {
            const service = new RbacService(repo);
            await expect(
                service.assignRoleByAdmin(userId, "admin", adminUserId)
            ).rejects.toThrow("Admins cannot assign the admin role");
            expect(repo.assignRole).not.toHaveBeenCalled();
        });
    });

    describe("removeRole", () => {
        it("allows super admin to remove admin role", async () => {
            repo.isSuperAdmin.mockResolvedValue(true);
            repo.removeRole.mockResolvedValue(true);
            const service = new RbacService(repo);
            await service.removeRole(userId, "admin", superAdminId);
            expect(repo.removeRole).toHaveBeenCalledWith(userId, "admin", superAdminId);
        });

        it("throws when non-super-admin tries to remove admin role", async () => {
            repo.isSuperAdmin.mockResolvedValue(false);
            const service = new RbacService(repo);
            await expect(
                service.removeRole(userId, "admin", adminUserId)
            ).rejects.toThrow("Admins cannot remove the admin role");
            expect(repo.removeRole).not.toHaveBeenCalled();
        });

        it("invalidates cache after remove", async () => {
            repo.isSuperAdmin.mockResolvedValue(false);
            repo.removeRole.mockResolvedValue(true);
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new RbacService(repo, undefined, {
                invalidateKey,
                invalidatePattern,
            } as never);
            await service.removeRole(userId, "editor", superAdminId);
            expect(invalidateKey).toHaveBeenCalledWith("user:list:full:with_roles");
            expect(invalidateKey).toHaveBeenCalledWith("rbac:role-permissions:all");
            expect(invalidatePattern).toHaveBeenCalledWith("rbac:user:roles:*");
            expect(invalidatePattern).toHaveBeenCalledWith("rbac:role:permissions:*");
        });
    });

    describe("validateRole", () => {
        it("accepts valid roles", () => {
            expect(RbacService.validateRole("editor")).toBe("editor");
            expect(RbacService.validateRole("support")).toBe("support");
            expect(RbacService.validateRole("admin")).toBe("admin");
        });

        it("throws for invalid role", () => {
            expect(() => RbacService.validateRole("invalid")).toThrow("Invalid role");
        });
    });
});
