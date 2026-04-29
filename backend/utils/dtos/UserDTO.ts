/**
 * User profile DTO for GET /users/me and other user read APIs.
 */
/** Narrow fragment embedded from user_profiles on scalar user selects. */
export type UserProfilesEmbeddedLike = {
    avatar_url?: string | null;
    website_url?: string | null;
};

/** Full `public.users` row with optional embedded profile(s). */
export type UserLike = {
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
    user_profiles?: UserProfilesEmbeddedLike | UserProfilesEmbeddedLike[] | null;
};

/** Row shape for admin list (users with roles). */
export type UserAdminLike = {
    id: string;
    email: string | null;
    created_at: string;
    is_super_admin: boolean;
};

export interface UserDTO {
    id: string;
    email: string | null;
    fullName: string | null;
    /**
     * Human-facing identifier used by the frontend as "username".
     * We currently treat this as the user's email (no dedicated username field in DB yet).
     */
    username: string | null;
    isEmailVerified: boolean;
    /** Storage path in avatars bucket, or null. */
    avatarUrl: string | null;
    /** Public website URL from user_profiles.website_url. */
    websiteUrl: string | null;
}

export type UserProfilesJoinLike =
    | UserProfilesEmbeddedLike
    | UserProfilesEmbeddedLike[]
    | null
    | undefined;

export interface UserRowLike {
    id: string;
    auth_id?: string | null;
    email: string | null;
    full_name: string | null;
    is_email_verified?: boolean | null;
    user_profiles?: UserProfilesJoinLike;
}

function pickProfileFields(row: UserRowLike | null): { avatarUrl: string | null; websiteUrl: string | null } {
    if (!row?.user_profiles) {
        return { avatarUrl: null, websiteUrl: null };
    }
    const raw = row.user_profiles;
    const p = Array.isArray(raw) ? raw[0] : raw;
    if (!p || typeof p !== "object") {
        return { avatarUrl: null, websiteUrl: null };
    }
    return {
        avatarUrl: (p as { avatar_url?: string | null }).avatar_url ?? null,
        websiteUrl: (p as { website_url?: string | null }).website_url ?? null,
    };
}

export function toUserDTO(row: UserRowLike | null): UserDTO | null {
    if (!row) return null;
    const { avatarUrl, websiteUrl } = pickProfileFields(row);
    return {
        id: row.id,
        email: row.email ?? null,
        fullName: row.full_name ?? null,
        username: row.email ?? null,
        isEmailVerified: row.is_email_verified === true,
        avatarUrl,
        websiteUrl,
    };
}
