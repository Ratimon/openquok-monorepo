/** Supported OAuth provider names (lowercase for routes). */
export type OAuthProviderName = "google" | "github" | "generic";

/** Profile returned by an OAuth provider after exchanging the code. */
export interface OAuthProfile {
    id: string;
    email: string;
    fullName?: string;
}

/** Interface for OAuth provider implementations. */
export interface IOAuthProvider {
    readonly name: OAuthProviderName;
    /** Build the authorization URL to redirect the user to. */
    getRedirectUrl(state?: string): string;
    /** Exchange authorization code for access token and fetch user profile. */
    exchangeCodeForProfile(code: string): Promise<OAuthProfile>;
}
