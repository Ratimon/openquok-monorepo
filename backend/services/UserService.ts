import type { UserRepository } from "../repositories/UserRepository";
import type { UserLike } from "../utils/dtos/UserDTO";
import type { RbacRepository } from "../repositories/RbacRepository";
import type { AppRole } from "../data/types/rbacTypes";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";
import { config } from "../config/GlobalConfig";
import { logger } from "../utils/Logger";

export type FullUserWithRolesItem = {
    id: string;
    email: string;
    roles: AppRole[];
    isSuperAdmin: boolean;
    createdAt: string;
};

/** Domain-scoped cache key prefixes; use with identifiers for full keys (e.g. USER_PROFILE:authUserId). */
const CACHE_KEYS = {
    USER: "user",
    USER_PROFILE: "user:profile",
    USER_BY_EMAIL: "user:email",
    USER_LIST_FULL_WITH_ROLES: "user:list:full:with_roles",
};

/** Cache key for published blog authors list (must match BlogService). Invalidated here because the list includes user full_name and user_profiles data. */
const BLOG_PUBLISHED_AUTHORS_KEY = "blog:published:authors";

const USER_CACHE_TTL_SEC = 300;

export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly cache?: CacheService,
        private readonly rbacRepository?: RbacRepository,
        private readonly cacheInvalidator?: CacheInvalidationService
    ) {}

    /** Returns "true" if signup is allowed, or "false". */
    async isUserSignUpAllowed(): Promise<string | boolean> {
        const authConfig = config.auth as { disableRegistration?: boolean } | undefined;
        if (authConfig?.disableRegistration === true) {
            return "false";
        }
        return "true";
    }

    /**
     * Get profile row for the given auth user id (Supabase auth.users.id).
     * Returns null if no user row is found. Controller maps to DTO just before response.
     * Uses cache when cache service is available; optionally cross-references by email.
     */
    async getProfile(authUserId: string): Promise<UserLike | null> {
        const cacheKey = `${CACHE_KEYS.USER_PROFILE}:${authUserId}`;
        const factory = async (): Promise<UserLike | null> => {
            const { userData } = await this.userRepository.findFullUserByUserId(authUserId);
            if (this.cache && userData?.email) {
                await this.cache.set(`${CACHE_KEYS.USER_BY_EMAIL}:${userData.email}`, userData, USER_CACHE_TTL_SEC);
            }
            return userData ?? null;
        };
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, USER_CACHE_TTL_SEC);
        }
        return factory();
    }

    /**
     * Get all users with roles (for admin role manager). Super-admin only.
     * Uses cache when cache service is available (invalidated on user/role changes via USER:list:*).
     */
    async getFullUsersWithRoles(): Promise<FullUserWithRolesItem[]> {
        const cacheKey = CACHE_KEYS.USER_LIST_FULL_WITH_ROLES;
        const factory = async (): Promise<FullUserWithRolesItem[]> => {
            logger.debug({ msg: "Getting full users with roles", cacheKey });
            const { data: users, error } = await this.userRepository.findAllForAdmin();
            if (error || !users?.length) {
                return [];
            }
            if (!this.rbacRepository) {
                return users.map((u) => ({
                    id: u.id,
                    email: u.email ?? "",
                    roles: [],
                    isSuperAdmin: u.is_super_admin,
                    createdAt: u.created_at,
                }));
            }
            const withRoles: FullUserWithRolesItem[] = [];
            for (const u of users) {
                const { roles } = await this.rbacRepository.getUserRoles(u.id);
                withRoles.push({
                    id: u.id,
                    email: u.email ?? "",
                    roles,
                    isSuperAdmin: u.is_super_admin,
                    createdAt: u.created_at,
                });
            }
            return withRoles;
        };
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, USER_CACHE_TTL_SEC);
        }
        return factory();
    }

    /**
     * Update profile fields for the authenticated user (users.full_name and/or user_profiles).
     * Invalidates related caches.
     */
    async updateProfile(
        authUserId: string,
        updates: {
            fullName?: string;
            avatarUrl?: string | null;
            websiteUrl?: string | null | "";
        }
    ): Promise<void> {
        if (updates.fullName !== undefined) {
            const { updateError } = await this.userRepository.updateFullNameByAuthId(authUserId, updates.fullName);
            if (updateError) {
                throw updateError as Error;
            }
        }

        if (updates.avatarUrl !== undefined || updates.websiteUrl !== undefined) {
            const fields: { avatar_url?: string | null; website_url?: string | null } = {};
            if (updates.avatarUrl !== undefined) {
                fields.avatar_url = updates.avatarUrl;
            }
            if (updates.websiteUrl !== undefined) {
                const w = updates.websiteUrl;
                fields.website_url = w === "" || w === null ? null : w;
            }
            const { updateError } = await this.userRepository.upsertUserProfileByAuthId(authUserId, fields);
            if (updateError) {
                throw updateError as Error;
            }
        }

        const { userData } = await this.userRepository.findFullUserByUserId(authUserId);
        await this._invalidateUserRelatedCaches({
            authUserId,
            userEmail: userData?.email ?? undefined,
        });
    }

    /**
     * Call after email verification is persisted (e.g. verify-signup) so GET /users/me is not stale.
     */
    async invalidateCachesAfterEmailVerification(authUserId: string, userEmail: string | null): Promise<void> {
        await this._invalidateUserRelatedCaches({
            authUserId,
            userEmail: userEmail ?? undefined,
        });
    }

    /**
     * Invalidate cache entries that may be stale after a user mutation.
     * Uses same invalidate pattern as other services (CacheInvalidationService).
     * Logs errors and does not throw so the request is not failed by cache issues.
     */
    private async _invalidateUserRelatedCaches(params: {
        authUserId: string;
        userEmail?: string | null;
    }): Promise<void> {
        if (!this.cacheInvalidator) return;
        const { authUserId, userEmail } = params;
        try {
            await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS.USER_PROFILE}:${authUserId}`);
            if (userEmail) {
                await this.cacheInvalidator.invalidateKey(`${CACHE_KEYS.USER_BY_EMAIL}:${userEmail}`);
            }
            await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.USER}:list:*`);
            await this.cacheInvalidator.invalidateKey(BLOG_PUBLISHED_AUTHORS_KEY);
            logger.debug({ msg: "Invalidated user related caches", authUserId });
        } catch (error) {
            logger.error({ msg: "Error invalidating user related caches", authUserId, error: String(error) });
        }
    }
}
