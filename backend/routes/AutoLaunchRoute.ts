import { Router } from "express";
import { autoLaunchController } from "../controllers/index";
import { requireFullAuth, requireFullAuthWithRoles, requireEditor } from "../guards";
import { supabaseAnonClient } from "../connections/index";
import { userRepository, rbacRepository } from "../repositories/index";
import { validateRequest } from "../middlewares/validateRequest";
import {
    autoLaunchDestinationIdParamSchema,
    autoLaunchProfileIdParamSchema,
    autoLaunchMainProfileIdParamSchema,
    createDirectoryProfileVariantBodySchema,
    autoLaunchProviderSlugParamSchema,
    completeSubmissionBodySchema,
    createAdminAutoLaunchDestinationBodySchema,
    createAutoLaunchProfileBodySchema,
    createSubmissionIntentBodySchema,
    listAutoLaunchProfilesQuerySchema,
    listAutoLaunchSubmissionsQuerySchema,
    listBusinessProfilesQuerySchema,
    recordManualSubmissionCompleteBodySchema,
    autoLaunchSubmissionIdParamSchema,
    deleteAutoLaunchSubmissionQuerySchema,
    updateSubmissionListingDetailsBodySchema,
    updateAdminAutoLaunchDestinationBodySchema,
    updateAutoLaunchProfileBodySchema,
} from "../data/schemas/autoLaunchSchemas";

const autoLaunchRouter: ReturnType<typeof Router> = Router();
const auth = requireFullAuth(supabaseAnonClient);
const authWithRoles = requireFullAuthWithRoles(supabaseAnonClient, userRepository, rbacRepository);
const editor = requireEditor;

autoLaunchRouter.get("/destinations", auth, autoLaunchController.listDestinations);

/** Merged channel groups + product rows for pickers (e.g. link channel to business profile). Not for launch CRUD. */
autoLaunchRouter.get(
    "/business-profiles",
    auth,
    validateRequest({ query: listBusinessProfilesQuerySchema }),
    autoLaunchController.listBusinessProfiles
);

/** `auto_launch_product_profiles` — directory launch copy, profileData, submissions. Optional `integrationCustomerId` filter. */
autoLaunchRouter.get(
    "/profiles",
    auth,
    validateRequest({ query: listAutoLaunchProfilesQuerySchema }),
    autoLaunchController.listProfiles
);
/** Single product profile by id (same resource as list/create/patch/delete below). */
autoLaunchRouter.get(
    "/profiles/:id",
    auth,
    validateRequest({ params: autoLaunchProfileIdParamSchema }),
    autoLaunchController.getProfileById
);
autoLaunchRouter.post(
    "/profiles",
    auth,
    validateRequest({ body: createAutoLaunchProfileBodySchema }),
    autoLaunchController.createProfile
);
autoLaunchRouter.patch(
    "/profiles/:id",
    auth,
    validateRequest({ params: autoLaunchProfileIdParamSchema, body: updateAutoLaunchProfileBodySchema }),
    autoLaunchController.updateProfile
);
autoLaunchRouter.delete(
    "/profiles/:id",
    auth,
    validateRequest({ params: autoLaunchProfileIdParamSchema }),
    autoLaunchController.deleteProfile
);
autoLaunchRouter.post(
    "/profiles/:mainId/variants",
    auth,
    validateRequest({
        params: autoLaunchMainProfileIdParamSchema,
        body: createDirectoryProfileVariantBodySchema,
    }),
    autoLaunchController.createDirectoryVariant
);

autoLaunchRouter.get(
    "/submissions",
    auth,
    validateRequest({ query: listAutoLaunchSubmissionsQuerySchema }),
    autoLaunchController.listSubmissions
);
autoLaunchRouter.post(
    "/submissions/record-complete",
    auth,
    validateRequest({ body: recordManualSubmissionCompleteBodySchema }),
    autoLaunchController.recordManualSubmissionComplete
);
autoLaunchRouter.patch(
    "/submissions/:id/listing-details",
    auth,
    validateRequest({
        params: autoLaunchSubmissionIdParamSchema,
        body: updateSubmissionListingDetailsBodySchema,
    }),
    autoLaunchController.updateSubmissionListingDetails
);
autoLaunchRouter.delete(
    "/submissions/:id",
    auth,
    validateRequest({
        params: autoLaunchSubmissionIdParamSchema,
        query: deleteAutoLaunchSubmissionQuerySchema,
    }),
    autoLaunchController.deleteSubmission
);
autoLaunchRouter.post(
    "/submissions/intent",
    auth,
    validateRequest({ body: createSubmissionIntentBodySchema }),
    autoLaunchController.createSubmissionIntent
);
autoLaunchRouter.post(
    "/submissions/complete",
    auth,
    validateRequest({ body: completeSubmissionBodySchema }),
    autoLaunchController.completeSubmission
);

// --- Secret-admin / editor: auto-launch destinations (extension fill config) ---
autoLaunchRouter.get(
    "/admin/provider-catalog",
    authWithRoles,
    editor,
    autoLaunchController.listProviderCatalog
);
autoLaunchRouter.get(
    "/admin/destinations",
    authWithRoles,
    editor,
    autoLaunchController.listAdminDestinations
);
autoLaunchRouter.get(
    "/admin/destinations/by-provider/:providerSlug",
    authWithRoles,
    editor,
    validateRequest({ params: autoLaunchProviderSlugParamSchema }),
    autoLaunchController.getAdminDestinationByProviderSlug
);
autoLaunchRouter.get(
    "/admin/destinations/:id",
    authWithRoles,
    editor,
    validateRequest({ params: autoLaunchDestinationIdParamSchema }),
    autoLaunchController.getAdminDestinationById
);
autoLaunchRouter.post(
    "/admin/destinations",
    authWithRoles,
    editor,
    validateRequest({ body: createAdminAutoLaunchDestinationBodySchema }),
    autoLaunchController.createAdminDestination
);
autoLaunchRouter.patch(
    "/admin/destinations/:id",
    authWithRoles,
    editor,
    validateRequest({
        params: autoLaunchDestinationIdParamSchema,
        body: updateAdminAutoLaunchDestinationBodySchema,
    }),
    autoLaunchController.updateAdminDestination
);
autoLaunchRouter.delete(
    "/admin/destinations/:id",
    authWithRoles,
    editor,
    validateRequest({ params: autoLaunchDestinationIdParamSchema }),
    autoLaunchController.deleteAdminDestination
);

export { autoLaunchRouter };
