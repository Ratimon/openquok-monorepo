import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

const getModuleConfigQuerySchema = z.object({
    moduleName: z.string().min(1),
});

const updateModuleConfigBodySchema = z.object({
    moduleName: z.string().min(1),
    newConfig: z.record(z.unknown()),
});

const validateGetModuleConfigQuery: RequestHandler = validateRequest({
    query: getModuleConfigQuerySchema,
});

const validateUpdateModuleConfigRequest: RequestHandler = validateRequest({
    body: updateModuleConfigBodySchema,
});

type ConfigSchemas = {
    validateGetModuleConfigQuery: RequestHandler;
    validateUpdateModuleConfigRequest: RequestHandler;
};

const configSchemas: ConfigSchemas = {
    validateGetModuleConfigQuery,
    validateUpdateModuleConfigRequest,
};

export default configSchemas;
