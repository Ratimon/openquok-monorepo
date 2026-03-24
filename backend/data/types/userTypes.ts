/**
 * User API types.
 */
export type UserProfileResponse = {
    id: string;
    email: string | null;
    fullName: string | null;
    isEmailVerified: boolean;
};
