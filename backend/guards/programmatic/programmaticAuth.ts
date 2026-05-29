import type { NextFunction, Request, Response } from "express";
import { SubscriptionSection } from "openquok-common";
import type { OrganizationRepository } from "../../repositories/OrganizationRepository";
import type { OauthAppService } from "../../services/OauthAppService";
import type { SubscriptionGuardService } from "../subscription/SubscriptionGuardService";
import type { OrganizationLike } from "../../utils/dtos/OrganizationDTO";

export interface ProgrammaticAuthRequest extends Request {
    organization?: OrganizationLike;
    oauthApp?: { id: string; tokenId: string };
}

function parseRawToken(req: Request): string | null {
    const raw = (req.headers.authorization ?? req.headers.Authorization) as string | undefined;
    if (!raw?.trim()) return null;
    const key = raw.startsWith("Bearer ") ? raw.slice(7).trim() : raw.trim();
    return key || null;
}

/**
 * Programmatic auth middleware: OAuth app tokens (`opo_…`) only.
 * After organization resolution, enforces the workspace `public_api` plan capability.
 */
export function requireProgrammaticAuth(params: {
    oauthAppService: OauthAppService;
    organizationRepository: OrganizationRepository;
    subscriptionGuard: SubscriptionGuardService;
}) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = parseRawToken(req);
        if (!token) {
            res.status(401).json({ msg: "No API key provided" });
            return;
        }

        try {
            const verified = await params.oauthAppService.verifyProgrammaticToken(token);
            if (!verified) {
                res.status(401).json({ msg: "Invalid API key" });
                return;
            }

            const { organization } = await params.organizationRepository.findOrganizationById(
                verified.organizationId
            );
            if (!organization) {
                res.status(401).json({ msg: "Invalid API key" });
                return;
            }

            await params.subscriptionGuard.assert(SubscriptionSection.PUBLIC_API, {
                scope: "workspace",
                organizationId: organization.id,
            });

            (req as ProgrammaticAuthRequest).organization = organization;
            (req as ProgrammaticAuthRequest).oauthApp = { id: verified.oauthAppId, tokenId: verified.tokenId };
            next();
        } catch (err) {
            next(err);
        }
    };
}
