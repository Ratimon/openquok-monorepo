import type { AuthTokenDetails } from "backend/integrations/social.integrations.interface.js";
import type { IntegrationRepository } from "backend/repositories/IntegrationRepository.js";
import type { IntegrationLike } from "backend/utils/dtos/IntegrationDTO.js";

/** Matches `createFlow` id; used as BullMQ `blueprintId`. */
export const REFRESH_TOKEN_BLUEPRINT_ID = "refresh-token";

/** Bump when the refresh-token graph changes so distributed workers reject mismatched runs. */
export const REFRESH_TOKEN_BLUEPRINT_VERSION = "1.0.0";

/** Repository + refresh callback injected into Flowcraft runtime and BullMQ worker (node `dependencies`). */
export type RefreshTokenWorkflowDependencies = {
    integrationRepository: Pick<IntegrationRepository, "getById">;
    runRefresh: (row: IntegrationLike) => Promise<false | AuthTokenDetails>;
};

export type RefreshTokenFlowContext = {
    integrationId: string;
    organizationId: string;
    loopShouldContinue: boolean;
};
