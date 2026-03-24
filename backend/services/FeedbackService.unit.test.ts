import { faker } from "@faker-js/faker";
import { FeedbackService } from "./FeedbackService";
import type { FeedbackRepository } from "../repositories/FeedbackRepository";

const feedbackId = faker.string.uuid();
const url = faker.internet.url();
const description = faker.lorem.sentence({ min: 3, max: 8 });
const createdAt = faker.date.past().toISOString();

function createMockFeedbackRepo(): jest.Mocked<FeedbackRepository> {
    return {
        insert: jest.fn(),
        updateIsHandled: jest.fn(),
        findAll: jest.fn(),
    } as unknown as jest.Mocked<FeedbackRepository>;
}

describe("FeedbackService", () => {
    let repo: jest.Mocked<FeedbackRepository>;

    beforeEach(() => {
        repo = createMockFeedbackRepo();
    });

    const mockFeedbackList = [
        {
            id: feedbackId,
            feedback_type: "report" as const,
            url,
            description,
            email: null as string | null,
            is_handled: false,
            created_at: createdAt,
        },
    ];

    describe("createFeedback", () => {
        it("returns id from repository", async () => {
            repo.insert.mockResolvedValue(feedbackId);
            const service = new FeedbackService(repo);
            const payload = {
                feedback_type: "propose" as const,
                url,
                description,
            };
            const id = await service.createFeedback(payload);
            expect(id).toBe(feedbackId);
            expect(repo.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    feedback_type: "propose",
                    url,
                    description,
                })
            );
        });

        it("invalidates cache after create", async () => {
            repo.insert.mockResolvedValue(feedbackId);
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new FeedbackService(repo, undefined, {
                invalidateKey,
                invalidatePattern,
            } as never);
            await service.createFeedback({
                feedback_type: "propose",
                url,
                description,
            });
            expect(invalidateKey).toHaveBeenCalledWith("feedback:list:all");
            expect(invalidatePattern).toHaveBeenCalledWith("feedback:list:*");
        });
    });

    describe("updateFeedbackIsHandled", () => {
        it("returns updated id", async () => {
            repo.updateIsHandled.mockResolvedValue(feedbackId);
            const service = new FeedbackService(repo);
            const id = await service.updateFeedbackIsHandled(feedbackId, true);
            expect(id).toBe(feedbackId);
            expect(repo.updateIsHandled).toHaveBeenCalledWith(feedbackId, true);
        });

        it("invalidates cache after update", async () => {
            repo.updateIsHandled.mockResolvedValue(feedbackId);
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new FeedbackService(repo, undefined, {
                invalidateKey,
                invalidatePattern,
            } as never);
            await service.updateFeedbackIsHandled(feedbackId, true);
            expect(invalidateKey).toHaveBeenCalledWith("feedback:list:all");
            expect(invalidatePattern).toHaveBeenCalledWith("feedback:list:*");
        });
    });

    describe("getAllFeedbacks", () => {
        it("returns list from repository when no cache", async () => {
            repo.findAll.mockResolvedValue(mockFeedbackList);
            const service = new FeedbackService(repo);
            const result = await service.getAllFeedbacks();
            expect(result).toEqual(mockFeedbackList);
            expect(result[0]).toMatchObject({
                id: feedbackId,
                feedback_type: "report",
                url,
                description,
                email: null,
                is_handled: false,
                created_at: createdAt,
            });
            expect(repo.findAll).toHaveBeenCalled();
        });

        it("uses cache when provided", async () => {
            const getOrSet = jest.fn().mockResolvedValue(mockFeedbackList);
            const service = new FeedbackService(repo, { getOrSet } as never);
            const result = await service.getAllFeedbacks();
            expect(result).toEqual(mockFeedbackList);
            expect(getOrSet).toHaveBeenCalledWith(
                "feedback:list:all",
                expect.any(Function),
                300
            );
            expect(repo.findAll).not.toHaveBeenCalled();
        });

        it("calls repository when cache misses", async () => {
            repo.findAll.mockResolvedValue(mockFeedbackList);
            const getOrSet = jest.fn().mockImplementation(async (_key: string, factory: () => Promise<unknown>) => factory());
            const service = new FeedbackService(repo, { getOrSet } as never);
            const result = await service.getAllFeedbacks();
            expect(result).toEqual(mockFeedbackList);
            expect(getOrSet).toHaveBeenCalledWith(
                "feedback:list:all",
                expect.any(Function),
                300
            );
            expect(repo.findAll).toHaveBeenCalled();
        });
    });
});
