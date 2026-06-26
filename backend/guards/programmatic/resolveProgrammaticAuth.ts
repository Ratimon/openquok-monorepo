import { SubscriptionSection } from "openquok-common";
import type { OrganizationRepository } from "../../repositories/OrganizationRepository";
import type { OauthAppService } from "../../services/OauthAppService";
import type { SubscriptionGuardService } from "../subscription/SubscriptionGuardService";
import type { OrganizationLike } from "../../utils/dtos/OrganizationDTO";

export type ProgrammaticAuthResult = {
    organization: OrganizationLike;
    oauthApp: { id: string; tokenId: string };
};

/**
 * Resolves an `opo_…` programmatic token to a workspace and OAuth app context.
 * Enforces the workspace `public_api` plan capability (platform admins bypass via token owner).
 */
export async function resolveProgrammaticAuth(
    token: string,
    deps: {
        oauthAppService: OauthAppService;
        organizationRepository: OrganizationRepository;
        subscriptionGuard: SubscriptionGuardService;
    }
): Promise<ProgrammaticAuthResult | null> {
    const trimmed = token.trim();
    if (!trimmed) return null;

    const verified = await deps.oauthAppService.verifyProgrammaticToken(trimmed);
    if (!verified) return null;

    const { organization } = await deps.organizationRepository.findOrganizationById(verified.organizationId);
    if (!organization) return null;

    await deps.subscriptionGuard.assert(SubscriptionSection.PUBLIC_API, {
        scope: "workspace",
        organizationId: organization.id,
        publicUserId: verified.userId,
    });

    return {
        organization,
        oauthApp: { id: verified.oauthAppId, tokenId: verified.tokenId },
    };
}
