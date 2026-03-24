/**
 * User profile DTO for GET /users/me and other user read APIs.
 */
export interface UserDTO {
    id: string;
    email: string | null;
    fullName: string | null;
    isEmailVerified: boolean;
    /** Storage path in avatars bucket, or null. */
    avatarUrl: string | null;
    /** Public website URL from user_profiles.website_url. */
    websiteUrl: string | null;
}

export type UserProfilesJoinLike =
    | { avatar_url?: string | null; website_url?: string | null }
    | Array<{ avatar_url?: string | null; website_url?: string | null }>
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
        isEmailVerified: row.is_email_verified === true,
        avatarUrl,
        websiteUrl,
    };
}
