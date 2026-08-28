/// <reference types="jest" />
import { faker } from "@faker-js/faker";
import { AppError } from "../errors/AppError";
import { UserNotFoundError } from "../errors/UserError";
import type { AcquisitionSurveyRepository } from "../repositories/AcquisitionSurveyRepository";
import type { OrganizationSubscriptionRow } from "../repositories/SubscriptionRepository";
import { AcquisitionSurveyService } from "./AcquisitionSurveyService";
import type { InternalOpsEmailService } from "./InternalOpsEmailService";
import type { SubscriptionService } from "./SubscriptionService";
import type { UserService } from "./UserService";

jest.mock("../config/GlobalConfig", () => {
    const acquisitionSurveyHolder = { eligibleFrom: "2026-08-28T00:00:00.000Z" };
    return {
        config: {
            acquisitionSurvey: {
                get eligibleFrom() {
                    return acquisitionSurveyHolder.eligibleFrom;
                },
            },
        },
        __acquisitionSurveyHolder: acquisitionSurveyHolder,
    };
});

const acquisitionSurveyHolder = (
    jest.requireMock("../config/GlobalConfig") as {
        __acquisitionSurveyHolder: { eligibleFrom: string };
    }
).__acquisitionSurveyHolder;

const authUserId = faker.string.uuid();
const userId = faker.string.uuid();
const organizationId = faker.string.uuid();
const subscriptionId = faker.string.uuid();
const responseId = faker.string.uuid();

const ELIGIBLE_FROM = "2026-08-28T00:00:00.000Z";

function subscriptionRow(
    overrides: Partial<OrganizationSubscriptionRow> = {}
): OrganizationSubscriptionRow {
    const now = faker.date.past().toISOString();
    return {
        id: subscriptionId,
        organization_id: organizationId,
        subscription_tier: "SOLO",
        period: "MONTHLY",
        identifier: faker.string.alphanumeric(12),
        cancel_at: null,
        channels_per_workspace: 3,
        is_lifetime: false,
        current_period_start: null,
        current_period_end: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
        ...overrides,
    };
}

function createMockRepo(): jest.Mocked<Pick<AcquisitionSurveyRepository, "findByUserId" | "insert">> {
    return {
        findByUserId: jest.fn(),
        insert: jest.fn(),
    };
}

function createMockSubscriptionService(): jest.Mocked<
    Pick<SubscriptionService, "billingEnabled" | "getOwnedAccountSubscription">
> {
    return {
        billingEnabled: jest.fn().mockReturnValue(true),
        getOwnedAccountSubscription: jest.fn(),
    };
}

function createMockUserService(): jest.Mocked<Pick<UserService, "getProfile">> {
    return {
        getProfile: jest.fn().mockResolvedValue({ id: userId }),
    };
}

function createMockOpsEmail(): jest.Mocked<
    Pick<InternalOpsEmailService, "notifyAcquisitionSurveySubmitted">
> {
    return {
        notifyAcquisitionSurveySubmitted: jest.fn(),
    };
}

