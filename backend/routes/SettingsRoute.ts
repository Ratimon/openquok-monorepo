import { Router } from "express";
import { settingsController } from "../controllers/index";
import {
    validateCreateOrganizationRequest,
    validateUpdateOrganizationRequest,
    validateAddTeamMemberRequest,
    validateInviteTeamMemberRequest,
    validateJoinOrganizationRequest,
    validateOrganizationIdParam,
    validateOrganizationIdAndUserIdParam,
} from "../data/schemas/organizationSchemas";
import { requireFullAuth } from "../middlewares/authenticateUser";
import { supabaseServiceClientConnection } from "../connections/index";

type SettingsRouter = ReturnType<typeof Router>;

const settingsRouter: SettingsRouter = Router();
const auth = requireFullAuth(supabaseServiceClientConnection);

settingsRouter.get("/", auth, settingsController.listMine);
settingsRouter.get("/invite/validate", settingsController.validateInviteToken);
settingsRouter.post("/join", auth, validateJoinOrganizationRequest, settingsController.joinByToken);
settingsRouter.get("/invites/pending", auth, settingsController.listPendingInvites);
settingsRouter.post("/invites/:id/accept", auth, settingsController.acceptPendingInvite);
settingsRouter.get("/:id", auth, validateOrganizationIdParam, settingsController.getById);
settingsRouter.post("/", auth, validateCreateOrganizationRequest, settingsController.create);
settingsRouter.patch(
    "/:id",
    auth,
    validateOrganizationIdParam,
    validateUpdateOrganizationRequest,
    settingsController.update
);
settingsRouter.delete(
    "/:id",
    auth,
    validateOrganizationIdParam,
    settingsController.deleteById
);
settingsRouter.post(
    "/:id/invite",
    auth,
    validateOrganizationIdParam,
    validateInviteTeamMemberRequest,
    settingsController.inviteTeamMember
);
settingsRouter.get(
    "/:id/team",
    auth,
    validateOrganizationIdParam,
    settingsController.getTeam
);
settingsRouter.post(
    "/:id/team",
    auth,
    validateOrganizationIdParam,
    validateAddTeamMemberRequest,
    settingsController.addTeamMember
);
settingsRouter.delete(
    "/:id/team/:userId",
    auth,
    validateOrganizationIdAndUserIdParam,
    settingsController.removeTeamMember
);
settingsRouter.post(
    "/:id/rotate-api-key",
    auth,
    validateOrganizationIdParam,
    settingsController.rotateApiKey
);

export { settingsRouter };
