import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { OauthAppService } from "../services/OauthAppService";
import type { SubscriptionGuardService } from "../guards/subscription/SubscriptionGuardService";
import { resolveProgrammaticAuth } from "../guards/programmatic/resolveProgrammaticAuth";

export type McpAuthDeps = {
    oauthAppService: OauthAppService;
    organizationRepository: OrganizationRepository;
    subscriptionGuard: SubscriptionGuardService;
};

export type McpAuthContext = {
    organizationId: string;
    tokenId: string;
    /** Token owner `public.users.id` for platform-admin billing bypass. */
    publicUserId: string;
};

export async function resolveMcpAuth(token: string, deps: McpAuthDeps): Promise<McpAuthContext | null> {
    const resolved = await resolveProgrammaticAuth(token, deps);
    if (!resolved) return null;
    return {
        organizationId: resolved.organization.id,
        tokenId: resolved.oauthApp.tokenId,
        publicUserId: resolved.publicUserId,
    };
}
