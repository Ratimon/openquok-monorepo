import { config } from "../config/GlobalConfig";
import { AppError } from "../errors/AppError";
import { UserNotFoundError } from "../errors/UserError";
import type { SubmitAcquisitionSurveyBody } from "../data/schemas/acquisitionSurveySchemas";
import type { AcquisitionSurveyRepository } from "../repositories/AcquisitionSurveyRepository";
import type { SubscriptionService } from "./SubscriptionService";
import type { InternalOpsEmailService } from "./InternalOpsEmailService";
import type { UserService } from "./UserService";

export type AcquisitionSurveyStatus = {
    eligible: boolean;
    submitted: boolean;
    skipped: boolean;
    source?: string;
};

const SKIPPED_SOURCE_SLUG = "skipped";

export class AcquisitionSurveyService {
    constructor(
        private readonly acquisitionSurveyRepository: AcquisitionSurveyRepository,
        private readonly subscriptionService: SubscriptionService,
        private readonly userService: UserService,
        private readonly internalOpsEmailService: InternalOpsEmailService
    ) {}

    async getStatus(authUserId: string): Promise<AcquisitionSurveyStatus> {
        const userId = await this.resolveUserId(authUserId);
        const existing = await this.acquisitionSurveyRepository.findByUserId(userId);

        if (existing) {
            return {
                eligible: false,
                submitted: true,
                skipped: existing.skipped,
                source: existing.skipped ? undefined : existing.source,
            };
        }

        const eligible = await this.isEligibleForSurvey(authUserId);
        return {
            eligible,
            submitted: false,
            skipped: false,
        };
    }

    async submitSurvey(
        authUserId: string,
        body: SubmitAcquisitionSurveyBody,
        options?: { userEmail?: string }
    ): Promise<{ id: string }> {
        const userId = await this.resolveUserId(authUserId);
        const existing = await this.acquisitionSurveyRepository.findByUserId(userId);
        if (existing) {
            throw new AppError("Acquisition survey already submitted", 409);
        }

        const eligible = await this.isEligibleForSurvey(authUserId);
        if (!eligible) {
            throw new AppError("Not eligible for acquisition survey", 403);
        }

        const skipped = body.skipped === true;
        const ownedSubscription =
            await this.subscriptionService.getOwnedAccountSubscription(authUserId);

        const id = await this.acquisitionSurveyRepository.insert({
            userId,
            source: skipped ? SKIPPED_SOURCE_SLUG : body.source!,
            otherDetail: skipped ? null : body.otherDetail ?? null,
            utm: body.utm ?? null,
            landingUrl: body.landingUrl ?? null,
            referrer: body.referrer ?? null,
            organizationId: body.organizationId ?? ownedSubscription?.organization_id ?? null,
            subscriptionId: ownedSubscription?.identifier ?? ownedSubscription?.id ?? null,
            skipped,
        });

        this.internalOpsEmailService.notifyAcquisitionSurveySubmitted({
            userEmail: options?.userEmail,
            userId,
            source: skipped ? SKIPPED_SOURCE_SLUG : body.source!,
            skipped,
            otherDetail: skipped ? null : body.otherDetail ?? null,
            organizationId: body.organizationId ?? ownedSubscription?.organization_id ?? null,
            subscriptionId: ownedSubscription?.identifier ?? ownedSubscription?.id ?? null,
            utm: body.utm ?? null,
            landingUrl: body.landingUrl ?? null,
            referrer: body.referrer ?? null,
        });

        return { id };
    }

    private async resolveUserId(authUserId: string): Promise<string> {
        const profile = await this.userService.getProfile(authUserId);
        if (!profile?.id) {
            throw new UserNotFoundError(authUserId);
        }
        return profile.id;
    }

    private async isEligibleForSurvey(authUserId: string): Promise<boolean> {
        if (!this.subscriptionService.billingEnabled()) {
            return false;
        }

        const ownedSubscription =
            await this.subscriptionService.getOwnedAccountSubscription(authUserId);
        if (!ownedSubscription) {
            return false;
        }

        const eligibleFromRaw =
            (config.acquisitionSurvey as { eligibleFrom?: string } | undefined)?.eligibleFrom ?? "";
        const eligibleFromMs = Date.parse(eligibleFromRaw);
        if (!Number.isFinite(eligibleFromMs)) {
            return false;
        }

        const subscriptionCreatedMs = Date.parse(ownedSubscription.created_at);
        if (!Number.isFinite(subscriptionCreatedMs)) {
            return false;
        }

        return subscriptionCreatedMs >= eligibleFromMs;
    }
}
