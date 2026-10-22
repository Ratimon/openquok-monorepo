import { Router } from "express";
import { directorySeoController } from "../controllers/index";
import { requireFullAuth } from "../guards";
import { supabaseAnonClient } from "../connections/index";
import { validateRequest } from "../middlewares/validateRequest";
import {
    directorySeoAddCompetitorBodySchema,
    directorySeoDeleteCompetitorBodySchema,
    directorySeoUpdateCompetitorBodySchema,
    directorySeoRefreshBodySchema,
    directorySeoWorkspaceHistoryQuerySchema,
    directorySeoWorkspaceQuerySchema,
} from "../data/schemas/directorySeoSchemas";

const directorySeoRouter: ReturnType<typeof Router> = Router();
const auth = requireFullAuth(supabaseAnonClient);

directorySeoRouter.get(
    "/workspace/overview",
    auth,
    validateRequest({ query: directorySeoWorkspaceQuerySchema }),
    directorySeoController.getWorkspaceOverview
);
directorySeoRouter.get(
    "/workspace/history",
    auth,
    validateRequest({ query: directorySeoWorkspaceHistoryQuerySchema }),
    directorySeoController.getWorkspaceHistory
);
directorySeoRouter.post(
    "/workspace/competitors",
    auth,
    validateRequest({ body: directorySeoAddCompetitorBodySchema }),
    directorySeoController.addCompetitor
);
directorySeoRouter.delete(
    "/workspace/competitors",
    auth,
    validateRequest({ body: directorySeoDeleteCompetitorBodySchema }),
    directorySeoController.deleteCompetitor
);
directorySeoRouter.patch(
    "/workspace/competitors",
    auth,
    validateRequest({ body: directorySeoUpdateCompetitorBodySchema }),
    directorySeoController.updateCompetitor
);
directorySeoRouter.post(
    "/workspace/refresh",
    auth,
    validateRequest({ body: directorySeoRefreshBodySchema }),
    directorySeoController.refreshWorkspace
);

export { directorySeoRouter };
