import type { FeedbackSchemaType } from "../data/schemas/feedbackSchemas";
import type { FeedbackRepository } from "../repositories/FeedbackRepository";
import type { FeedbackLike } from "../utils/dtos/FeedbackDTO";
import type CacheService from "../connections/cache/CacheService";
import type CacheInvalidationService from "../connections/cache/CacheInvalidationService";

import { logger } from "../utils/Logger";

/** Domain-scoped cache key prefixes. */
const CACHE_KEYS = {
    FEEDBACK: "feedback",
    FEEDBACK_LIST_ALL: "feedback:list:all",
};

const FEEDBACK_CACHE_TTL_SEC = 300;

export class FeedbackService {
    constructor(
        private readonly feedbackRepository: FeedbackRepository,
        private readonly cache?: CacheService,
        private readonly cacheInvalidator?: CacheInvalidationService
    ) {}

    async createFeedback(feedback: FeedbackSchemaType): Promise<string> {
        const feedbackId = await this.feedbackRepository.insert(feedback);
        await this._invalidateFeedbackRelatedCaches();
        return feedbackId;
    }

    async updateFeedbackIsHandled(feedbackId: string, isHandled: boolean): Promise<string> {
        const updatedFeedbackId = await this.feedbackRepository.updateIsHandled(
            feedbackId,
            isHandled
        );
        await this._invalidateFeedbackRelatedCaches();
        return updatedFeedbackId;
    }

    /** Returns repository row shape; controller maps to DTO just before response. */
    async getAllFeedbacks(): Promise<FeedbackLike[]> {
        const cacheKey = CACHE_KEYS.FEEDBACK_LIST_ALL;
        const factory = async (): Promise<FeedbackLike[]> => {
            logger.debug({ msg: "Getting all feedback from repository" });
            const list = await this.feedbackRepository.findAll();
            logger.info({ msg: "All feedback retrieved successfully", count: list.length });
            return list;
        };
        if (this.cache) {
            return this.cache.getOrSet(cacheKey, factory, FEEDBACK_CACHE_TTL_SEC);
        }
        return factory();
    }

    /**
     * Invalidate caches used by getAllFeedbacks (same key: FEEDBACK_LIST_ALL).
     */
    private async _invalidateFeedbackRelatedCaches(): Promise<void> {
        if (!this.cacheInvalidator) return;
        try {
            await this.cacheInvalidator.invalidateKey(CACHE_KEYS.FEEDBACK_LIST_ALL);
            await this.cacheInvalidator.invalidatePattern(`${CACHE_KEYS.FEEDBACK}:list:*`);
            logger.debug({ msg: "Invalidated feedback related caches" });
        } catch (error) {
            logger.error({
                msg: "Error invalidating feedback related caches",
                error: String(error),
            });
        }
    }
}
