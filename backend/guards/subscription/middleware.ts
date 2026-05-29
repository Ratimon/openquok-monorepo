import type { NextFunction, Response } from "express";
import { SubscriptionSection } from "openquok-common";
import { TokenError } from "../../errors/AuthError";
import { subscriptionGuard } from "../../services/index";
import type { ProgrammaticAuthRequest } from "../programmatic/programmaticAuth";
import { resolveActiveOrganizationId } from "../../utils/session/resolveActiveOrganizationId";
import type { AuthenticatedRequest } from "../auth/types";
import type { SubscriptionGuardContext, WorkspaceMembershipRole } from "./types";

export type RequirePlanCapabilityOptions = {
    resolveWorkspaceRole?: (req: AuthenticatedRequest) => WorkspaceMembershipRole | undefined;
};

export type RequirePlanCapabilityForOrganizationOptions = RequirePlanCapabilityOptions & {
    /**
     * Resolve the target workspace id from the request (e.g. query/body/params).
     * Prefer placing this middleware *after* validation middleware so the id is guaranteed to exist.
     */
    resolveOrganizationId: (req: AuthenticatedRequest) => string | undefined;
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

/**
 * Express middleware: enforce a workspace-scoped plan capability when the workspace id is carried
 * in request params/query/body rather than the active-workspace cookie.
 */
export function requirePlanCapabilityForOrganization(
    section: SubscriptionSection,
    options: RequirePlanCapabilityForOrganizationOptions
) {
    return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.id) {
                next(new TokenError("Authentication required"));
                return;
            }

            const organizationId = options.resolveOrganizationId(req);
            if (!organizationId?.trim()) {
                next(new TokenError("Workspace context required"));
                return;
            }

            const ctx: SubscriptionGuardContext = {
                scope: "workspace",
                organizationId,
                authUserId: req.user.id,
                workspaceRole: options.resolveWorkspaceRole?.(req),
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

/**
 * Programmatic (API key) plan capability for `/public/*` routes.
 * Uses `requireProgrammaticAuth`-attached `req.organization` as workspace context.
 */
export function requireProgrammaticPlanCapability(section: SubscriptionSection) {
    return async (req: ProgrammaticAuthRequest, _res: Response, next: NextFunction): Promise<void> => {
        try {
            const organizationId = req.organization?.id;
            if (!organizationId) {
                next(new TokenError("Authentication required"));
                return;
            }

            const ctx: SubscriptionGuardContext = {
                scope: "workspace",
                organizationId,
                authUserId: undefined,
            };

            await subscriptionGuard.assert(section, ctx);
            next();
        } catch (err) {
            next(err);
        }
    };
}

/**
 * Express middleware: enforce team invite capacity (members + pending invites) for the active workspace.
 */
export function requireTeamInviteCapacity() {
    return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.id) {
                next(new TokenError("Authentication required"));
                return;
            }

            const organizationId = resolveActiveOrganizationId(req, { required: true })!;
            await subscriptionGuard.assertTeamInviteCapacity(organizationId, req.user.id);
            next();
        } catch (err) {
            next(err);
        }
    };
}

/**
 * Express middleware: enforce team invite capacity when the workspace id is in params/query/body.
 */
export function requireTeamInviteCapacityForOrganization(
    options: Pick<RequirePlanCapabilityForOrganizationOptions, "resolveOrganizationId">
) {
    return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.id) {
                next(new TokenError("Authentication required"));
                return;
            }

            const organizationId = options.resolveOrganizationId(req);
            if (!organizationId?.trim()) {
                next(new TokenError("Workspace context required"));
                return;
            }

            await subscriptionGuard.assertTeamInviteCapacity(organizationId, req.user.id);
            next();
        } catch (err) {
            next(err);
        }
    };
}

/**
 * Express middleware: enforce an available team seat before adding a member to a workspace.
 */
export function requireTeamSeatForOrganization(
    options: Pick<RequirePlanCapabilityForOrganizationOptions, "resolveOrganizationId">
) {
    return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
        try {
            if (!req.user?.id) {
                next(new TokenError("Authentication required"));
                return;
            }

            const organizationId = options.resolveOrganizationId(req);
            if (!organizationId?.trim()) {
                next(new TokenError("Workspace context required"));
                return;
            }

            await subscriptionGuard.assertWorkspaceHasSeatForNewMember(organizationId, req.user.id);
            next();
        } catch (err) {
            next(err);
        }
    };
}
