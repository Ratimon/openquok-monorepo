import type { TrialBrowserRepository } from "../repositories/TrialBrowserRepository";
import type { UserRepository } from "../repositories/UserRepository";
import { config } from "../config/GlobalConfig";
import { normalizeCloudTrialBrowserSignal } from "../utils/billing/resolveCloudTrialBrowserSignal";
import { logger } from "../utils/Logger";

export class TrialBrowserService {
    constructor(
        private readonly trialBrowserRepository: TrialBrowserRepository,
        private readonly userRepository: UserRepository
    ) {}

    billingEnabled(): boolean {
        const stripeCfg = config.stripe as { publishableKey?: string } | undefined;
        return Boolean(stripeCfg?.publishableKey?.trim());
    }

    normalizeSignal(raw?: string | null): string | null {
        return normalizeCloudTrialBrowserSignal(raw);
    }

    async hasBrowserConsumedTrial(signalId?: string | null): Promise<boolean> {
        if (!this.billingEnabled()) return false;
        const normalized = this.normalizeSignal(signalId);
        if (!normalized) return false;
        return this.trialBrowserRepository.hasBrowserConsumedTrial(normalized);
    }

    async recordBrowserTrialConsumption(signalId: string, userId: string): Promise<void> {
        if (!this.billingEnabled()) return;
        const normalized = this.normalizeSignal(signalId);
        const publicUserId = userId?.trim();
        if (!normalized || !publicUserId) return;
        await this.trialBrowserRepository.recordBrowserTrialConsumption(normalized, publicUserId);
    }

    /** `authUserId` is Supabase auth uid; resolves to public.users.id when needed. */
    async persistUserBrowserSignal(authUserId: string, signalId?: string | null): Promise<void> {
        if (!this.billingEnabled()) return;
        const normalized = this.normalizeSignal(signalId);
        if (!normalized) return;

        const { userId, error } = await this.userRepository.findUserIdByAuthId(authUserId);
        if (error || !userId) {
            logger.warn({
                msg: "persistUserBrowserSignal: could not resolve public user id",
                authUserId,
                error: error instanceof Error ? error.message : String(error ?? "missing user"),
            });
            return;
        }

        await this.userRepository.updateCloudTrialBrowserSignalId(userId, normalized);
    }

    async getUserBrowserSignal(publicUserId: string): Promise<string | null> {
        if (!this.billingEnabled()) return null;
        return this.userRepository.getCloudTrialBrowserSignalId(publicUserId);
    }
}
