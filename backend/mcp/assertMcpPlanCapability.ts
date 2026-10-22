import { SubscriptionSection } from "openquok-common";

import type { SubscriptionGuardService } from "../guards/subscription/SubscriptionGuardService";
import { getMcpContext } from "./context";

/** Enforce a workspace plan capability for the active MCP request (after programmatic auth). */
export async function assertMcpPlanCapability(
    subscriptionGuard: SubscriptionGuardService,
    section: SubscriptionSection
): Promise<void> {
    const { organizationId, publicUserId } = getMcpContext();
    await subscriptionGuard.assert(section, {
        scope: "workspace",
        organizationId,
        publicUserId,
    });
}

export async function assertMcpDirectoryLaunchEnabled(
    subscriptionGuard: SubscriptionGuardService
): Promise<void> {
    await assertMcpPlanCapability(subscriptionGuard, SubscriptionSection.DIRECTORY_LAUNCH_ENABLED);
}

export async function assertMcpDirectorySeoEnabled(
    subscriptionGuard: SubscriptionGuardService
): Promise<void> {
    await assertMcpPlanCapability(subscriptionGuard, SubscriptionSection.DIRECTORY_SEO_ENABLED);
}
