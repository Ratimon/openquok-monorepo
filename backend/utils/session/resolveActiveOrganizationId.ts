import type { Request } from "express";
import { UserValidationError } from "../../errors/UserError";
import { readActiveOrganizationId } from "./sessionCookies";

/**
 * Active workspace for cookie-aware user/billing routes.
 * Prefers explicit `organizationId` query, then `showorg` cookie/header.
 */
export function resolveActiveOrganizationId(req: Request, options?: { required?: boolean }): string | undefined {
    const id = readActiveOrganizationId(req);
    if (options?.required && !id) {
        throw new UserValidationError(
            "Active workspace is required (set showorg cookie via POST /users/change-org or pass organizationId)"
        );
    }
    return id;
}
