import type { Request, Response, NextFunction } from "express";
import { CompanyService } from "../services/CompanyService";
import { MarketingService } from "../services/MarketingService";

interface RequestWithParsedQuery extends Request {
    parsedQuery?: {
        properties?: string[] | null;
        companyProperties?: string[] | null;
        marketingProperties?: string[] | null;
    };
}

export class CompanyController {
    constructor(
        private readonly companyService: CompanyService,
        private readonly marketingService: MarketingService
    ) {}

    getInformationByProperties = async (
        req: RequestWithParsedQuery,
        res: Response,
        _next: NextFunction
    ) => {
        const properties = req.parsedQuery?.properties ?? [];
        const companyInformation =
            Array.isArray(properties) && properties.length > 0
                ? await this.companyService.getCompanyInformationByProperties(properties)
                : {};

        res.status(200).json({
            success: true,
            data: companyInformation,
            message: "Company information by properties fetched successfully",
        });
    };

    getAllInformation = async (_req: Request, res: Response, _next: NextFunction) => {
        const companyInformation = await this.companyService.getAllCompanyInformation();
        res.status(200).json({
            success: true,
            data: companyInformation,
            message: "All Company information fetched successfully",
        });
    };

    getInformationByPropertiesCombined = async (
        req: RequestWithParsedQuery,
        res: Response,
        _next: NextFunction
    ) => {
        const companyProperties = req.parsedQuery?.companyProperties ?? [];
        const marketingProperties = req.parsedQuery?.marketingProperties ?? [];

        const [companyInformation, marketingInformation] = await Promise.all([
            Array.isArray(companyProperties) && companyProperties.length > 0
                ? this.companyService.getCompanyInformationByProperties(companyProperties)
                : Promise.resolve({}),
            Array.isArray(marketingProperties) && marketingProperties.length > 0
                ? this.marketingService.getMarketingInformationByProperties(marketingProperties)
                : Promise.resolve({}),
        ]);

        res.status(200).json({
            success: true,
            data: {
                companyInformation,
                marketingInformation,
            },
            message:
                "Company and marketing information by properties fetched successfully",
        });
    };

    getAllInformationCombined = async (_req: Request, res: Response, _next: NextFunction) => {
        const [companyInformation, marketingInformation] = await Promise.all([
            this.companyService.getAllCompanyInformation(),
            this.marketingService.getMarketingInformation(),
        ]);

        res.status(200).json({
            success: true,
            data: {
                companyInformation,
                marketingInformation,
            },
            message: "Company and marketing information fetched successfully",
        });
    }
}
