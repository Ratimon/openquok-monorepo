import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type { SetsService } from "../services/SetsService";
import type { UpsertSetBody, ListSetsQuery } from "../data/schemas/setSchemas";
import { UserAuthorizationError } from "../errors/UserError";
import { toSetDTO, toSetDTOCollection } from "../utils/dtos/SetDTO";

export class SetsController {
    constructor(private readonly setsService: SetsService) {}

    /** GET /sets?organizationId= */
    listForOrganization = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const { organizationId } = req.query as unknown as ListSetsQuery;
            const rows = await this.setsService.listForOrganization(authUserId, organizationId);
            res.status(200).json({ success: true, data: toSetDTOCollection(rows) });
        } catch (error) {
            next(error);
        }
    };

    /** POST /sets — create or update when id belongs to workspace */
    upsert = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const body = req.body as UpsertSetBody;
            const out = await this.setsService.upsert(authUserId, body.organizationId, {
                id: body.id,
                name: body.name,
                content: body.content,
            });
            res.status(200).json({
                success: true,
                data: out,
                message: body.id ? "Set updated successfully" : "Set created successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    /** DELETE /sets/:id */
    deleteById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const { id } = req.params as { id: string };
            await this.setsService.delete(authUserId, id);
            res.status(200).json({ success: true, message: "Set deleted successfully" });
        } catch (error) {
            next(error);
        }
    };

    /** GET /sets/:id */
    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const { id } = req.params as { id: string };
            const row = await this.setsService.getByIdForMember(authUserId, id);
            res.status(200).json({ success: true, data: row ? toSetDTO(row) : null });
        } catch (error) {
            next(error);
        }
    };
}
