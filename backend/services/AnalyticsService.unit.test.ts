import { faker } from "@faker-js/faker";
import dayjs from "dayjs";

import type { IntegrationService } from "./IntegrationService";
import type { IntegrationManager } from "../integrations/integrationManager";
import type { RefreshIntegrationService } from "./RefreshIntegrationService";
import type { AnalyticsData, SocialProvider } from "../integrations/social.integrations.interface";
import type { IntegrationLike } from "../utils/dtos/IntegrationDTO";

import { AnalyticsService } from "./AnalyticsService";

const authUserId = faker.string.uuid();
const organizationId = faker.string.uuid();
const integrationId = faker.string.uuid();
const dateWindowDays = 7;

function createIntegrationRow(overrides: Partial<IntegrationLike> = {}): IntegrationLike {
    const now = new Date().toISOString();
    return {
        id: integrationId,
        organization_id: organizationId,
        internal_id: faker.string.uuid(),
        name: faker.person.fullName(),
        picture: null,
        provider_identifier: "threads",
        type: "social",
        token: "access-token",
        disabled: false,
        token_expiration: dayjs().add(1, "day").toISOString(),
        refresh_token: null,
        profile: null,
        deleted_at: null,
        in_between_steps: false,
        refresh_needed: false,
        posting_times: "[]",
        custom_instance_details: null,
        additional_settings: "{}",
        customer_id: null,
        root_internal_id: null,
        created_at: now,
        updated_at: now,
        ...overrides,
    };
}

const sampleAnalytics: AnalyticsData[] = [
    {
        label: "Likes",
        data: [{ total: "3", date: "2026-01-01" }],
        percentageChange: 0,
    },
];

function createMocks() {
    const integrations = {
        getById: jest.fn(),
        getCachedIntegrationPayload: jest.fn(),
        setCachedIntegrationPayload: jest.fn().mockResolvedValue(undefined),
    };
    const manager = {
        getSocialIntegration: jest.fn(),
    };
    const refreshIntegrationService = {
        refresh: jest.fn(),
    };
    return { integrations, manager, refreshIntegrationService };
}

function service(mocks: ReturnType<typeof createMocks>) {
    return new AnalyticsService(
        mocks.integrations as unknown as IntegrationService,
        mocks.manager as unknown as IntegrationManager,
        mocks.refreshIntegrationService as unknown as RefreshIntegrationService
    );
}

