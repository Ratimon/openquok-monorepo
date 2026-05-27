import type { NextFunction, Response } from "express";
import { SubscriptionSection } from "openquok-common";
import { TokenError } from "../errors/AuthError";
import { subscriptionGuard } from "../services/index";
import type { SubscriptionGuardContext, WorkspaceMembershipRole } from "../subscription/types";
import { resolveActiveOrganizationId } from "../utils/session/resolveActiveOrganizationId";
import type { AuthenticatedRequest } from "./authenticateUser";

export type RequirePlanCapabilityOptions = {
    resolveWorkspaceRole?: (req: AuthenticatedRequest) => WorkspaceMembershipRole | undefined;
};

/**
 * Express middleware: enforce a workspace-scoped plan capability before the route handler.
 * Resolves `authUserId` from the authenticated request and `organizationId` from the active workspace cookie.
 */
export function requirePlanCapability(
    section: SubscriptionSection,
    options?: RequirePlanCapabilityOptions
) {
    return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.id) {
                next(new TokenError("Authentication required"));
                return;
            }

            const organizationId = resolveActiveOrganizationId(req, { required: true })!;
            const ctx: SubscriptionGuardContext = {
                scope: "workspace",
                organizationId,
                authUserId: req.user.id,
                workspaceRole: options?.resolveWorkspaceRole?.(req),
            };

            await subscriptionGuard.assert(section, ctx);
            next();
        } catch (err) {
            next(err);
        }
    };
}

/** Account-scoped plan capability (e.g. owned workspace count on `POST /settings`). */
export function requireAccountPlanCapability(section: SubscriptionSection) {
    return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.id) {
                next(new TokenError("Authentication required"));
                return;
            }

            const ctx: SubscriptionGuardContext = {
                scope: "account",
                authUserId: req.user.id,
            };

            await subscriptionGuard.assert(section, ctx);
            next();
        } catch (err) {
            next(err);
        }
    };
}
