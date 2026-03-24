import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./authenticateUser";
import { UserAuthorizationError } from "../errors/UserError";
import { logger } from "../utils/Logger";

export type ResourceType =
    | "blog_posts"
    | "listings"
    | "sublistings"
    | "listing_categories"
    | "listing_tags"
    | "users";

export type ResourceAction = "read" | "update" | "delete" | "create";

export interface ResourceAuthOptions {
    resourceType: ResourceType;
    paramName?: string;
    action?: ResourceAction;
    /** Resolve the resource's owner id (e.g. user_id / owner_id) for ownership and role checks. */
    getResourceOwner?: (resourceId: string) => Promise<string>;
}

/**
 * Middleware to verify the authenticated user can access a resource.
 * - Owner (user.publicId === resourceOwnerId) is always allowed.
 * - For "read": editor, admin, or super admin can access any resource.
 * - For other actions: only owner or super admin (unless extended).
 */
export function authorizeResource(options: ResourceAuthOptions) {
    const {
        resourceType,
        paramName = "id",
        action = "read",
        getResourceOwner,
    } = options;

    return async (
        req: AuthenticatedRequest,
        _res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            if (!req.user?.publicId) {
                next(new UserAuthorizationError("Authentication required"));
                return;
            }

            const userId = req.user.publicId;
            const resourceId = req.params[paramName];

            if (!resourceId) {
                next(
                    new UserAuthorizationError(
                        `Resource ID not provided in parameter: ${paramName}`
                    )
                );
                return;
            }

            let resourceOwnerId: string;
            if (typeof getResourceOwner === "function") {
                try {
                    resourceOwnerId = await getResourceOwner(resourceId);
                } catch (error) {
                    logger.error({
                        msg: "Error retrieving resource owner",
                        error: (error as Error).message,
                        resourceType,
                        resourceId,
                    });
                    next(error);
                    return;
                }
            } else {
                resourceOwnerId = resourceId;
            }

            const isOwner = userId === resourceOwnerId;
            const isSuperAdmin = req.user.isSuperAdmin === true;
            const hasEditor = req.user.roles?.includes("editor") === true;
            const hasAdmin = req.user.roles?.includes("admin") === true;
            const canAccessAsRole = isSuperAdmin || hasAdmin || hasEditor;

            if (isOwner) {
                next();
                return;
            }
            if (action === "read" && canAccessAsRole) {
                next();
                return;
            }
            if (action !== "read" && isSuperAdmin) {
                next();
                return;
            }

            next(
                new UserAuthorizationError(
                    "You don't have permission to access this resource"
                )
            );
        } catch (error) {
            next(error);
        }
    };
}
