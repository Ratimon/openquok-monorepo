import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserAdminLike, UserLike } from "../utils/dtos/UserDTO";
import { DatabaseError } from "../errors/InfraError";
import { logger } from "../utils/Logger";

const TABLE_NAME = "users";

/** Columns that exist on public.users in all environments (no OAuth columns). Use for backward compatibility when provider/provider_id may not exist. */
const CORE_USER_SELECT =
    "id, auth_id, email, full_name, is_email_verified, email_verification_token, email_verification_token_expires, created_at, updated_at";

/** Same as CORE_USER_SELECT plus one-to-one user_profiles (avatar, website). */
const USER_WITH_PROFILE_SELECT = `${CORE_USER_SELECT}, user_profiles(avatar_url, website_url)`;

const ADMIN_USER_SELECT = "id, email, created_at, is_super_admin";

// const FULL_USER_SELECT =
//     "id, auth_id, email, full_name, is_email_verified, email_verification_token, email_verification_token_expires, provider, provider_id, created_at, updated_at";

export class UserRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async findFullUserByUserId(userId: string): Promise<{ userData: UserLike | null; userError: unknown }> {
        const { data: userData, error: userError } = await this.supabase
            .from(TABLE_NAME)
            .select(USER_WITH_PROFILE_SELECT)
            .eq("auth_id", userId)
            .single();

