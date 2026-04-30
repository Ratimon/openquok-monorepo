import { Router } from "express";
import { signatureController } from "../controllers/index";
import { requireFullAuth } from "../middlewares/authenticateUser";
import { supabaseAnonClient } from "../connections/index";
import { validateRequest } from "../middlewares/validateRequest";
import {
    createSignatureBodySchema,
    listSignaturesQuerySchema,
    signatureIdParamSchema,
    updateSignatureBodySchema,
} from "../data/schemas/signatureSchemas";

type SignatureRouter = ReturnType<typeof Router>;
const signatureRouter: SignatureRouter = Router();
const auth = requireFullAuth(supabaseAnonClient);

signatureRouter.get(
    "/",
    auth,
    validateRequest({ query: listSignaturesQuerySchema }),
    signatureController.listForOrganization
);
signatureRouter.get("/:id", auth, validateRequest({ params: signatureIdParamSchema }), signatureController.getById);
signatureRouter.post("/", auth, validateRequest({ body: createSignatureBodySchema }), signatureController.create);
signatureRouter.patch(
    "/:id",
    auth,
    validateRequest({ params: signatureIdParamSchema, body: updateSignatureBodySchema }),
    signatureController.update
);
signatureRouter.delete(
    "/:id",
    auth,
    validateRequest({ params: signatureIdParamSchema }),
    signatureController.deleteById
);

export { signatureRouter };
