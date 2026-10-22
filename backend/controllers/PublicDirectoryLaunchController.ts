import type { Request, Response, NextFunction } from "express";
import type { ProgrammaticAuthRequest } from "../guards";
import type { AutoLaunchService } from "../services/AutoLaunchService";
import { countPublicApiRequest } from "../connections/index";
import {
    toAutoLaunchDestinationDtoCollection,
    toBusinessProfileDtoCollection,
} from "../utils/dtos/AutoLaunchDTO";
import type {
    PublicCreateDirectoryProfileBody,
    PublicEnsureDirectoryVariantBody,
    PublicListDirectoryProfilesQuery,
    PublicListDirectorySubmissionsQuery,
    PublicUpdateDirectoryProfileBody,
} from "../data/schemas/publicDirectoryLaunchSchemas";

/**
 * Programmatic directory launch API: organization resolved from API key
 * (`{api.prefix}/public/directory-launch/*`).
 */
export class PublicDirectoryLaunchController {
    constructor(private readonly autoLaunchService: AutoLaunchService) {}

    /** GET /public/directory-launch/destinations */
    listDestinations = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-launch-destinations");
            const rows = await this.autoLaunchService.listPublishedDestinations();
            res.status(200).json({ success: true, data: toAutoLaunchDestinationDtoCollection(rows) });
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/directory-launch/business-profiles */
    listBusinessProfiles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-launch-business-profiles");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const rows = await this.autoLaunchService.listBusinessProfilesProgrammatic(organizationId);
            res.status(200).json({ success: true, data: toBusinessProfileDtoCollection(rows) });
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/directory-launch/profiles */
    listProfiles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-launch-profiles-list");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const query = req.query as unknown as PublicListDirectoryProfilesQuery;
            const data = await this.autoLaunchService.listProfilesProgrammatic(
                organizationId,
                query.integrationCustomerId
            );
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/directory-launch/profiles/:id */
    getProfileById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-launch-profiles-get");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const { id } = req.params as { id: string };
            const data = await this.autoLaunchService.getProfileProgrammatic(organizationId, id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** POST /public/directory-launch/profiles */
    createProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-launch-profiles-create");
            const programmaticReq = req as ProgrammaticAuthRequest;
            const organizationId = programmaticReq.organization!.id;
            const body = req.body as PublicCreateDirectoryProfileBody;
            const data = await this.autoLaunchService.createProfileProgrammatic(
                programmaticReq.publicUserId!,
                {
                    organizationId,
                    integrationCustomerId: body.integrationCustomerId ?? null,
                    name: body.name,
                    tagline: body.tagline,
                    description: body.description,
                    websiteUrl: body.websiteUrl,
                    logoUrl: body.logoUrl,
                    profileData: body.profileData ?? {},
                }
            );
            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** PATCH /public/directory-launch/profiles/:id */
    updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-launch-profiles-update");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const { id } = req.params as { id: string };
            const body = req.body as PublicUpdateDirectoryProfileBody;
            const data = await this.autoLaunchService.updateProfileProgrammatic(organizationId, id, {
                name: body.name,
                tagline: body.tagline,
                description: body.description,
                websiteUrl: body.websiteUrl,
                logoUrl: body.logoUrl,
                integrationCustomerId: body.integrationCustomerId,
                profileData: body.profileData,
            });
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** POST /public/directory-launch/profiles/:mainId/variants — idempotent when variant exists */
    ensureDirectoryVariant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-launch-variants-ensure");
            const programmaticReq = req as ProgrammaticAuthRequest;
            const organizationId = programmaticReq.organization!.id;
            const { mainId } = req.params as { mainId: string };
            const body = req.body as PublicEnsureDirectoryVariantBody;
            const result = await this.autoLaunchService.ensureDirectoryVariantProgrammatic(
                organizationId,
                programmaticReq.publicUserId!,
                mainId,
                {
                    directorySiteKey: body.directorySiteKey,
                    name: body.name,
                }
            );
            res.status(result.created ? 201 : 200).json({ success: true, data: result.profile });
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/directory-launch/profiles/:id/listing-summary */
    getProfileListingSummary = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-launch-listing-summary");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const { id } = req.params as { id: string };
            const data = await this.autoLaunchService.getProfileListingSummaryForOrganization(
                organizationId,
                id
            );
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** GET /public/directory-launch/submissions */
    listSubmissions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            countPublicApiRequest("directory-launch-submissions-list");
            const organizationId = (req as ProgrammaticAuthRequest).organization!.id;
            const query = req.query as unknown as PublicListDirectorySubmissionsQuery;
            const data = await this.autoLaunchService.listSubmissionsProgrammatic(organizationId, {
                productProfileId: query.productProfileId,
                destinationId: query.destinationId,
            });
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}
