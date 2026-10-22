import { Router } from "express";
import { SubscriptionSection } from "openquok-common";

import { publicDirectorySeoController } from "../../controllers/index";
import { organizationRepository } from "../../repositories/index";
import { requireProgrammaticAuth, requireProgrammaticPlanCapability } from "../../guards";
import { oauthAppService, subscriptionGuard } from "../../services/index";
import {
    validatePublicDirectorySeoAddCompetitorRequest,
    validatePublicDirectorySeoDeleteCompetitorRequest,
    validatePublicDirectorySeoRefreshRequest,
    validatePublicDirectorySeoUpdateCompetitorRequest,
    validatePublicDirectorySeoWorkspaceHistoryQuery,
    validatePublicDirectorySeoWorkspaceQuery,
} from "../../data/schemas/publicDirectorySeoSchemas";

type PublicDirectorySeoRouter = ReturnType<typeof Router>;

/**
 * Programmatic directory SEO API under `/public/directory-seo/*`.
 */
const publicDirectorySeoRouter: PublicDirectorySeoRouter = Router();
const apiKeyAuth = requireProgrammaticAuth({ oauthAppService, organizationRepository, subscriptionGuard });
const directorySeoPlan = requireProgrammaticPlanCapability(SubscriptionSection.DIRECTORY_SEO_ENABLED);

publicDirectorySeoRouter.get(
    "/workspace/overview",
    apiKeyAuth,
    directorySeoPlan,
    validatePublicDirectorySeoWorkspaceQuery,
    publicDirectorySeoController.getWorkspaceOverview
);
publicDirectorySeoRouter.get(
    "/workspace/history",
    apiKeyAuth,
    directorySeoPlan,
    validatePublicDirectorySeoWorkspaceHistoryQuery,
    publicDirectorySeoController.getWorkspaceHistory
);
publicDirectorySeoRouter.post(
    "/workspace/competitors",
    apiKeyAuth,
    directorySeoPlan,
    validatePublicDirectorySeoAddCompetitorRequest,
    publicDirectorySeoController.addCompetitor
);
publicDirectorySeoRouter.delete(
    "/workspace/competitors",
    apiKeyAuth,
    directorySeoPlan,
    validatePublicDirectorySeoDeleteCompetitorRequest,
    publicDirectorySeoController.deleteCompetitor
);
publicDirectorySeoRouter.patch(
    "/workspace/competitors",
    apiKeyAuth,
    directorySeoPlan,
    validatePublicDirectorySeoUpdateCompetitorRequest,
    publicDirectorySeoController.updateCompetitor
);
publicDirectorySeoRouter.post(
    "/workspace/refresh",
    apiKeyAuth,
    directorySeoPlan,
    validatePublicDirectorySeoRefreshRequest,
    publicDirectorySeoController.refreshWorkspace
);

export { publicDirectorySeoRouter };
