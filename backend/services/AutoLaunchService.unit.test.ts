import { faker } from "@faker-js/faker";

import type { AutoLaunchRepository } from "../repositories/AutoLaunchRepository";
import type {
    AutoLaunchDestinationRow,
    AutoLaunchProductProfileRow,
    AutoLaunchSubmissionRow,
} from "../data/types/autoLaunchTypes";
import type { IntegrationConnectionService } from "./IntegrationConnectionService";
import { AutoLaunchService } from "./AutoLaunchService";
import { signLaunchToken } from "../utils/auth/launchToken";

jest.mock("../config/GlobalConfig", () => ({
    config: {
        auth: {
            securitySecret: "unit-test-launch-token-secret",
        },
    },
}));

const authUserId = faker.string.uuid();
const organizationId = faker.string.uuid();
const profileId = faker.string.uuid();
const destinationId = faker.string.uuid();
const submissionId = faker.string.uuid();

function profileRow(overrides: Partial<AutoLaunchProductProfileRow> = {}): AutoLaunchProductProfileRow {
    return {
        id: profileId,
        organization_id: organizationId,
        integration_customer_id: null,
        name: "Acme",
        tagline: "Tag",
        description: "Desc",
        website_url: "https://acme.test",
        logo_url: null,
        profile_data: { pricing_type: "free" },
        created_at: faker.date.recent().toISOString(),
        updated_at: faker.date.recent().toISOString(),
        created_by_user_id: authUserId,
        deleted_at: null,
        ...overrides,
    };
}

function destinationRow(overrides: Partial<AutoLaunchDestinationRow> = {}): AutoLaunchDestinationRow {
    return {
        id: destinationId,
        provider_slug: "uneed-join-line",
        link_directory_opportunity_id: null,
        name: "Uneed",
        short_description: null,
        submission_path: "extension",
        start_url: "https://uneed.best/pricing",
        extension_config: {
            version: 1,
            steps: [{ id: "product_info", label: "Product info", fields: [] }],
        },
        is_published: true,
        sort_order: 10,
        created_at: faker.date.recent().toISOString(),
        updated_at: faker.date.recent().toISOString(),
        ...overrides,
    };
}

function submissionRow(overrides: Partial<AutoLaunchSubmissionRow> = {}): AutoLaunchSubmissionRow {
    return {
        id: submissionId,
        organization_id: organizationId,
        product_profile_id: profileId,
        destination_id: destinationId,
        status: "intent",
        profile_snapshot: {},
        extension_config_snapshot: {},
        evidence: {},
        listing_url: null,
        intent_created_at: faker.date.recent().toISOString(),
        completed_at: null,
        created_by_user_id: authUserId,
        completed_by_user_id: null,
        created_at: faker.date.recent().toISOString(),
        updated_at: faker.date.recent().toISOString(),
        ...overrides,
    };
}

function createMockRepo(): jest.Mocked<AutoLaunchRepository> {
    return {
        listPublishedDestinations: jest.fn(),
        findDestinationById: jest.fn(),
        findPublishedDestinationByProviderSlug: jest.fn(),
        listProfilesByOrganization: jest.fn(),
        findProfileById: jest.fn(),
        insertProfile: jest.fn(),
        updateProfile: jest.fn(),
        softDeleteProfile: jest.fn(),
        integrationCustomerBelongsToOrg: jest.fn(),
        insertSubmissionIntent: jest.fn(),
        findLatestSubmissionForProductDestination: jest.fn(),
        refreshSubmissionIntent: jest.fn(),
        insertManualCompletedSubmission: jest.fn(),
        findSubmissionById: jest.fn(),
        listSubmissions: jest.fn(),
        completeSubmission: jest.fn(),
    } as unknown as jest.Mocked<AutoLaunchRepository>;
}

function createMockIntegration(): jest.Mocked<Pick<IntegrationConnectionService, "assertOrganizationMember">> {
    return {
        assertOrganizationMember: jest.fn().mockResolvedValue(undefined),
    };
}

