import { Router } from "express";
import { companyController, configController, trackController } from "../controllers/index";
import { validateTrackEventRequest } from "../data/schemas/trackSchemas";
import {
    createConfigPropertiesParser,
    createCombinedConfigPropertiesParser,
} from "../middlewares";
import configSchemas from "../data/schemas/configSchemas";

type CompanyRouter = ReturnType<typeof Router>;
const companyRouter: CompanyRouter = Router();

companyRouter.get(
    "/information/properties",
    createConfigPropertiesParser(),
    companyController.getInformationByProperties
);
companyRouter.get("/information", companyController.getAllInformation);
companyRouter.get("/information/combined", companyController.getAllInformationCombined);
companyRouter.get(
    "/information/properties/combined",
    createCombinedConfigPropertiesParser(),
    companyController.getInformationByPropertiesCombined
);

/**
 * Public read-only module config (allowlisted in ConfigController).
 * Used by the public landing page SSR; does not require a user session.
 */
companyRouter.get("/config", configSchemas.validateGetModuleConfigQuery, configController.getPublicModuleConfig);

/** Anonymous conversion tracking (Meta CAPI); sets `track` / `fbclid` cookies when needed. */
companyRouter.post("/t", validateTrackEventRequest, trackController.trackPublic);

export { companyRouter };
