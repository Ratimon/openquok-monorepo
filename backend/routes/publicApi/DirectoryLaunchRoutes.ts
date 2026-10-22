import { Router } from "express";
import { SubscriptionSection } from "openquok-common";

import { publicDirectoryLaunchController } from "../../controllers/index";
import { organizationRepository } from "../../repositories/index";
import { requireProgrammaticAuth, requireProgrammaticPlanCapability } from "../../guards";
import { oauthAppService, subscriptionGuard } from "../../services/index";
import {
    validatePublicCreateDirectoryProfileRequest,
    validatePublicDirectoryProfileIdParams,
    validatePublicEnsureDirectoryVariantRequest,
    validatePublicListDirectoryProfilesQuery,
    validatePublicListDirectorySubmissionsQuery,
    validatePublicUpdateDirectoryProfileRequest,
} from "../../data/schemas/publicDirectoryLaunchSchemas";

type PublicDirectoryLaunchRouter = ReturnType<typeof Router>;

/**
 * Programmatic directory launch API under `/public/directory-launch/*`.
 */
const publicDirectoryLaunchRouter: PublicDirectoryLaunchRouter = Router();
const apiKeyAuth = requireProgrammaticAuth({ oauthAppService, organizationRepository, subscriptionGuard });
const directoryLaunchPlan = requireProgrammaticPlanCapability(
    SubscriptionSection.DIRECTORY_LAUNCH_ENABLED
);

publicDirectoryLaunchRouter.get(
    "/destinations",
    apiKeyAuth,
    directoryLaunchPlan,
    publicDirectoryLaunchController.listDestinations
);
publicDirectoryLaunchRouter.get(
    "/business-profiles",
    apiKeyAuth,
    directoryLaunchPlan,
    publicDirectoryLaunchController.listBusinessProfiles
);
publicDirectoryLaunchRouter.get(
    "/profiles",
    apiKeyAuth,
    directoryLaunchPlan,
    validatePublicListDirectoryProfilesQuery,
    publicDirectoryLaunchController.listProfiles
);
publicDirectoryLaunchRouter.get(
    "/profiles/:id",
    apiKeyAuth,
    directoryLaunchPlan,
    validatePublicDirectoryProfileIdParams,
    publicDirectoryLaunchController.getProfileById
);
publicDirectoryLaunchRouter.post(
    "/profiles",
    apiKeyAuth,
    directoryLaunchPlan,
    validatePublicCreateDirectoryProfileRequest,
    publicDirectoryLaunchController.createProfile
);
publicDirectoryLaunchRouter.patch(
    "/profiles/:id",
    apiKeyAuth,
    directoryLaunchPlan,
    validatePublicUpdateDirectoryProfileRequest,
    publicDirectoryLaunchController.updateProfile
);
publicDirectoryLaunchRouter.post(
    "/profiles/:mainId/variants",
    apiKeyAuth,
    directoryLaunchPlan,
    validatePublicEnsureDirectoryVariantRequest,
    publicDirectoryLaunchController.ensureDirectoryVariant
);
publicDirectoryLaunchRouter.get(
    "/profiles/:id/listing-summary",
    apiKeyAuth,
    directoryLaunchPlan,
    validatePublicDirectoryProfileIdParams,
    publicDirectoryLaunchController.getProfileListingSummary
);
publicDirectoryLaunchRouter.get(
    "/submissions",
    apiKeyAuth,
    directoryLaunchPlan,
    validatePublicListDirectorySubmissionsQuery,
    publicDirectoryLaunchController.listSubmissions
);

export { publicDirectoryLaunchRouter };
