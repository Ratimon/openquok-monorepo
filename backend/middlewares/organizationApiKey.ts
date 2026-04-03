import type { Request, Response, NextFunction } from "express";
import type { OrganizationRepository, OrganizationRow } from "../repositories/OrganizationRepository";

/**
 * Request carrying the organization resolved from the programmatic API key
 * (`Authorization` header: raw key or `Bearer <key>`).
 */
export interface OrganizationApiRequest extends Request {
    organization?: OrganizationRow;
}

/**
 * Authenticates requests that use the organization API key instead of a user JWT.
 * Mirrors the separation between session-scoped integration routes and programmatic routes.
 * Pass the shared `organizationRepository` from `repositories/index.ts` (one instance per process).
 */
export function requireOrganizationApiKey(repository: OrganizationRepository) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const raw = (req.headers.authorization ?? req.headers.Authorization) as string | undefined;
        if (!raw?.trim()) {
            res.status(401).json({ msg: "No API key provided" });
            return;
        }

        const key = raw.startsWith("Bearer ") ? raw.slice(7).trim() : raw.trim();
        if (!key) {
            res.status(401).json({ msg: "No API key provided" });
            return;
        }

        try {
            const org = await repository.findOrganizationByApiKey(key);
            if (!org) {
                res.status(401).json({ msg: "Invalid API key" });
                return;
            }
            (req as OrganizationApiRequest).organization = org;
            next();
        } catch (err) {
            next(err);
        }
    };
}
