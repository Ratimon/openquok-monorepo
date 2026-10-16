import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../guards";
import type { AutoLaunchService } from "../services/AutoLaunchService";
import type {
    CompleteSubmissionBody,
    CreateAdminAutoLaunchDestinationBody,
    CreateAutoLaunchProfileBody,
    CreateSubmissionIntentBody,
    RecordManualSubmissionCompleteBody,
    ListAutoLaunchProfilesQuery,
    ListAutoLaunchSubmissionsQuery,
    ListBusinessProfilesQuery,
    UpdateAdminAutoLaunchDestinationBody,
    UpdateAutoLaunchProfileBody,
} from "../data/schemas/autoLaunchSchemas";
import { listDirectoryLaunchProviderSummaries } from "openquok-common";
import { UserAuthorizationError } from "../errors/UserError";
import {
    toAutoLaunchDestinationDtoCollection,
    toAutoLaunchProductProfileDto,
    toAutoLaunchProductProfileDtoCollection,
    toAutoLaunchSubmissionDto,
    toBusinessProfileDtoCollection,
} from "../utils/dtos/AutoLaunchDTO";

export class AutoLaunchController {
    constructor(private readonly autoLaunchService: AutoLaunchService) {}

    /** GET /auto-launch/destinations */
    listDestinations = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user?.id) return next(new UserAuthorizationError("Not authenticated"));
            const rows = await this.autoLaunchService.listPublishedDestinations();
            res.status(200).json({ success: true, data: toAutoLaunchDestinationDtoCollection(rows) });
        } catch (error) {
            next(error);
        }
    };

    /** GET /auto-launch/business-profiles?organizationId= */
    listBusinessProfiles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const query = req.query as unknown as ListBusinessProfilesQuery;
            const rows = await this.autoLaunchService.listBusinessProfiles(authUserId, query.organizationId);
            res.status(200).json({ success: true, data: toBusinessProfileDtoCollection(rows) });
        } catch (error) {
            next(error);
        }
    };

    /** GET /auto-launch/profiles?organizationId= */
    listProfiles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const query = req.query as unknown as ListAutoLaunchProfilesQuery;
            const rows = await this.autoLaunchService.listProfiles(
                authUserId,
                query.organizationId,
                query.integrationCustomerId
            );
            res.status(200).json({ success: true, data: toAutoLaunchProductProfileDtoCollection(rows) });
        } catch (error) {
            next(error);
        }
    };

    /** GET /auto-launch/profiles/:id */
    getProfileById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const { id } = req.params as { id: string };
            const row = await this.autoLaunchService.getProfileForMember(authUserId, id);
            res.status(200).json({ success: true, data: row ? toAutoLaunchProductProfileDto(row) : null });
        } catch (error) {
            next(error);
        }
    };

    /** POST /auto-launch/profiles */
    createProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const body = req.body as CreateAutoLaunchProfileBody;
            const row = await this.autoLaunchService.createProfile(authUserId, {
                organizationId: body.organizationId,
                integrationCustomerId: body.integrationCustomerId ?? null,
                name: body.name,
                tagline: body.tagline,
                description: body.description,
                websiteUrl: body.websiteUrl,
                logoUrl: body.logoUrl,
                profileData: body.profileData ?? {},
            });
            res.status(201).json({
                success: true,
                data: toAutoLaunchProductProfileDto(row),
                message: "Product profile created successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    /** PATCH /auto-launch/profiles/:id */
    updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const { id } = req.params as { id: string };
            const body = req.body as UpdateAutoLaunchProfileBody;
            const row = await this.autoLaunchService.updateProfile(authUserId, id, {
                name: body.name,
                tagline: body.tagline,
                description: body.description,
                websiteUrl: body.websiteUrl,
                logoUrl: body.logoUrl,
                integrationCustomerId: body.integrationCustomerId,
                profileData: body.profileData,
            });
            res.status(200).json({
                success: true,
                data: toAutoLaunchProductProfileDto(row),
                message: "Product profile updated successfully",
            });
        } catch (error) {
            next(error);
        }
    };

    /** DELETE /auto-launch/profiles/:id */
    deleteProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const { id } = req.params as { id: string };
            await this.autoLaunchService.deleteProfile(authUserId, id);
            res.status(200).json({ success: true, message: "Product profile deleted successfully" });
        } catch (error) {
            next(error);
        }
    };

    /** GET /auto-launch/submissions?organizationId= */
    listSubmissions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const query = req.query as unknown as ListAutoLaunchSubmissionsQuery;
            const submissions = await this.autoLaunchService.listSubmissions(authUserId, query.organizationId, {
                productProfileId: query.productProfileId,
                destinationId: query.destinationId,
            });
            res.status(200).json({ success: true, data: submissions });
        } catch (error) {
            next(error);
        }
    };

    /** POST /auto-launch/submissions/record-complete */
    recordManualSubmissionComplete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const body = req.body as RecordManualSubmissionCompleteBody;
            const row = await this.autoLaunchService.recordManualSubmissionComplete(authUserId, body);
            res.status(201).json({ success: true, data: toAutoLaunchSubmissionDto(row) });
        } catch (error) {
            next(error);
        }
    };

    /** POST /auto-launch/submissions/intent */
    createSubmissionIntent = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const body = req.body as CreateSubmissionIntentBody;
            const data = await this.autoLaunchService.createSubmissionIntent(authUserId, {
                organizationId: body.organizationId,
                productProfileId: body.productProfileId,
                destinationId: body.destinationId,
                providerSlug: body.providerSlug,
            });
            res.status(201).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** GET /auto-launch/admin/destinations */
    listAdminDestinations = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user?.id) return next(new UserAuthorizationError("Not authenticated"));
            const rows = await this.autoLaunchService.listAdminDestinations();
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            next(error);
        }
    };

    /** GET /auto-launch/admin/destinations/by-provider/:providerSlug */
    getAdminDestinationByProviderSlug = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user?.id) return next(new UserAuthorizationError("Not authenticated"));
            const { providerSlug } = req.params as { providerSlug: string };
            const row = await this.autoLaunchService.getAdminDestinationByProviderSlug(providerSlug);
            res.status(200).json({ success: true, data: row });
        } catch (error) {
            next(error);
        }
    };

    /** GET /auto-launch/admin/destinations/:id */
    getAdminDestinationById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user?.id) return next(new UserAuthorizationError("Not authenticated"));
            const { id } = req.params as { id: string };
            const row = await this.autoLaunchService.getAdminDestinationById(id);
            res.status(200).json({ success: true, data: row });
        } catch (error) {
            next(error);
        }
    };

    /** GET /auto-launch/admin/provider-catalog */
    listProviderCatalog = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user?.id) return next(new UserAuthorizationError("Not authenticated"));
            res.status(200).json({ success: true, data: listDirectoryLaunchProviderSummaries() });
        } catch (error) {
            next(error);
        }
    };

    /** POST /auto-launch/admin/destinations */
    createAdminDestination = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user?.id) return next(new UserAuthorizationError("Not authenticated"));
            const body = req.body as CreateAdminAutoLaunchDestinationBody;
            const row = await this.autoLaunchService.createAdminDestination(body);
            res.status(201).json({ success: true, data: row });
        } catch (error) {
            next(error);
        }
    };

    /** PATCH /auto-launch/admin/destinations/:id */
    updateAdminDestination = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user?.id) return next(new UserAuthorizationError("Not authenticated"));
            const { id } = req.params as { id: string };
            const body = req.body as UpdateAdminAutoLaunchDestinationBody;
            const row = await this.autoLaunchService.updateAdminDestination(id, body);
            res.status(200).json({ success: true, data: row });
        } catch (error) {
            next(error);
        }
    };

    /** DELETE /auto-launch/admin/destinations/:id */
    deleteAdminDestination = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user?.id) return next(new UserAuthorizationError("Not authenticated"));
            const { id } = req.params as { id: string };
            await this.autoLaunchService.deleteAdminDestination(id);
            res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    };

    /** POST /auto-launch/submissions/complete */
    completeSubmission = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const body = req.body as CompleteSubmissionBody;
            const data = await this.autoLaunchService.completeSubmission(authUserId, {
                launchToken: body.launchToken,
                evidence: body.evidence ?? {},
                listingUrl: body.listingUrl,
            });
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };
}
