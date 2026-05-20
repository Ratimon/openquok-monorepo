import type { NextFunction, Request, Response } from "express";
import { pricing } from "openquok-common";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type { SubscriptionService } from "../services/SubscriptionService";
import type { StripeService } from "../services/StripeService";
import type { SubscriptionRepository } from "../repositories/SubscriptionRepository";
import { UserValidationError } from "../errors/UserError";

export class BillingController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly stripeService: StripeService,
        private readonly subscriptionRepository: SubscriptionRepository
    ) {}

    getPlans = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            res.status(200).json({
                success: true,
                data: {
                    tiers: Object.values(pricing).map((plan) => ({
                        tier: plan.current,
                        monthPrice: plan.month_price,
                        yearPrice: plan.year_price,
                        mediaStorageBytesPerWorkspace: plan.media_storage_bytes_per_workspace,
                        channelPerWorkspace: plan.channel_per_workspace,
                        postsPerMonth: plan.posts_per_month,
                        workspaces: plan.workspaces,
                        teamMembersPerWorkspace: plan.team_members_per_workspace,
                        sharePostPreview: plan.share_post_preview,
                        communityFeatures: plan.community_features,
                        publicApi: plan.public_api,
                    })),
                    billingEnabled: this.subscriptionService.billingEnabled(),
                },
            });
        } catch (error) {
            next(error);
        }
    };

    getCurrent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organizationId = String(req.query.organizationId ?? "");
            if (!organizationId.trim()) {
                throw new UserValidationError("organizationId query parameter is required");
            }

            const subscription = await this.subscriptionService.getSubscriptionByOrganizationId(
                organizationId
            );
            const tier = this.subscriptionService.resolveTier(subscription);
            const limits = this.subscriptionService.getPlanLimitsForOrganization(subscription);
            const drive = await this.subscriptionService.getWorkspaceDriveUsage(organizationId);
            const billing = await this.subscriptionRepository.getOrganizationBilling(organizationId);

            res.status(200).json({
                success: true,
                data: {
                    tier,
                    billingEnabled: this.subscriptionService.billingEnabled(),
                    subscription,
                    limits: {
                        mediaStorageBytesPerWorkspace: limits.media_storage_bytes_per_workspace,
                        channelPerWorkspace: limits.channel_per_workspace,
                        postsPerMonth: limits.posts_per_month,
                        workspaces: limits.workspaces,
                        teamMembersPerWorkspace: limits.team_members_per_workspace,
                        sharePostPreview: limits.share_post_preview,
                        communityFeatures: limits.community_features,
                        publicApi: limits.public_api,
                    },
                    drive,
                    billing: billing
                        ? {
                              allowTrial: billing.allow_trial,
                              isTrialing: billing.is_trialing,
                              hasStripeCustomer: Boolean(billing.stripe_customer_id),
                          }
                        : null,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    subscribe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            if (!authUser?.id) {
                throw new UserValidationError("Authentication required");
            }

            const body = req.body as {
                organizationId: string;
                period: "MONTHLY" | "YEARLY";
                billing: "SOLO" | "CREATOR" | "TEAM" | "ULTIMATE";
                stripePriceId: string;
            };

            const orgBilling = await this.subscriptionRepository.getOrganizationBilling(body.organizationId);
            if (!orgBilling) {
                throw new UserValidationError("Organization not found");
            }

            const result = await this.stripeService.subscribe({
                organizationId: body.organizationId,
                userId: authUser.publicId ?? authUser.id,
                body: {
                    period: body.period,
                    billing: body.billing,
                    stripePriceId: body.stripePriceId,
                },
                allowTrial: orgBilling.allow_trial,
            });

            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    portal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organizationId = String(req.query.organizationId ?? "");
            if (!organizationId.trim()) {
                throw new UserValidationError("organizationId query parameter is required");
            }
            const url = await this.stripeService.createBillingPortalSession(organizationId);
            res.status(200).json({ success: true, data: { portal: url } });
        } catch (error) {
            next(error);
        }
    };

    checkCheckout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organizationId = String(req.query.organizationId ?? "");
            const id = String(req.params.id ?? "");
            if (!organizationId.trim() || !id.trim()) {
                throw new UserValidationError("organizationId and checkout id are required");
            }
            const status = await this.subscriptionService.checkCheckoutStatus(organizationId, id);
            res.status(200).json({ success: true, data: { status } });
        } catch (error) {
            next(error);
        }
    };
}
