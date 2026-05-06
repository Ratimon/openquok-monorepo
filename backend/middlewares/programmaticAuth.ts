import type { Request, Response, NextFunction } from "express";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { OauthAppService } from "../services/OauthAppService";
import type { OrganizationLike } from "../utils/dtos/OrganizationDTO";

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
 * Programmatic auth middleware:
 * 1) Prefer OAuth app tokens (hashed in DB).
 * 2) Fallback to legacy org api_key (stored in organizations.api_key) for compatibility.
 */
export function requireProgrammaticAuth(params: {
    oauthAppService: OauthAppService;
    organizationRepository: OrganizationRepository;
}) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = parseRawToken(req);
        if (!token) {
            res.status(401).json({ msg: "No API key provided" });
            return;
        }

        try {
            const verified = await params.oauthAppService.verifyProgrammaticToken(token);
            if (verified) {
                const { organization } = await params.organizationRepository.findOrganizationById(
                    verified.organizationId
                );
                if (!organization) {
                    res.status(401).json({ msg: "Invalid API key" });
                    return;
                }
                (req as ProgrammaticAuthRequest).organization = organization;
                (req as ProgrammaticAuthRequest).oauthApp = { id: verified.oauthAppId, tokenId: verified.tokenId };
                next();
                return;
            }

            // Legacy fallback: organizations.api_key
            const org = await params.organizationRepository.findOrganizationByApiKey(token);
            if (!org) {
                res.status(401).json({ msg: "Invalid API key" });
                return;
            }
            (req as ProgrammaticAuthRequest).organization = org;
            next();
        } catch (err) {
            next(err);
        }
    };
}

