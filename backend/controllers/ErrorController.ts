import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/Logger";
import { Sentry } from "../connections/index";
import { AuthError } from "../errors/AuthError";
import { InfraError, ValidationError, DatabaseError } from "../errors/InfraError";
import { RequestError } from "../errors/RequestError";
import { AppError } from "../errors/AppError";

/**
 * Global error handler. Handles known error types (RequestError, AuthError, InfraError)
 * and returns appropriate status and body. Unknown errors return 500.
 * Auth errors use statusCode from the error instance so "throw" in controllers
 * results in the correct HTTP response.
 */
export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    if (err instanceof RequestError) {
        res.status(400).json({
            success: false,
            error: err.errorList,
        });
        return;
    }

    if (err instanceof AuthError) {
        const errorDetails: Record<string, unknown> = {
            msg: "AuthError occurred",
            name: err.name,
            message: err.message,
            statusCode: err.statusCode,
            path: (_req as Request & { path?: string }).path ?? _req.url,
            method: _req.method,
        };
        if (err.metadata && Object.keys(err.metadata).length > 0) {
            errorDetails.metadata = err.metadata;
        }
        if (err.statusCode === 401) {
            errorDetails.msg = "401 Unauthorized - Authentication failed";
            logger.warn(errorDetails);
        } else {
            logger.warn(errorDetails);
        }
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: {
                type: err.name,
                message: err.message,
                ...err.metadata,
            },
        });
        return;
    }

    if (err instanceof ValidationError) {
        logger.warn({ msg: "ValidationError", name: err.name, message: err.message });
        res.status(400).json({
            success: false,
            message: err.message,
            error: { type: err.name, message: err.message },
        });
        return;
    }

    if (err instanceof AppError) {
        logger.warn({
            msg: "AppError",
            name: err.name,
            message: err.message,
            statusCode: err.statusCode,
            ...(Object.keys(err.metadata).length > 0 ? { metadata: err.metadata } : {}),
        });
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: {
                type: err.name,
                message: err.message,
                ...(Object.keys(err.metadata).length > 0 ? err.metadata : {}),
            },
        });
        return;
    }

    if (err instanceof InfraError) {
        logger.error({
            msg: "InfraError occurred",
            name: err.name,
            message: err.message,
            statusCode: err.statusCode,
            component: err.component,
            operation: err.operation,
            cause: err.cause instanceof Error ? { message: err.cause.message, stack: err.cause.stack } : err.cause,
        });
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: {
                type: err.name ?? "InfrastructureError",
                message: err.message,
            },
        });
        return;
    }

    if (err instanceof DatabaseError) {
        logger.error({
            msg: "DatabaseError occurred",
            name: err.name,
            message: err.message,
            statusCode: err.statusCode,
            metadata: err.metadata,
        });
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: {
                type: err.name ?? "DatabaseError",
                message: err.message,
                ...(err.metadata && Object.keys(err.metadata).length > 0 ? err.metadata : {}),
            },
        });
        return;
    }

    // Unknown errors — report to Sentry, flush so event is sent, then respond
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    logger.error({ msg: "Unexpected error", error: message, status });
    const eventId = Sentry.captureException(err);
    if (eventId) {
        logger.info({
            msg: "Sentry event captured",
            eventId,
            hint: "If the event does not appear in Sentry: disable 'Filter out events from localhost' in Project Settings → Inbound Filters, then search by this eventId in Issues.",
        });
    } else {
        logger.warn({ msg: "Sentry did not capture event (filtered or SDK not inited)" });
    }

    const httpStatus = status >= 400 && status < 600 ? status : 500;
    res.status(httpStatus).json({
        success: false,
        message: httpStatus >= 500 ? "Internal server error" : message,
        error: {
            type: err instanceof Error ? err.name : "InternalServerError",
            message: httpStatus >= 500 ? "An unexpected error occurred" : message,
        },
    });
}
