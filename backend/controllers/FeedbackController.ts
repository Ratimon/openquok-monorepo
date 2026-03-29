import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type { FeedbackSchemaType } from "../data/schemas/feedbackSchemas";
import { FeedbackService } from "../services/FeedbackService";
import { toFeedbackDTOCollection } from "../utils/dtos/FeedbackDTO";
import { ValidationError } from "../errors/InfraError";

export class FeedbackController {
    constructor(private readonly feedbackService: FeedbackService) {}

    createFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body as FeedbackSchemaType;
            const auth = req as AuthenticatedRequest;
            const fromBody = body.email?.trim();
            const emailFromAuth = auth.user?.email?.trim();
            const payload: FeedbackSchemaType = {
                ...body,
                email:
                    fromBody && fromBody.length > 0
                        ? fromBody
                        : emailFromAuth && emailFromAuth.length > 0
                          ? emailFromAuth
                          : undefined,
            };
            const id = await this.feedbackService.createFeedback(payload);
            res.status(201).json({
                success: true,
                data: { id },
                message: "Feedback created successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    handleFeedback = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { feedbackId } = req.params as { feedbackId: string };
            const isHandled = (req.body as { is_handled?: boolean }).is_handled;

            if (!feedbackId || isHandled === undefined) {
                throw new ValidationError(
                    "Invalid request. Feedback ID and is_handled are required."
                );
            }

            const id = await this.feedbackService.updateFeedbackIsHandled(feedbackId, isHandled);
            res.status(200).json({
                success: true,
                data: { id },
                message: "Feedback handled successfully",
            });
        } catch (err) {
            next(err);
        }
    };

    getAllFeedbacks = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const rows = await this.feedbackService.getAllFeedbacks();
            const dtos = toFeedbackDTOCollection(rows);
            res.status(200).json({
                success: true,
                data: dtos,
                message: "Feedback retrieved successfully",
            });
        } catch (err) {
            next(err);
        }
    };
}
