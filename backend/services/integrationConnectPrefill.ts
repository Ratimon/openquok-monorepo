import type { IntegrationManager } from "../integrations/integrationManager";
import type { ConnectPrefillResult } from "../integrations/social.integrations.interface";

import { AppError } from "../errors/AppError";

export async function runConnectPrefill(
    manager: Pick<IntegrationManager, "getAllowedSocialsIntegrations" | "getSocialIntegration">,
    providerIdentifier: string,
    field: string,
    value: string
): Promise<ConnectPrefillResult> {
    if (!manager.getAllowedSocialsIntegrations().includes(providerIdentifier)) {
        throw new AppError("Integration not allowed", 400);
    }

    const provider = manager.getSocialIntegration(providerIdentifier);
    if (!provider?.connectPrefill) {
        throw new AppError("Connect prefill is not supported for this channel", 400);
    }

    try {
        return await provider.connectPrefill({ field, value });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Connect prefill failed";
        throw new AppError(msg, 400);
    }
}
