import type { NextFunction, Request, Response } from "express";
import type { ConfigService } from "../services/ConfigService";

interface UpdateModuleConfigBody {
    moduleName: string;
    newConfig: Record<string, unknown>;
}

export class ConfigController {
    constructor(private readonly configService: ConfigService) {}

    getModuleConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const moduleName = String(req.query.moduleName ?? "");
            const moduleConfig = await this.configService.getModuleConfig(moduleName);

            res.status(200).json({
                success: true,
                data: moduleConfig,
                message: "Module config fetched successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    updateModuleConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { moduleName, newConfig } = req.body as UpdateModuleConfigBody;
            const resultPm = await this.configService.updateModuleConfig({ moduleName, newConfig });

            res.status(200).json({
                success: true,
                data: resultPm,
                message: "Module config updated successfully",
            });
        } catch (error) {
            next(error);
        }
    };
}
