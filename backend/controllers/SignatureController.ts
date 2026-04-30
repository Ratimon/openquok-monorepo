import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type { SignatureService } from "../services/SignatureService";
import type { CreateSignatureBody, ListSignaturesQuery, UpdateSignatureBody } from "../data/schemas/signatureSchemas";
import { UserAuthorizationError } from "../errors/UserError";
import { toSignatureDTO, toSignatureDTOCollection } from "../utils/dtos/SignatureDTO";

export class SignatureController {
    constructor(private readonly signatureService: SignatureService) {}

    /** GET /signatures?organizationId= — list signatures for a workspace (must be member). */
    listForOrganization = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const { organizationId } = req.query as unknown as ListSignaturesQuery;
            const rows = await this.signatureService.listForOrganization(authUserId, organizationId);
            res.status(200).json({ success: true, data: toSignatureDTOCollection(rows) });
        } catch (error) {
            next(error);
        }
    };

    /** GET /signatures/:id — get one signature (must be member of owning org). */
    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const { id } = req.params as { id: string };
            const row = await this.signatureService.getById(authUserId, id);
            res.status(200).json({ success: true, data: row ? toSignatureDTO(row) : null });
        } catch (error) {
            next(error);
        }
    };

    /** POST /signatures — create signature in a workspace. */
    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const body = req.body as CreateSignatureBody;
            const id = await this.signatureService.create(authUserId, {
                organizationId: body.organizationId,
                title: body.title,
                content: body.content,
                isDefault: body.isDefault === true,
            });
            res.status(201).json({
                success: true,
                data: { id },
                message: "Signature created successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    /** PATCH /signatures/:id — update signature (must be member of owning org). */
    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const { id } = req.params as { id: string };
            const body = req.body as UpdateSignatureBody;
            const outId = await this.signatureService.update(authUserId, id, {
                title: body.title,
                content: body.content,
                isDefault: body.isDefault,
            });
            res.status(200).json({
                success: true,
                data: { id: outId },
                message: "Signature updated successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    /** DELETE /signatures/:id */
    deleteById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const { id } = req.params as { id: string };
            await this.signatureService.delete(authUserId, id);
            res.status(200).json({ success: true, message: "Signature deleted successfully" });
        } catch (error) {
            next(error);
        }
    };
}
