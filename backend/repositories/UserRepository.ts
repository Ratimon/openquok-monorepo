import type { SupabaseClient } from "@supabase/supabase-js";
import { DatabaseError } from "../errors/InfraError";
import { logger } from "../utils/Logger";

const TABLE_NAME = "users";

export type UserProfilesJoinRow = {
    avatar_url?: string | null;
    website_url?: string | null;
};

/** Row from users with optional embedded user_profiles (1:1). */
export type UserRow = {
    id: string;
    auth_id: string | null;
    email: string | null;
    full_name: string | null;
    is_email_verified: boolean | null;
    email_verification_token?: string | null;
    email_verification_token_expires?: string | null;
    provider?: string | null;
    provider_id?: string | null;
    created_at: string;
    updated_at: string;
    user_profiles?: UserProfilesJoinRow | UserProfilesJoinRow[] | null;
};

/** Columns that exist on public.users in all environments (no OAuth columns). Use for backward compatibility when provider/provider_id may not exist. */
const CORE_USER_SELECT =
    "id, auth_id, email, full_name, is_email_verified, email_verification_token, email_verification_token_expires, created_at, updated_at";

/** Same as CORE_USER_SELECT plus one-to-one user_profiles (avatar, website). */
const USER_WITH_PROFILE_SELECT = `${CORE_USER_SELECT}, user_profiles(avatar_url, website_url)`;

/** Row shape for admin list (users with roles). */
export type UserAdminRow = {
    id: string;
    email: string | null;
    created_at: string;
    is_super_admin: boolean;
};

const ADMIN_USER_SELECT = "id, email, created_at, is_super_admin";

// const FULL_USER_SELECT =
//     "id, auth_id, email, full_name, is_email_verified, email_verification_token, email_verification_token_expires, provider, provider_id, created_at, updated_at";

export class UserRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async findFullUserByUserId(userId: string): Promise<{ userData: UserRow | null; userError: unknown }> {
        const { data: userData, error: userError } = await this.supabase
            .from(TABLE_NAME)
            .select(USER_WITH_PROFILE_SELECT)
            .eq("auth_id", userId)
            .single();

        return { userData: userData as UserRow | null, userError };
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

    /** Resolve auth user id (Supabase auth.uid()) to public.users.id. */
    async findUserIdByAuthId(authId: string): Promise<{ userId: string | null; error: unknown }> {
        const { data, error } = await this.supabase
            .from(TABLE_NAME)
            .select("id")
            .eq("auth_id", authId)
            .single();
        if (error && error.code !== "PGRST116") {
            throw new DatabaseError("Failed to resolve user by auth id", {
                cause: error as unknown as Error,
                operation: "findUserIdByAuthId",
                resource: { type: "table", name: TABLE_NAME },
            });
        }
        return { userId: (data as { id: string } | null)?.id ?? null, error };
    }

    async findFullUserByEmail(email: string): Promise<{ userData: UserRow | null }> {
        const normalizedEmail = email.trim().toLowerCase();
        const { data: userData, error } = await this.supabase
            .from(TABLE_NAME)
            .select(CORE_USER_SELECT)
            .eq("email", normalizedEmail)
            .single();

        if (error && error.code !== "PGRST116") {
            throw new DatabaseError("Database error during email lookup", {
                cause: error as unknown as Error,
                operation: "findByEmail",
                resource: { type: "table", name: TABLE_NAME },
            });
        }
        return { userData: userData as UserRow | null };
    }

    /**
     * Find all users for admin list (id, email, created_at, is_super_admin).
     * Used with RbacRepository.getUserRoles to build full users with roles.
     */
    async findAllForAdmin(): Promise<{ data: UserAdminRow[]; error: unknown }> {
        const { data, error } = await this.supabase
            .from(TABLE_NAME)
            .select(ADMIN_USER_SELECT)
            .order("created_at", { ascending: false });

        return { data: (data ?? []) as UserAdminRow[], error };
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

    async updateEmailVerification(userId: string, isEmailVerified: boolean): Promise<{ updateError: unknown }> {
        const { error: updateError } = await this.supabase
            .from(TABLE_NAME)
            .update({
                is_email_verified: isEmailVerified,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        return { updateError };
    }

    /** Find users by hashed verification token (non-expired). */
    async findUserByTokenHash(hashedToken: string): Promise<{ userData: UserRow[]; userError: unknown }> {
        const expiresNow = new Date().toISOString();
        const { data: userData, error: userError } = await this.supabase
            .from(TABLE_NAME)
            .select(CORE_USER_SELECT)
            .eq("email_verification_token", hashedToken)
            .gt("email_verification_token_expires", expiresNow);

        return { userData: (userData ?? []) as UserRow[], userError };
    }

    /** Set or clear email verification token for a user (by user id). */
    async updateVerificationToken(
        userId: string,
        hashedToken: string | null,
        expiresAt: Date | null
    ): Promise<{ updateError: unknown }> {
        const { error: updateError } = await this.supabase
            .from(TABLE_NAME)
            .update({
                email_verification_token: hashedToken,
                email_verification_token_expires: expiresAt?.toISOString() ?? null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId);
        return { updateError };
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
     * Inserts or updates by id so verification token can be stored later.
     */
    async upsertUserFromAuth(params: {
        id: string;
        authId: string;
        email: string | null;
        fullName: string;
    }): Promise<{ error: unknown }> {
        const { error } = await this.supabase.from(TABLE_NAME).upsert(
            {
                id: params.id,
                auth_id: params.authId,
                email: params.email,
                full_name: params.fullName,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
        );
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
    async findUserByProvider(provider: string, providerId: string): Promise<{ userData: UserRow | null }> {
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
        return { userData: userData as UserRow | null };
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

}
