import type { RequestHandler } from "express";
import type { ZodError, ZodIssue, ZodSchema } from "zod";
import type { RequestValidationErrorItem } from "../errors/RequestError";
import { RequestError } from "../errors/RequestError";

export type RequestValidation<TParams = unknown, TQuery = unknown, TBody = unknown> = {
    params?: ZodSchema<TParams>;
    query?: ZodSchema<TQuery>;
    body?: ZodSchema<TBody>;
};

function convertToErrorList(fieldErrors: { [k: string]: string[] | undefined }): RequestValidationErrorItem[] {
    const errorList: RequestValidationErrorItem[] = [];
    Object.entries(fieldErrors).forEach(([key, value]) => {
        const first = value?.[0];
        if (first) errorList.push({ param: key, type: first });
    });
    return errorList;
}

function concatErrors(
    errorList: RequestValidationErrorItem[],
    parsedError: ZodError
): RequestValidationErrorItem[] {
    const { fieldErrors } = parsedError.flatten((i: ZodIssue) => i.code);
    return errorList.concat(convertToErrorList(fieldErrors));
}

/**
 * Validate incoming request against Zod schemas for params, query, and/or body.
 */
export const validateRequest = <TParams = unknown, TQuery = unknown, TBody = unknown>(
    schemas: RequestValidation<TParams, TQuery, TBody>
): RequestHandler => (req, _res, next) => {
    let errorList: RequestValidationErrorItem[] = [];

    if (schemas.params) {
        const parsed = schemas.params.safeParse(req.params);
        if (!parsed.success) errorList = concatErrors(errorList, parsed.error);
    }
    if (schemas.query) {
        const parsed = schemas.query.safeParse(req.query);
        if (!parsed.success) errorList = concatErrors(errorList, parsed.error);
    }
    if (schemas.body) {
        const parsed = schemas.body.safeParse(req.body);
        if (!parsed.success) errorList = concatErrors(errorList, parsed.error);
    }

    if (errorList.length) {
        next(new RequestError(errorList));
        return;
    }
    next();
};