describe("AutoLaunchService", () => {
    let repo: jest.Mocked<AutoLaunchRepository>;
    let integration: jest.Mocked<Pick<IntegrationConnectionService, "assertOrganizationMember">>;

    beforeEach(() => {
        repo = createMockRepo();
        integration = createMockIntegration();
    });

    describe("createSubmissionIntent", () => {
        it("returns snapshot, steps, token, and start URL", async () => {
            const profile = profileRow();
            const destination = destinationRow();
            const submission = submissionRow();

            repo.findProfileById.mockResolvedValue(profile);
            repo.findDestinationById.mockResolvedValue(destination);
            repo.findLatestSubmissionForProductDestination.mockResolvedValue(null);
            repo.insertSubmissionIntent.mockResolvedValue(submission);

            const service = new AutoLaunchService(
                repo,
                integration as unknown as IntegrationConnectionService
            );

            const result = await service.createSubmissionIntent(authUserId, {
                organizationId,
                productProfileId: profileId,
                destinationId,
            });

            expect(result.submissionId).toBe(submissionId);
            expect(result.startUrl).toBe(destination.start_url);
            expect(result.providerSlug).toBe("uneed-join-line");
            expect(result.profileSnapshot.name).toBe("Acme");
            expect(result.steps).toHaveLength(1);
            expect(result.launchToken).toBeTruthy();
            expect(integration.assertOrganizationMember).toHaveBeenCalledWith(authUserId, organizationId);
        });

        it("reuses an open intent instead of inserting another row", async () => {
            const profile = profileRow();
            const destination = destinationRow();
            const open = submissionRow({ status: "intent" });
            const refreshed = submissionRow({ status: "intent" });

            repo.findProfileById.mockResolvedValue(profile);
            repo.findDestinationById.mockResolvedValue(destination);
            repo.findLatestSubmissionForProductDestination.mockResolvedValue(open);
            repo.refreshSubmissionIntent.mockResolvedValue(refreshed);

            const service = new AutoLaunchService(
                repo,
                integration as unknown as IntegrationConnectionService
            );

            const result = await service.createSubmissionIntent(authUserId, {
                organizationId,
                productProfileId: profileId,
                destinationId,
            });

            expect(result.submissionId).toBe(refreshed.id);
            expect(repo.insertSubmissionIntent).not.toHaveBeenCalled();
            expect(repo.refreshSubmissionIntent).toHaveBeenCalled();
        });
    });

    describe("completeSubmission", () => {
        it("is idempotent when submission is already completed", async () => {
            const completed = submissionRow({
                status: "completed",
                listing_url: "https://uneed.best/product/acme",
                completed_at: faker.date.recent().toISOString(),
            });
            repo.findSubmissionById.mockResolvedValue(completed);

            const token = signLaunchToken(
                {
                    submissionId,
                    organizationId,
                    destinationId,
                    providerSlug: "uneed-join-line",
                },
                "unit-test-launch-token-secret"
            );

            const service = new AutoLaunchService(
                repo,
                integration as unknown as IntegrationConnectionService
            );

            const result = await service.completeSubmission(authUserId, {
                launchToken: token,
                evidence: { finalUrl: "https://uneed.best/product/acme" },
            });

            expect(result.alreadyCompleted).toBe(true);
            expect(result.status).toBe("completed");
            expect(repo.completeSubmission).not.toHaveBeenCalled();
        });

        it("marks submission completed on first call", async () => {
            const open = submissionRow({ status: "intent" });
            const done = submissionRow({
                status: "completed",
                listing_url: "https://uneed.best/product/acme",
                completed_at: faker.date.recent().toISOString(),
            });

            repo.findSubmissionById.mockResolvedValueOnce(open);
            repo.completeSubmission.mockResolvedValue(done);

            const token = signLaunchToken(
                {
                    submissionId,
                    organizationId,
                    destinationId,
                    providerSlug: "uneed-join-line",
                },
                "unit-test-launch-token-secret"
            );

            const service = new AutoLaunchService(
                repo,
                integration as unknown as IntegrationConnectionService
            );

            const result = await service.completeSubmission(authUserId, {
                launchToken: token,
                evidence: { finalUrl: "https://uneed.best/product/acme" },
                listingUrl: "https://uneed.best/product/acme",
            });

            expect(result.alreadyCompleted).toBe(false);
            expect(result.status).toBe("completed");
            expect(repo.completeSubmission).toHaveBeenCalled();
        });
    });
});
