import { faker } from "@faker-js/faker";
import { UserService } from "./UserService";
import type { UserRepository } from "../repositories/UserRepository";
import type { UserLike } from "../utils/dtos/UserDTO";
import type { RbacRepository } from "../repositories/RbacRepository";
import { config } from "../config/GlobalConfig";

const authUserId = faker.string.uuid();
const userId = faker.string.uuid();
const email = faker.internet.email();
const fullName = faker.person.fullName();
const createdAt = faker.date.past().toISOString();

const mockUserLike: UserLike = {
    id: userId,
    auth_id: authUserId,
    email,
    full_name: fullName,
    is_email_verified: true,
    created_at: createdAt,
    updated_at: new Date().toISOString(),
};

const mockAdminRow = {
    id: userId,
    email,
    created_at: createdAt,
    is_super_admin: false,
};

function createMockUserRepo(): jest.Mocked<UserRepository> {
    return {
        findFullUserByUserId: jest.fn(),
        /** `public.users.full_name` — still a separate update from `user_profiles`. */
        updateFullNameByAuthId: jest.fn(),
        /** `public.user_profiles` (avatar_url, website_url only; not full_name). */
        upsertUserProfileByAuthId: jest.fn(),
        findAllForAdmin: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
}

function createMockRbacRepo(): jest.Mocked<RbacRepository> {
    return {
        getUserRoles: jest.fn(),
    } as unknown as jest.Mocked<RbacRepository>;
}

describe("UserService", () => {
    let userRepo: jest.Mocked<UserRepository>;
    let rbacRepo: jest.Mocked<RbacRepository>;

    beforeEach(() => {
        userRepo = createMockUserRepo();
        rbacRepo = createMockRbacRepo();
        (config as { auth?: { disableRegistration?: boolean } }).auth = {};
    });

    describe("isUserSignUpAllowed", () => {
        it('returns "true" when config.auth.disableRegistration is not set', async () => {
            const service = new UserService(userRepo);
            const result = await service.isUserSignUpAllowed();
            expect(result).toBe("true");
        });

        it('returns "false" when config.auth.disableRegistration is true', async () => {
            (config as { auth?: { disableRegistration?: boolean } }).auth = {
                disableRegistration: true,
            };
            const service = new UserService(userRepo);
            const result = await service.isUserSignUpAllowed();
            expect(result).toBe("false");
        });
    });

    describe("getProfile", () => {
        it("returns user data from repository when no cache", async () => {
            userRepo.findFullUserByUserId.mockResolvedValue({
                userData: mockUserLike,
                userError: null,
            });
            const service = new UserService(userRepo);
            const result = await service.getProfile(authUserId);
            expect(result).toEqual(mockUserLike);
            expect(userRepo.findFullUserByUserId).toHaveBeenCalledWith(authUserId);
        });

        it("returns null when repository returns no user", async () => {
            userRepo.findFullUserByUserId.mockResolvedValue({
                userData: null,
                userError: {},
            });
            const service = new UserService(userRepo);
            const result = await service.getProfile(authUserId);
            expect(result).toBeNull();
            expect(userRepo.findFullUserByUserId).toHaveBeenCalledWith(authUserId);
        });

        it("uses cache when provided (cache hit)", async () => {
            const getOrSet = jest.fn().mockResolvedValue(mockUserLike);
            const service = new UserService(userRepo, { getOrSet } as never);
            const result = await service.getProfile(authUserId);
            expect(result).toEqual(mockUserLike);
            expect(getOrSet).toHaveBeenCalledWith(
                `user:profile:${authUserId}`,
                expect.any(Function),
                300
            );
            expect(userRepo.findFullUserByUserId).not.toHaveBeenCalled();
        });

        it("calls repository when cache misses and sets USER_BY_EMAIL when user has email", async () => {
            userRepo.findFullUserByUserId.mockResolvedValue({
                userData: mockUserLike,
                userError: null,
            });
            const set = jest.fn().mockResolvedValue(undefined);
            const getOrSet = jest.fn().mockImplementation(async (_key, factory) => factory());
            const cache = { getOrSet, set };
            const service = new UserService(userRepo, cache as never);
            const result = await service.getProfile(authUserId);
            expect(result).toEqual(mockUserLike);
            expect(userRepo.findFullUserByUserId).toHaveBeenCalledWith(authUserId);
            expect(set).toHaveBeenCalledWith(
                `user:email:${email}`,
                mockUserLike,
                300
            );
        });
    });

    describe("getFullUsersWithRoles", () => {
        it("returns users with empty roles when no rbacRepository", async () => {
            userRepo.findAllForAdmin.mockResolvedValue({
                data: [mockAdminRow],
                error: null,
            });
            const service = new UserService(userRepo, undefined, undefined);
            const result = await service.getFullUsersWithRoles();
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({
                id: userId,
                email,
                roles: [],
                isSuperAdmin: false,
                createdAt,
            });
            expect(userRepo.findAllForAdmin).toHaveBeenCalled();
            expect(rbacRepo.getUserRoles).not.toHaveBeenCalled();
        });

        it("returns users with roles from rbacRepository", async () => {
            userRepo.findAllForAdmin.mockResolvedValue({
                data: [mockAdminRow],
                error: null,
            });
            rbacRepo.getUserRoles.mockResolvedValue({ roles: ["editor"] });
            const service = new UserService(userRepo, undefined, rbacRepo);
            const result = await service.getFullUsersWithRoles();
            expect(result).toHaveLength(1);
            expect(result[0].roles).toEqual(["editor"]);
            expect(rbacRepo.getUserRoles).toHaveBeenCalledWith(userId);
        });

        it("returns empty array when repository returns error or empty", async () => {
            userRepo.findAllForAdmin.mockResolvedValue({ data: [], error: new Error("db error") });
            const service = new UserService(userRepo);
            const result = await service.getFullUsersWithRoles();
            expect(result).toEqual([]);
        });

        it("uses cache when provided (cache hit)", async () => {
            const cached = [
                {
                    id: userId,
                    email,
                    roles: ["editor"] as const,
                    isSuperAdmin: false,
                    createdAt,
                },
            ];
            const getOrSet = jest.fn().mockResolvedValue(cached);
            const service = new UserService(userRepo, { getOrSet } as never, rbacRepo);
            const result = await service.getFullUsersWithRoles();
            expect(result).toEqual(cached);
            expect(getOrSet).toHaveBeenCalledWith(
                "user:list:full:with_roles",
                expect.any(Function),
                300
            );
            expect(userRepo.findAllForAdmin).not.toHaveBeenCalled();
        });
    });

    describe("updateProfile", () => {
        it("updates full name and invalidates caches", async () => {
            userRepo.updateFullNameByAuthId.mockResolvedValue({ updateError: null });
            userRepo.findFullUserByUserId.mockResolvedValue({
                userData: { ...mockUserLike, full_name: fullName },
                userError: null,
            });
            const invalidateKey = jest.fn().mockResolvedValue(true);
            const invalidatePattern = jest.fn().mockResolvedValue(true);
            const cacheInvalidator = { invalidateKey, invalidatePattern };
            const service = new UserService(
                userRepo,
                undefined,
                undefined,
                cacheInvalidator as never
            );
            await service.updateProfile(authUserId, { fullName });
            expect(userRepo.updateFullNameByAuthId).toHaveBeenCalledWith(authUserId, fullName);
            expect(userRepo.upsertUserProfileByAuthId).not.toHaveBeenCalled();
            expect(userRepo.findFullUserByUserId).toHaveBeenCalledWith(authUserId);
            expect(invalidateKey).toHaveBeenCalledWith(`user:profile:${authUserId}`);
            expect(invalidateKey).toHaveBeenCalledWith(`user:email:${email}`);
            expect(invalidatePattern).toHaveBeenCalledWith("user:list:*");
            expect(invalidateKey).toHaveBeenCalledWith("blog:published:authors");
        });

        it("invalidates only profile key when user has no email", async () => {
            userRepo.updateFullNameByAuthId.mockResolvedValue({ updateError: null });
            userRepo.findFullUserByUserId.mockResolvedValue({
                userData: { ...mockUserLike, email: null },
                userError: null,
            });
            const invalidateKey = jest.fn().mockResolvedValue(true);
            const invalidatePattern = jest.fn().mockResolvedValue(true);
            const service = new UserService(
                userRepo,
                undefined,
                undefined,
                { invalidateKey, invalidatePattern } as never
            );
            await service.updateProfile(authUserId, { fullName });
            expect(invalidateKey).toHaveBeenCalledWith(`user:profile:${authUserId}`);
            expect(invalidateKey).not.toHaveBeenCalledWith(expect.stringContaining("user:email:"));
            expect(invalidateKey).toHaveBeenCalledWith("blog:published:authors");
        });

        it("throws when repository update returns error", async () => {
            const updateError = new Error("DB update failed");
            userRepo.updateFullNameByAuthId.mockResolvedValue({ updateError });
            const service = new UserService(userRepo);
            await expect(service.updateProfile(authUserId, { fullName })).rejects.toThrow("DB update failed");
        });

        it("does not call cacheInvalidator when not provided", async () => {
            userRepo.updateFullNameByAuthId.mockResolvedValue({ updateError: null });
            userRepo.findFullUserByUserId.mockResolvedValue({
                userData: mockUserLike,
                userError: null,
            });
            const service = new UserService(userRepo);
            await service.updateProfile(authUserId, { fullName });
            expect(userRepo.updateFullNameByAuthId).toHaveBeenCalledWith(authUserId, fullName);
            expect(userRepo.upsertUserProfileByAuthId).not.toHaveBeenCalled();
        });

        it("updates user_profiles when avatarUrl or websiteUrl is provided", async () => {
            userRepo.upsertUserProfileByAuthId.mockResolvedValue({ updateError: null });
            userRepo.findFullUserByUserId.mockResolvedValue({
                userData: mockUserLike,
                userError: null,
            });
            const service = new UserService(userRepo);
            await service.updateProfile(authUserId, {
                avatarUrl: "path/to/avatar.png",
                websiteUrl: "https://example.com",
            });
            expect(userRepo.upsertUserProfileByAuthId).toHaveBeenCalledWith(authUserId, {
                avatar_url: "path/to/avatar.png",
                website_url: "https://example.com",
            });
            expect(userRepo.updateFullNameByAuthId).not.toHaveBeenCalled();
        });
    });
});
