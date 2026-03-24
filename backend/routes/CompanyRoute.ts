import { Router } from "express";
import { companyController } from "../controllers/index";
import {
    createConfigPropertiesParser,
    createCombinedConfigPropertiesParser,
} from "../middlewares";

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

export { companyRouter };