describe("AcquisitionSurveyService", () => {
    let repo: jest.Mocked<Pick<AcquisitionSurveyRepository, "findByUserId" | "insert">>;
    let subscriptionService: jest.Mocked<
        Pick<SubscriptionService, "billingEnabled" | "getOwnedAccountSubscription">
    >;
    let userService: jest.Mocked<Pick<UserService, "getProfile">>;
    let internalOpsEmailService: jest.Mocked<
        Pick<InternalOpsEmailService, "notifyAcquisitionSurveySubmitted">
    >;

    beforeEach(() => {
        repo = createMockRepo();
        subscriptionService = createMockSubscriptionService();
        userService = createMockUserService();
        internalOpsEmailService = createMockOpsEmail();
        acquisitionSurveyHolder.eligibleFrom = ELIGIBLE_FROM;
        repo.findByUserId.mockResolvedValue(null);
        subscriptionService.getOwnedAccountSubscription.mockResolvedValue(
            subscriptionRow({ created_at: "2026-08-29T12:00:00.000Z" })
        );
    });

    function service(): AcquisitionSurveyService {
        return new AcquisitionSurveyService(
            repo as unknown as AcquisitionSurveyRepository,
            subscriptionService as unknown as SubscriptionService,
            userService as unknown as UserService,
            internalOpsEmailService as unknown as InternalOpsEmailService
        );
    }

    describe("getStatus", () => {
        it("returns eligible when billing is on, subscription is new enough, and no row exists", async () => {
            const status = await service().getStatus(authUserId);

            expect(status).toEqual({
                eligible: true,
                submitted: false,
                skipped: false,
            });
        });

        it("returns not eligible when subscription predates eligibleFrom", async () => {
            subscriptionService.getOwnedAccountSubscription.mockResolvedValue(
                subscriptionRow({ created_at: "2026-08-27T23:59:59.000Z" })
            );

            const status = await service().getStatus(authUserId);

            expect(status).toEqual({
                eligible: false,
                submitted: false,
                skipped: false,
            });
        });

        it("returns not eligible when billing is disabled", async () => {
            subscriptionService.billingEnabled.mockReturnValue(false);

            const status = await service().getStatus(authUserId);

            expect(status).toEqual({
                eligible: false,
                submitted: false,
                skipped: false,
            });
        });

        it("returns not eligible when user has no owned subscription", async () => {
            subscriptionService.getOwnedAccountSubscription.mockResolvedValue(null);

            const status = await service().getStatus(authUserId);

            expect(status).toEqual({
                eligible: false,
                submitted: false,
                skipped: false,
            });
        });

        it("returns not eligible when eligibleFrom is invalid", async () => {
            acquisitionSurveyHolder.eligibleFrom = "not-a-date";

            const status = await service().getStatus(authUserId);

            expect(status).toEqual({
                eligible: false,
                submitted: false,
                skipped: false,
            });
        });

        it("returns submitted with source when a non-skipped row exists", async () => {
            repo.findByUserId.mockResolvedValue({
                id: responseId,
                user_id: userId,
                source: "reddit",
                other_detail: null,
                utm: null,
                landing_url: null,
                referrer: null,
                organization_id: organizationId,
                subscription_id: subscriptionId,
                skipped: false,
                created_at: faker.date.recent().toISOString(),
            });

            const status = await service().getStatus(authUserId);

            expect(status).toEqual({
                eligible: false,
                submitted: true,
                skipped: false,
                source: "reddit",
            });
        });

        it("returns submitted without source when row was skipped", async () => {
            repo.findByUserId.mockResolvedValue({
                id: responseId,
                user_id: userId,
                source: "skipped",
                other_detail: null,
                utm: null,
                landing_url: null,
                referrer: null,
                organization_id: organizationId,
                subscription_id: subscriptionId,
                skipped: true,
                created_at: faker.date.recent().toISOString(),
            });

            const status = await service().getStatus(authUserId);

            expect(status).toEqual({
                eligible: false,
                submitted: true,
                skipped: true,
            });
        });

        it("throws UserNotFoundError when profile is missing", async () => {
            userService.getProfile.mockResolvedValue(null);

            await expect(service().getStatus(authUserId)).rejects.toBeInstanceOf(UserNotFoundError);
        });
    });

    describe("submitSurvey", () => {
        beforeEach(() => {
            repo.insert.mockResolvedValue(responseId);
        });

        it("inserts source response and notifies ops email", async () => {
            const owned = subscriptionRow({
                created_at: "2026-08-29T12:00:00.000Z",
                identifier: "sub_123",
            });
            subscriptionService.getOwnedAccountSubscription.mockResolvedValue(owned);

            const result = await service().submitSurvey(
                authUserId,
                {
                    source: "youtube",
                    utm: "utm_source=google",
                    landingUrl: "https://app.example.com/pricing",
                    referrer: "https://google.com",
                },
                { userEmail: "user@example.com" }
            );

            expect(result).toEqual({ id: responseId });
            expect(repo.insert).toHaveBeenCalledWith({
                userId,
                source: "youtube",
                otherDetail: null,
                utm: "utm_source=google",
                landingUrl: "https://app.example.com/pricing",
                referrer: "https://google.com",
                organizationId,
                subscriptionId: "sub_123",
                skipped: false,
            });
            expect(internalOpsEmailService.notifyAcquisitionSurveySubmitted).toHaveBeenCalledWith({
                userEmail: "user@example.com",
                userId,
                source: "youtube",
                skipped: false,
                otherDetail: null,
                organizationId,
                subscriptionId: "sub_123",
                utm: "utm_source=google",
                landingUrl: "https://app.example.com/pricing",
                referrer: "https://google.com",
            });
        });

        it("inserts skipped response with skipped source slug", async () => {
            await service().submitSurvey(authUserId, { skipped: true });

            expect(repo.insert).toHaveBeenCalledWith(
                expect.objectContaining({
                    source: "skipped",
                    skipped: true,
                    otherDetail: null,
                })
            );
            expect(internalOpsEmailService.notifyAcquisitionSurveySubmitted).toHaveBeenCalledWith(
                expect.objectContaining({
                    source: "skipped",
                    skipped: true,
                    otherDetail: null,
                })
            );
        });

        it("rejects duplicate submit with 409", async () => {
            repo.findByUserId.mockResolvedValue({
                id: responseId,
                user_id: userId,
                source: "reddit",
                other_detail: null,
                utm: null,
                landing_url: null,
                referrer: null,
                organization_id: organizationId,
                subscription_id: subscriptionId,
                skipped: false,
                created_at: faker.date.recent().toISOString(),
            });

            await expect(
                service().submitSurvey(authUserId, { source: "reddit" })
            ).rejects.toMatchObject({
                statusCode: 409,
                message: "Acquisition survey already submitted",
            } satisfies Partial<AppError>);

            expect(repo.insert).not.toHaveBeenCalled();
            expect(internalOpsEmailService.notifyAcquisitionSurveySubmitted).not.toHaveBeenCalled();
        });

        it("rejects ineligible users with 403", async () => {
            subscriptionService.getOwnedAccountSubscription.mockResolvedValue(
                subscriptionRow({ created_at: "2026-08-01T00:00:00.000Z" })
            );

            await expect(
                service().submitSurvey(authUserId, { source: "reddit" })
            ).rejects.toMatchObject({
                statusCode: 403,
                message: "Not eligible for acquisition survey",
            } satisfies Partial<AppError>);

            expect(repo.insert).not.toHaveBeenCalled();
            expect(internalOpsEmailService.notifyAcquisitionSurveySubmitted).not.toHaveBeenCalled();
        });
    });
});