describe("AnalyticsService", () => {
    let mocks: ReturnType<typeof createMocks>;

    beforeEach(() => {
        mocks = createMocks();
    });

    const baseParams = () => ({
        authUserId,
        organizationId,
        integrationId,
        date: dateWindowDays,
        assertOrganizationMember: jest.fn().mockResolvedValue(undefined),
    });

    describe("getIntegrationAnalytics", () => {
        it("calls assertOrganizationMember with auth user and organization", async () => {
            const assertOrganizationMember = jest.fn().mockResolvedValue(undefined);
            mocks.integrations.getById.mockResolvedValue(createIntegrationRow({ type: "article" }));

            await service(mocks).getIntegrationAnalytics({
                authUserId,
                organizationId,
                integrationId,
                date: dateWindowDays,
                assertOrganizationMember,
            });

            expect(assertOrganizationMember).toHaveBeenCalledWith(authUserId, organizationId);
        });

        it("throws AppError 404 when integration row is missing", async () => {
            mocks.integrations.getById.mockResolvedValue(null);

            await expect(service(mocks).getIntegrationAnalytics(baseParams())).rejects.toMatchObject({
                name: "AppError",
                message: "Integration not found",
                statusCode: 404,
            });
        });

        it("returns empty array when integration type is not social", async () => {
            mocks.integrations.getById.mockResolvedValue(createIntegrationRow({ type: "article" }));

            const out = await service(mocks).getIntegrationAnalytics(baseParams());

            expect(out).toEqual([]);
            expect(mocks.manager.getSocialIntegration).not.toHaveBeenCalled();
        });

        it("returns empty array when provider has no analytics implementation", async () => {
            mocks.integrations.getById.mockResolvedValue(createIntegrationRow());
            mocks.manager.getSocialIntegration.mockReturnValue({
                identifier: "threads",
            } as unknown as SocialProvider);

            const out = await service(mocks).getIntegrationAnalytics(baseParams());

            expect(out).toEqual([]);
            expect(mocks.integrations.getCachedIntegrationPayload).not.toHaveBeenCalled();
        });

        it("returns cached payload without calling provider.analytics when cache hits", async () => {
            const row = createIntegrationRow();
            mocks.integrations.getById.mockResolvedValue(row);
            const analyticsFn = jest.fn().mockResolvedValue(sampleAnalytics);
            mocks.manager.getSocialIntegration.mockReturnValue({
                identifier: "threads",
                analytics: analyticsFn,
            } as unknown as SocialProvider);
            mocks.integrations.getCachedIntegrationPayload.mockResolvedValue(sampleAnalytics);

            const out = await service(mocks).getIntegrationAnalytics(baseParams());

            expect(out).toEqual(sampleAnalytics);
            expect(analyticsFn).not.toHaveBeenCalled();
            expect(mocks.integrations.setCachedIntegrationPayload).not.toHaveBeenCalled();
        });

        it("calls provider.analytics and caches result on cache miss", async () => {
            const row = createIntegrationRow();
            mocks.integrations.getById.mockResolvedValue(row);
            const analyticsFn = jest.fn().mockResolvedValue(sampleAnalytics);
            mocks.manager.getSocialIntegration.mockReturnValue({
                identifier: "threads",
                analytics: analyticsFn,
            } as unknown as SocialProvider);
            mocks.integrations.getCachedIntegrationPayload.mockResolvedValue(null);

            const out = await service(mocks).getIntegrationAnalytics(baseParams());

            expect(out).toEqual(sampleAnalytics);
            expect(analyticsFn).toHaveBeenCalledWith(row.internal_id, row.token, dateWindowDays);
            expect(mocks.integrations.setCachedIntegrationPayload).toHaveBeenCalledWith(
                organizationId,
                integrationId,
                String(dateWindowDays),
                sampleAnalytics
            );
        });

        it("returns empty array when token is expired and refresh yields no access token", async () => {
            const row = createIntegrationRow({
                token_expiration: dayjs().subtract(1, "hour").toISOString(),
            });
            mocks.integrations.getById.mockResolvedValue(row);
            mocks.manager.getSocialIntegration.mockReturnValue({
                identifier: "threads",
                analytics: jest.fn(),
            } as unknown as SocialProvider);
            mocks.refreshIntegrationService.refresh.mockResolvedValue(false);

            const out = await service(mocks).getIntegrationAnalytics(baseParams());

            expect(out).toEqual([]);
            expect(mocks.integrations.getCachedIntegrationPayload).not.toHaveBeenCalled();
        });

        it("refreshes token and continues when expired and refresh succeeds", async () => {
            const row = createIntegrationRow({
                token_expiration: dayjs().subtract(1, "hour").toISOString(),
            });
            mocks.integrations.getById.mockResolvedValue(row);
            const analyticsFn = jest.fn().mockResolvedValue(sampleAnalytics);
            mocks.manager.getSocialIntegration.mockReturnValue({
                identifier: "threads",
                analytics: analyticsFn,
            } as unknown as SocialProvider);
            mocks.refreshIntegrationService.refresh.mockResolvedValue({
                accessToken: "new-token",
                refreshToken: "r",
                expiresIn: 3600,
                id: "id",
                name: "n",
                username: "user",
            });
            mocks.integrations.getCachedIntegrationPayload.mockResolvedValue(null);

            const out = await service(mocks).getIntegrationAnalytics(baseParams());

            expect(mocks.refreshIntegrationService.refresh).toHaveBeenCalledWith(row);
            expect(analyticsFn).toHaveBeenCalledWith(row.internal_id, "new-token", dateWindowDays);
            expect(out).toEqual(sampleAnalytics);
        });

        it("returns empty array when provider.analytics rejects", async () => {
            mocks.integrations.getById.mockResolvedValue(createIntegrationRow());
            mocks.manager.getSocialIntegration.mockReturnValue({
                identifier: "threads",
                analytics: jest.fn().mockRejectedValue(new Error("graph api")),
            } as unknown as SocialProvider);
            mocks.integrations.getCachedIntegrationPayload.mockResolvedValue(null);

            const out = await service(mocks).getIntegrationAnalytics(baseParams());

            expect(out).toEqual([]);
            expect(mocks.integrations.setCachedIntegrationPayload).toHaveBeenCalledWith(
                organizationId,
                integrationId,
                String(dateWindowDays),
                []
            );
        });
    });
});
