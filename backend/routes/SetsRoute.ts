import { Router } from "express";
import { setsController } from "../controllers/index";
import { requireFullAuth } from "../middlewares/authenticateUser";
import { supabaseAnonClient } from "../connections/index";
import { validateRequest } from "../middlewares/validateRequest";
import { setIdParamSchema, listSetsQuerySchema, upsertSetBodySchema } from "../data/schemas/setSchemas";

const setsRouter: ReturnType<typeof Router> = Router();
const auth = requireFullAuth(supabaseAnonClient);

setsRouter.get("/", auth, validateRequest({ query: listSetsQuerySchema }), setsController.listForOrganization);
setsRouter.post("/", auth, validateRequest({ body: upsertSetBodySchema }), setsController.upsert);
setsRouter.get("/:id", auth, validateRequest({ params: setIdParamSchema }), setsController.getById);
setsRouter.delete("/:id", auth, validateRequest({ params: setIdParamSchema }), setsController.deleteById);

export { setsRouter };
