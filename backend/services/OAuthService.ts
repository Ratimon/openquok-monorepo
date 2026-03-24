import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRepository } from "../repositories/UserRepository";
import type { UserService } from "./UserService";
import type { OrganizationService } from "./OrganizationService";
import { getOAuthProvider } from "../connections/oauth/providers";
import type { OAuthProviderName } from "../connections/oauth/types";
import { config } from "../config/GlobalConfig";
import { AuthError } from "../errors/AuthError";
import { logger } from "../utils/Logger";

const serverConfig = config.server as { frontendDomainUrl?: string };
const authConfig = config.auth as { disableRegistration?: boolean } | undefined;

export class OAuthService {
    constructor(
        private readonly supabaseAdmin: SupabaseClient,
        private readonly userRepository: UserRepository,
        private readonly userService: UserService,
        private readonly organizationService: OrganizationService
    ) {}

    /**
     * Return the redirect URL for the given provider (for sign-in/sign-up).
     */
    getRedirectUrl(provider: OAuthProviderName, state?: string): string {
        const p = getOAuthProvider(provider);
        return p.getRedirectUrl(state);
    }

    /**
     * Exchange code for profile, then find or create user and return a magic link URL
     * so the client can complete the session. Redirect the user to that URL.
     */
    async handleCallback(
        provider: OAuthProviderName,
        code: string
    ): Promise<{ redirectTo: string }> {
        const p = getOAuthProvider(provider);
        const profile = await p.exchangeCodeForProfile(code);

        const existingByProvider = await this.userRepository.findUserByProvider(
            provider,
            profile.id
        );
        if (existingByProvider.userData) {
            const magic = await this.generateMagicLinkForAuthId(
                existingByProvider.userData.auth_id!,
                existingByProvider.userData.email!
            );
            return { redirectTo: magic };
        }

        const existingByEmail = await this.userRepository.findFullUserByEmail(profile.email);
        if (existingByEmail.userData) {
            await this.userRepository.updateUserProvider(
                existingByEmail.userData.id,
                provider,
                profile.id
            ).catch(() => {});
            const magic = await this.generateMagicLinkForAuthId(
                existingByEmail.userData.auth_id!,
                existingByEmail.userData.email!
            );
            return { redirectTo: magic };
        }

        const allowSignups = await this.userService.isUserSignUpAllowed();
        if (!allowSignups || allowSignups !== "true") {
            throw new AuthError("Registration is disabled", 403);
        }
        if (authConfig?.disableRegistration) {
            throw new AuthError("Registration is disabled", 403);
        }

        const { data: createData, error: createError } = await this.supabaseAdmin.auth.admin.createUser({
            email: profile.email,
            email_confirm: true,
            user_metadata: {
                full_name: profile.fullName ?? profile.email,
                provider,
                provider_id: profile.id,
            },
        });

        if (createError) {
            if (
                createError.message?.includes("already") ||
                (createError as { code?: string }).code === "user_already_exists"
            ) {
                const byEmail = await this.userRepository.findFullUserByEmail(profile.email);
                if (byEmail.userData?.auth_id) {
                    const magic = await this.generateMagicLinkForAuthId(
                        byEmail.userData.auth_id,
                        profile.email
                    );
                    return { redirectTo: magic };
                }
            }
            logger.error({
                msg: "OAuth: Supabase createUser failed",
                provider,
                email: profile.email,
                error: createError.message,
            });
            throw new AuthError(`Could not create account: ${createError.message}`, 400);
        }

        const authUserId = createData.user?.id;
        if (!authUserId) {
            throw new AuthError("Could not create account", 500);
        }

        const { error: upsertError } = await this.userRepository.upsertUserFromOAuth({
            id: authUserId,
            authId: authUserId,
            email: profile.email,
            fullName: profile.fullName ?? profile.email,
            provider,
            providerId: profile.id,
        });
        if (upsertError) {
            logger.error({
                msg: "OAuth: upsertUserFromOAuth failed",
                authUserId,
                error: String(upsertError),
            });
            throw new AuthError("Failed to create user record", 500);
        }

        // Create default organization for new user (createOrgAndUser-style)
        const defaultOrg = await this.organizationService.createDefaultOrganizationForNewUser(authUserId, {
            name: profile.fullName ?? "My Organization",
        });
        if (!defaultOrg) {
            logger.warn({ msg: "OAuth: default organization creation failed for new user", authUserId });
        }

        const magic = await this.generateMagicLinkForAuthId(authUserId, profile.email);
        return { redirectTo: magic };
    }

    private async generateMagicLinkForAuthId(
        authId: string,
        email: string
    ): Promise<string> {
        const frontendUrl = (serverConfig?.frontendDomainUrl ?? "").replace(/\/$/, "");
        const redirectTo = `${frontendUrl}/auth/callback`;

        const { data, error } = await this.supabaseAdmin.auth.admin.generateLink({
            type: "magiclink",
            email,
            options: {
                redirectTo,
            },
        });

        if (error || !data?.properties) {
            logger.error({
                msg: "OAuth: generateLink failed",
                email,
                error: error?.message ?? "no properties",
            });
            throw new AuthError("Could not complete sign-in", 500);
        }

        const props = data.properties as { action_link?: string; hashed_token?: string };
        if (props.action_link) return props.action_link;

        const supabaseUrl = (config.supabase as { supabaseUrl?: string }).supabaseUrl?.replace(
            /\/$/,
            ""
        );
        return `${supabaseUrl}/auth/v1/verify?token=${props.hashed_token}&type=magiclink&redirect_to=${encodeURIComponent(redirectTo)}`;
    }
}