        return { userData: userData as UserLike | null, userError };
    }

    /**
     * Insert or update public.user_profiles for the user identified by auth.users id.
     * Only keys present in `fields` are written (partial update when row exists).
     */
    async upsertUserProfileByAuthId(
        authId: string,
        fields: { avatar_url?: string | null; website_url?: string | null }
    ): Promise<{ updateError: unknown }> {
        const { userId, error: resolveError } = await this.findUserIdByAuthId(authId);
        if (resolveError || !userId) {
            return { updateError: resolveError ?? new Error("User not found") };
        }

        const updatedAt = new Date().toISOString();
        const payload: { avatar_url?: string | null; website_url?: string | null; updated_at: string } = {
            updated_at: updatedAt,
        };
        if (fields.avatar_url !== undefined) {
            payload.avatar_url = fields.avatar_url;
        }
        if (fields.website_url !== undefined) {
            payload.website_url = fields.website_url;
        }

        const { data: existing } = await this.supabase
            .from("user_profiles")
            .select("id")
            .eq("owner_id", userId)
            .maybeSingle();

        if (existing) {
            const { error: updateError } = await this.supabase
                .from("user_profiles")
                .update(payload)
                .eq("owner_id", userId);
            return { updateError };
        }

        const { error: insertError } = await this.supabase.from("user_profiles").insert({
            owner_id: userId,
            avatar_url: fields.avatar_url ?? null,
            website_url: fields.website_url ?? null,
            updated_at: updatedAt,
        });
        return { updateError: insertError };
    }

    /** Resolve auth user id (Supabase auth.uid()) to public.users.id.
     *  Uses a SECURITY DEFINER RPC function to bypass RLS. */
    async findUserIdByAuthId(authId: string): Promise<{ userId: string | null; error: unknown }> {
        const { data, error } = await this.supabase.rpc("internal_find_user_id_by_auth_id" as never, {
            p_auth_id: authId,
        } as never);
        if (error) {
            throw new DatabaseError("Failed to resolve user by auth id", {
                cause: error as unknown as Error,
                operation: "findUserIdByAuthId",
                resource: { type: "table", name: TABLE_NAME },
            });
        }
        return { userId: (data as string) ?? null, error: null };
    }

    /** Find user by email with all core columns.
     *  Uses a SECURITY DEFINER RPC function to bypass RLS. */
    async findFullUserByEmail(email: string): Promise<{ userData: UserLike | null }> {
        const { data, error } = await this.supabase.rpc("internal_find_full_user_by_email" as never, {
            p_email: email,
        } as never);

        if (error) {
            throw new DatabaseError("Database error during email lookup", {
                cause: error as unknown as Error,
                operation: "findByEmail",
                resource: { type: "table", name: TABLE_NAME },
            });
        }
        const rows = data as UserLike[] | null;
        return { userData: rows && rows.length > 0 ? rows[0] : null };
    }

    /**
     * Find all users for admin list (id, email, created_at, is_super_admin).
     * Used with RbacRepository.getUserRoles to build full users with roles.
     */
    async findAllForAdmin(): Promise<{ data: UserAdminLike[]; error: unknown }> {
        const { data, error } = await this.supabase
            .from(TABLE_NAME)
            .select(ADMIN_USER_SELECT)
            .order("created_at", { ascending: false });

        return { data: (data ?? []) as UserAdminLike[], error };
    }

    async checkIfEmailVerified(email: string): Promise<boolean> {
        const normalizedEmail = email.trim().toLowerCase();
        const { data, error } = await this.supabase
            .from(TABLE_NAME)
            .select("is_email_verified")
            .eq("email", normalizedEmail)
            .single();

        if (error) {
            if (error.code === "PGRST116" || error.code === "42P01" || error.code === "PGRST205") {
                return false;
            }
            logger.warn({
                msg: "checkIfEmailVerified: treating error as not verified",
                code: (error as { code?: string }).code,
                details: (error as { details?: string }).details,
            });
            return false;
        }
        return data?.is_email_verified === true;
    }

    /** Mark user email as verified/unverified.
     *  Uses a SECURITY DEFINER RPC function to bypass RLS. */
    async updateEmailVerification(userId: string, isEmailVerified: boolean): Promise<{ updateError: unknown }> {
        const { error: updateError } = await this.supabase.rpc("internal_update_email_verification" as never, {
            p_user_id: userId,
            p_is_verified: isEmailVerified,
        } as never);
        return { updateError };
    }

    /** Find users by hashed verification token (non-expired).
     *  Uses a SECURITY DEFINER RPC function to bypass RLS. */
    async findUserByTokenHash(hashedToken: string): Promise<{ userData: UserLike[]; userError: unknown }> {
        const { data, error: userError } = await this.supabase.rpc("internal_find_user_by_token_hash" as never, {
            p_hashed_token: hashedToken,
        } as never);

        return { userData: (data ?? []) as UserLike[], userError };
    }

    /** Set or clear email verification token for a user (by user id).
     *  Uses a SECURITY DEFINER RPC function to bypass RLS. */
    async updateVerificationToken(
        userId: string,
        hashedToken: string | null,
        expiresAt: Date | null
    ): Promise<{ updateError: unknown; rowsAffected: number }> {
        const { data, error: updateError } = await this.supabase.rpc("internal_set_verification_token" as never, {
            p_user_id: userId,
            p_token: hashedToken,
            p_expires: expiresAt?.toISOString() ?? null,
        } as never);
        return { updateError, rowsAffected: typeof data === "number" ? data : 0 };
    }

    /** Set verification token for a user by email (e.g. after signup). */
    async updateVerificationTokenByEmail(
        email: string,
        hashedToken: string,
        expiresAt: Date
    ): Promise<{ updateError: unknown }> {
        const normalizedEmail = email.trim().toLowerCase();
        const { error: updateError } = await this.supabase
            .from(TABLE_NAME)
            .update({
                email_verification_token: hashedToken,
                email_verification_token_expires: expiresAt.toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("email", normalizedEmail);
        return { updateError };
    }

    /**
     * Ensure a row exists in public.users for the given auth user (e.g. when DB trigger is not present).
     * Uses a SECURITY DEFINER RPC function to bypass RLS.
     */
    async upsertUserFromAuth(params: {
        id: string;
        authId: string;
        email: string | null;
        fullName: string;
    }): Promise<{ error: unknown }> {
        const { error } = await this.supabase.rpc("internal_upsert_user_from_auth" as never, {
            p_id: params.id,
            p_auth_id: params.authId,
            p_email: params.email,
            p_full_name: params.fullName,
        } as never);
        return { error };
    }

    /** Update full_name for the user with the given auth_id. */
    async updateFullNameByAuthId(authId: string, fullName: string): Promise<{ updateError: unknown }> {
        const { error: updateError } = await this.supabase
            .from(TABLE_NAME)
            .update({
                full_name: fullName,
                updated_at: new Date().toISOString(),
            })
            .eq("auth_id", authId);
        return { updateError };
    }

    /** Link an existing user (by id) to an OAuth provider. */
    async updateUserProvider(
        userId: string,
        provider: string,
        providerId: string
    ): Promise<{ updateError: unknown }> {
        const { error: updateError } = await this.supabase
            .from(TABLE_NAME)
            .update({
                provider,
                provider_id: providerId,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        return { updateError };
    }
    async findUserByProvider(provider: string, providerId: string): Promise<{ userData: UserLike | null }> {
        const { data: userData, error } = await this.supabase
            .from(TABLE_NAME)
            .select(CORE_USER_SELECT)
            .eq("provider", provider)
            .eq("provider_id", providerId)
            .single();

        if (error && error.code !== "PGRST116") {
            throw new DatabaseError("Database error during provider lookup", {
                cause: error as unknown as Error,
                operation: "findByProvider",
                resource: { type: "table", name: TABLE_NAME },
            });
        }
        return { userData: userData as UserLike | null };
    }

    /**
     * Insert or update public.users for an OAuth user (after Supabase auth user is created).
     */
    async upsertUserFromOAuth(params: {
        id: string;
        authId: string;
        email: string;
        fullName: string;
        provider: string;
        providerId: string;
    }): Promise<{ error: unknown }> {
        const { error } = await this.supabase.from(TABLE_NAME).upsert(
            {
                id: params.id,
                auth_id: params.authId,
                email: params.email,
                full_name: params.fullName,
                is_email_verified: true,
                provider: params.provider,
                provider_id: params.providerId,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
        );
        return { error };
    }

    /** Last-read cursor for in-app notification badges (public.users.id). */
    async getLastReadNotifications(userId: string): Promise<{ lastReadNotifications: string } | null> {
        const { data, error } = await this.supabase
            .from(TABLE_NAME)
            .select("last_read_notifications")
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Failed to load notification read cursor", {
                cause: error as unknown as Error,
                operation: "getLastReadNotifications",
                resource: { type: "table", name: TABLE_NAME },
            });
        }
        if (!data?.last_read_notifications) return null;
        return { lastReadNotifications: data.last_read_notifications as string };
    }

    /**
     * Advance last_read_notifications to now; returns the previous value for listing deltas.
     */
    async advanceLastReadNotifications(userId: string): Promise<{ previousLastRead: string | null }> {
        const prior = await this.getLastReadNotifications(userId);
        const now = new Date().toISOString();
        const { error } = await this.supabase
            .from(TABLE_NAME)
            .update({ last_read_notifications: now, updated_at: now })
            .eq("id", userId);
        if (error) {
            throw new DatabaseError("Failed to update notification read cursor", {
                cause: error as unknown as Error,
                operation: "advanceLastReadNotifications",
                resource: { type: "table", name: TABLE_NAME },
            });
        }
        return { previousLastRead: prior?.lastReadNotifications ?? null };
    }

}
