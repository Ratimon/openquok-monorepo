import type { NextFunction, Request, Response } from "express";
import {
    DEFAULT_MEDIA_STORAGE_QUOTA_BYTES,
    pricing,
    UNLIMITED_POSTS_PER_MONTH,
    type PaidSubscriptionTier,
    type SubscriptionTier,
} from "openquok-common";
import type { AuthenticatedRequest } from "../middlewares/authenticateUser";
import type { SubscriptionService } from "../services/SubscriptionService";
import type { PermissionsService } from "../services/PermissionsService";
import type { StripeService } from "../services/StripeService";
import type {
    OrganizationSubscriptionRow,
    SubscriptionRepository,
} from "../repositories/SubscriptionRepository";
import type { EmailService } from "../services/EmailService";
import { UserValidationError } from "../errors/UserError";
import { resolveActiveOrganizationId } from "../utils/session/resolveActiveOrganizationId";
import { config } from "../config/GlobalConfig";
import { signBillingDiscountToken } from "../utils/auth/billingDiscountToken";
import { logger } from "../utils/Logger";

export class BillingController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly permissionsService: PermissionsService,
        private readonly stripeService: StripeService,
        private readonly subscriptionRepository: SubscriptionRepository,
        private readonly emailService: EmailService
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

    /** GET /billing, /billing/current — full billing context for active workspace. */
    getCurrent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organizationId = resolveActiveOrganizationId(req, { required: true })!;
            const authUserId = (req as AuthenticatedRequest).user?.id;
            const data = await this.buildCurrentBillingData(organizationId, authUserId);
            res.status(200).json({ success: true, data });
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
                organizationId?: string;
                period: "MONTHLY" | "YEARLY";
                billing: PaidSubscriptionTier;
                stripePriceId: string;
            };

            const organizationId =
                body.organizationId?.trim() || resolveActiveOrganizationId(req, { required: true });
            if (!organizationId) {
                throw new UserValidationError("organizationId is required");
            }

            const orgBilling = await this.subscriptionRepository.getOrganizationBilling(organizationId);
            if (!orgBilling) {
                throw new UserValidationError("Organization not found");
            }

            const result = await this.stripeService.subscribe({
                organizationId,
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

    embedded = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            if (!authUser?.id) {
                throw new UserValidationError("Authentication required");
            }

            const body = req.body as {
                organizationId?: string;
                period: "MONTHLY" | "YEARLY";
                billing: PaidSubscriptionTier;
                stripePriceId: string;
            };

            const organizationId =
                body.organizationId?.trim() || resolveActiveOrganizationId(req, { required: true });
            if (!organizationId) {
                throw new UserValidationError("organizationId is required");
            }

            const orgBilling = await this.subscriptionRepository.getOrganizationBilling(organizationId);
            if (!orgBilling) {
                throw new UserValidationError("Organization not found");
            }

            const result = await this.stripeService.createEmbeddedCheckout({
                organizationId,
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
            const organizationId = resolveActiveOrganizationId(req, { required: true })!;
            const authUserId = (req as AuthenticatedRequest).user?.id;
            const url = await this.stripeService.createBillingPortalSession(
                organizationId,
                authUserId
            );
            res.status(200).json({ success: true, data: { portal: url } });
        } catch (error) {
            next(error);
        }
    };

    checkCheckout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organizationId = resolveActiveOrganizationId(req) ?? "";
            const id = String(req.params.id ?? "");
            if (!id.trim()) {
                throw new UserValidationError("checkout id is required");
            }
            const poll = await this.stripeService.checkCheckoutStatus(organizationId, id);
            res.status(200).json({ success: true, data: poll });
        } catch (error) {
            next(error);
        }
    };

    checkDiscount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organizationId = resolveActiveOrganizationId(req, { required: true })!;
            const org = await this.subscriptionRepository.getOrganizationBilling(organizationId);
            const eligible = await this.stripeService.checkDiscountEligible(org?.stripe_customer_id);
            const secret = (config.auth as { securitySecret?: string }).securitySecret ?? "";
            res.status(200).json({
                success: true,
                data: {
                    offerCoupon: eligible && secret.trim() ? signBillingDiscountToken(secret) : false,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    applyDiscount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organizationId = resolveActiveOrganizationId(req, { required: true })!;
            const org = await this.subscriptionRepository.getOrganizationBilling(organizationId);
            if (!org?.stripe_customer_id) {
                throw new UserValidationError("No Stripe customer for this workspace");
            }
            await this.stripeService.applyRetentionDiscount(org.stripe_customer_id);
            res.status(200).json({ success: true, data: { applied: true } });
        } catch (error) {
            next(error);
        }
    };

    finishTrial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organizationId = resolveActiveOrganizationId(req, { required: true })!;
            const org = await this.subscriptionRepository.getOrganizationBilling(organizationId);
            try {
                await this.stripeService.finishTrial(org?.stripe_customer_id);
            } catch (err) {
                logger.warn({
                    msg: "[Billing] finishTrial Stripe call failed",
                    organizationId,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
            res.status(200).json({ success: true, data: { finish: true } });
        } catch (error) {
            next(error);
        }
    };

    isTrialFinished = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organizationId = resolveActiveOrganizationId(req, { required: true })!;
            const org = await this.subscriptionRepository.getOrganizationBilling(organizationId);
            res.status(200).json({
                success: true,
                data: { finished: !org?.is_trialing },
            });
        } catch (error) {
            next(error);
        }
    };

    prorate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body as {
                organizationId?: string;
                period: "MONTHLY" | "YEARLY";
                billing: PaidSubscriptionTier;
            };
            const organizationId =
                body.organizationId?.trim() || resolveActiveOrganizationId(req, { required: true });
            if (!organizationId) {
                throw new UserValidationError("organizationId is required");
            }
            const price = await this.stripeService.previewProration(organizationId, {
                billing: body.billing,
                period: body.period,
            });
            res.status(200).json({ success: true, data: price });
        } catch (error) {
            next(error);
        }
    };

    cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authUser = (req as AuthenticatedRequest).user;
            const body = req.body as { organizationId?: string; feedback?: string };
            const organizationId =
                body.organizationId?.trim() || resolveActiveOrganizationId(req, { required: true });
            if (!organizationId) {
                throw new UserValidationError("organizationId is required");
            }

            const org = await this.subscriptionRepository.getOrganizationBilling(organizationId);
            if (!org) {
                throw new UserValidationError("Organization not found");
            }

            const feedback = body.feedback?.trim() ?? "";
            if (feedback && this.emailService.isEnabled) {
                const sender = (config.basic as { senderEmailAddress?: string }).senderEmailAddress;
                void this.emailService
                    .sendPlain({
                        to: sender ?? "support@example.com",
                        subject: "Subscription cancelled",
                        text: `Workspace "${org.name}" (${organizationId}) cancelled their subscription.\n\nFeedback:\n${feedback}`,
                        replyTo: authUser?.email,
                    })
                    .catch((err) => {
                        logger.warn({
                            msg: "[Billing] cancellation notification email failed",
                            error: err instanceof Error ? err.message : String(err),
                        });
                    });
            }

            const result =
                feedback.length > 0
                    ? await this.stripeService.setSubscriptionCancelAtPeriodEnd(
                          organizationId,
                          authUser?.id
                      )
                    : await this.stripeService.reactivateSubscription(organizationId, authUser?.id);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    getCharges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organizationId = resolveActiveOrganizationId(req, { required: true })!;
            const charges = await this.stripeService.listCharges(organizationId);
            res.status(200).json({ success: true, data: charges });
        } catch (error) {
            next(error);
        }
    };

    refundCharges = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body as { organizationId?: string; chargeIds: string[] };
            const organizationId =
                body.organizationId?.trim() || resolveActiveOrganizationId(req, { required: true });
            if (!organizationId) {
                throw new UserValidationError("organizationId is required");
            }
            const result = await this.stripeService.refundCharges(organizationId, body.chargeIds);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    cancelSubscriptionAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organizationId = resolveActiveOrganizationId(req, { required: true })!;
            const result = await this.stripeService.cancelSubscriptionImmediately(organizationId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    addSubscriptionAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body as {
                organizationId?: string;
                subscription: PaidSubscriptionTier;
            };
            const organizationId =
                body.organizationId?.trim() || resolveActiveOrganizationId(req, { required: true });
            if (!organizationId) {
                throw new UserValidationError("organizationId is required");
            }
            await this.subscriptionService.grantPaidSubscriptionForAdmin({
                organizationId,
                subscriptionTier: body.subscription,
            });
            res.status(200).json({ success: true, data: { granted: true } });
        } catch (error) {
            next(error);
        }
    };

    async buildCurrentBillingData(organizationId: string, authUserId?: string) {
        try {
            await this.stripeService.reconcileSubscriptionWithStripe(organizationId, authUserId);
        } catch (error) {
            logger.warn({
                msg: "buildCurrentBillingData: Stripe reconciliation failed",
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            });
        }

        let subscription: OrganizationSubscriptionRow | null = null;
        try {
            subscription = await this.subscriptionService.getEffectiveSubscription(
                organizationId,
                authUserId
            );
        } catch (error) {
            logger.error({
                msg: "buildCurrentBillingData: subscription lookup failed",
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            });
        }

        const tier = this.subscriptionService.resolveTier(subscription);
        const limits = this.subscriptionService.getPlanLimitsForOrganization(subscription);
        const billingOrganizationId = subscription?.organization_id ?? organizationId;
        let drive: { used: number; total: number; tier: SubscriptionTier };
        try {
            drive = await this.subscriptionService.getWorkspaceDriveUsage(organizationId, authUserId);
        } catch (error) {
            logger.warn({
                msg: "buildCurrentBillingData: drive usage unavailable",
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            });
            const total =
                limits.media_storage_bytes_per_workspace || DEFAULT_MEDIA_STORAGE_QUOTA_BYTES;
            drive = { used: 0, total, tier };
        }

        let billing: {
            allowTrial: boolean;
            isTrialing: boolean;
            hasStripeCustomer: boolean;
        } | null = null;
        try {
            const orgBilling =
                await this.subscriptionRepository.getOrganizationBilling(billingOrganizationId);
            billing = orgBilling
                ? {
                      allowTrial: orgBilling.allow_trial,
                      isTrialing: orgBilling.is_trialing,
                      hasStripeCustomer: Boolean(orgBilling.stripe_customer_id),
                  }
                : null;
        } catch (error) {
            logger.warn({
                msg: "buildCurrentBillingData: organization billing lookup failed",
                organizationId: billingOrganizationId,
                error: error instanceof Error ? error.message : String(error),
            });
        }

        let posts: { used: number; limit: number | null };
        try {
            posts = await this.permissionsService.getPostsPerMonthUsage(organizationId, authUserId);
        } catch (error) {
            logger.warn({
                msg: "buildCurrentBillingData: posts usage unavailable",
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            });
            const cap = limits.posts_per_month;
            posts = {
                used: 0,
                limit: cap >= UNLIMITED_POSTS_PER_MONTH ? null : cap,
            };
        }

        return {
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
            posts,
            billing,
        };
    }
}
