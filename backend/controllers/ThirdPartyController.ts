import type { Request, Response, NextFunction } from "express";

import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import { UserValidationError } from "../errors/UserError";

/**
 * Workspace-scoped connectors that can contribute media (browse/import).
 * The catalog is empty until concrete providers are registered in application code.
 */
export class ThirdPartyController {
    /** GET ?organizationId= — integrations that expose a media library for the workspace. */
    listForMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            if (!authUser?.id) {
                throw new UserValidationError("Authentication required");
            }
            const organizationId = typeof req.query.organizationId === "string" ? req.query.organizationId : "";
            if (!organizationId.trim()) {
                throw new UserValidationError("organizationId query parameter is required");
            }
            res.status(200).json({ success: true, data: [] });
        } catch (error) {
            next(error);
        }
    };
}
