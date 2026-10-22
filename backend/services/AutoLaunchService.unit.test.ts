import { faker } from "@faker-js/faker";

import type { AutoLaunchRepository } from "../repositories/AutoLaunchRepository";
import type {
    AutoLaunchDestinationRow,
    AutoLaunchExtensionConfig,
    AutoLaunchProductProfileRow,
    AutoLaunchSubmissionRow,
} from "../data/types/autoLaunchTypes";
import type { IntegrationConnectionService } from "./IntegrationConnectionService";
import type { SubscriptionGuardService } from "../guards/subscription/SubscriptionGuardService";
import { AutoLaunchService } from "./AutoLaunchService";
import { signLaunchToken } from "../utils/auth/launchToken";
import { computeListingFingerprintForSubmission } from "./autoLaunch/submissionListingSync";
import { buildProfileSnapshot } from "../utils/dtos/AutoLaunchDTO";

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
        profile_kind: "main",
        parent_profile_id: null,
        directory_site_key: null,
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
        picker_group_key: null,
        picker_group_title: null,
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
        listing_profile_fingerprint: null,
        listing_synced_at: null,
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
        findProfilesByIds: jest.fn(),
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
        reopenSubmissionForResync: jest.fn(),
        updateCompletedSubmissionListingSync: jest.fn(),
        updateSubmissionListingDetails: jest.fn(),
        findDirectoryVariantByParentAndSiteKey: jest.fn(),
        insertDirectoryVariantFromMain: jest.fn(),
        findDestinationListRowById: jest.fn(),
    } as unknown as jest.Mocked<AutoLaunchRepository>;
}

function createMockIntegration(): jest.Mocked<Pick<IntegrationConnectionService, "assertOrganizationMember">> {
    return {
        assertOrganizationMember: jest.fn().mockResolvedValue(undefined),
    };
}

function createMockSubscriptionGuard(): jest.Mocked<Pick<SubscriptionGuardService, "assert">> {
    return {
        assert: jest.fn().mockResolvedValue(undefined),
    };
}

describe("AutoLaunchService", () => {
    let repo: jest.Mocked<AutoLaunchRepository>;
    let integration: jest.Mocked<Pick<IntegrationConnectionService, "assertOrganizationMember">>;
    let subscriptionGuard: jest.Mocked<Pick<SubscriptionGuardService, "assert">>;

    beforeEach(() => {
        repo = createMockRepo();
        integration = createMockIntegration();
        subscriptionGuard = createMockSubscriptionGuard();
    });

    function createService(): AutoLaunchService {
        return new AutoLaunchService(
            repo,
            integration as unknown as IntegrationConnectionService,
            subscriptionGuard as unknown as SubscriptionGuardService
        );
    }

    describe("updateProfile", () => {
        it("merges profileData patches onto existing profile_data", async () => {
            const existing = profileRow({
                profile_data: { pricing_type: "free", social_x: "https://x.test/acme" },
            });
            const updated = profileRow({
                profile_data: { pricing_type: "paid", social_x: "https://x.test/acme" },
            });

            repo.findProfileById.mockResolvedValue(existing);
            repo.updateProfile.mockResolvedValue(updated);

            const service = createService();

            await service.updateProfile(authUserId, profileId, {
                profileData: { pricing_type: "paid" },
            });

            expect(repo.updateProfile).toHaveBeenCalledWith({
                profileId,
                organizationId,
                patch: {
                    name: undefined,
                    tagline: undefined,
                    description: undefined,
                    websiteUrl: undefined,
                    logoUrl: undefined,
                    integrationCustomerId: undefined,
                    profileData: {
                        pricing_type: "paid",
                        social_x: "https://x.test/acme",
                    },
                },
            });
        });
    });

    describe("createDirectoryVariant", () => {
        it("copies main profile into a directory variant for the site key", async () => {
            const main = profileRow({ profile_kind: "main", parent_profile_id: null });
            const variant = profileRow({
                id: faker.string.uuid(),
                profile_kind: "directory_variant",
                parent_profile_id: main.id,
                directory_site_key: "peerpush",
                name: "Acme (peerpush)",
            });

            repo.findProfileById.mockResolvedValue(main);
            repo.findDirectoryVariantByParentAndSiteKey.mockResolvedValue(null);
            repo.insertDirectoryVariantFromMain.mockResolvedValue(variant);
            repo.findProfilesByIds.mockResolvedValue([main]);

            const service = createService();

            const dto = await service.createDirectoryVariant(authUserId, main.id, {
                directorySiteKey: "peerpush",
            });

            expect(repo.insertDirectoryVariantFromMain).toHaveBeenCalledWith({
                mainProfile: main,
                directorySiteKey: "peerpush",
                name: "Acme (peerpush)",
                createdByUserId: authUserId,
            });
            expect(dto.id).toBe(variant.id);
            expect(dto.profileKind).toBe("directory_variant");
            expect(dto.directorySiteKey).toBe("peerpush");
        });
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

            const service = createService();

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

            const service = createService();

            const result = await service.createSubmissionIntent(authUserId, {
                organizationId,
                productProfileId: profileId,
                destinationId,
            });

            expect(result.submissionId).toBe(refreshed.id);
            expect(repo.insertSubmissionIntent).not.toHaveBeenCalled();
            expect(repo.refreshSubmissionIntent).toHaveBeenCalled();
        });

        it("reopens a stale completed submission instead of inserting a new intent", async () => {
            const profile = profileRow({ name: "Acme Renamed" });
            const destination = destinationRow({
                extension_config: {
                    version: 1,
                    steps: [
                        {
                            id: "product_info",
                            label: "Product info",
                            fields: [{ key: "name", profilePath: "name", label: "Name" }],
                        },
                    ],
                },
            });
            const extensionConfig = destination.extension_config!;
            const baselineSnapshot = buildProfileSnapshot(profileRow({ name: "Acme" }));
            const fingerprint = computeListingFingerprintForSubmission(baselineSnapshot, extensionConfig);
            const completed = submissionRow({
                status: "completed",
                completed_at: faker.date.recent().toISOString(),
                extension_config_snapshot: extensionConfig,
                profile_snapshot: baselineSnapshot,
                listing_profile_fingerprint: fingerprint,
            });
            const reopened = submissionRow({
                status: "in_progress",
                extension_config_snapshot: extensionConfig,
                profile_snapshot: buildProfileSnapshot(profile),
                completed_at: null,
                listing_profile_fingerprint: null,
                listing_synced_at: null,
            });

            repo.findProfileById.mockResolvedValue(profile);
            repo.findDestinationById.mockResolvedValue(destination);
            repo.findLatestSubmissionForProductDestination
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce(completed);
            repo.reopenSubmissionForResync.mockResolvedValue(reopened);

            const service = createService();

            const result = await service.createSubmissionIntent(authUserId, {
                organizationId,
                productProfileId: profileId,
                destinationId,
            });

            expect(result.submissionId).toBe(reopened.id);
            expect(result.profileSnapshot.name).toBe("Acme Renamed");
            expect(repo.insertSubmissionIntent).not.toHaveBeenCalled();
            expect(repo.reopenSubmissionForResync).toHaveBeenCalledWith({
                submissionId: completed.id,
                organizationId,
                profileSnapshot: buildProfileSnapshot(profile),
                extensionConfigSnapshot: extensionConfig,
            });
        });
    });

    describe("listSubmissions", () => {
        it("returns syncStatus synced when live profile matches listing fingerprint", async () => {
            const profile = profileRow({ name: "Acme" });
            const extensionConfig: AutoLaunchExtensionConfig = {
                version: 1,
                steps: [
                    {
                        id: "product_info",
                        label: "Product info",
                        fields: [{ key: "name", profilePath: "name", label: "Name" }],
                    },
                ],
            };
            const snapshot = buildProfileSnapshot(profile);
            const fingerprint = computeListingFingerprintForSubmission(snapshot, extensionConfig);
            const completed = submissionRow({
                status: "completed",
                completed_at: faker.date.recent().toISOString(),
                extension_config_snapshot: extensionConfig,
                profile_snapshot: snapshot,
                listing_profile_fingerprint: fingerprint,
                listing_synced_at: faker.date.recent().toISOString(),
            });

            repo.listSubmissions.mockResolvedValue([completed]);
            repo.findProfilesByIds.mockResolvedValue([profile]);

            const service = createService();

            const result = await service.listSubmissions(authUserId, organizationId, {
                productProfileId: profileId,
            });

            expect(result).toHaveLength(1);
            expect(result[0].syncStatus).toBe("synced");
            expect(result[0].listingSyncedAt).toBe(completed.listing_synced_at);
            expect(repo.findProfilesByIds).toHaveBeenCalledWith({
                organizationId,
                profileIds: [profileId],
            });
        });

        it("returns syncStatus stale when a fill-relevant profile field changes", async () => {
            const baselineProfile = profileRow({ name: "Acme" });
            const liveProfile = profileRow({ name: "Acme Renamed" });
            const extensionConfig: AutoLaunchExtensionConfig = {
                version: 1,
                steps: [
                    {
                        id: "product_info",
                        label: "Product info",
                        fields: [{ key: "name", profilePath: "name", label: "Name" }],
                    },
                ],
            };
            const snapshot = buildProfileSnapshot(baselineProfile);
            const fingerprint = computeListingFingerprintForSubmission(snapshot, extensionConfig);
            const completed = submissionRow({
                status: "completed",
                completed_at: faker.date.recent().toISOString(),
                extension_config_snapshot: extensionConfig,
                profile_snapshot: snapshot,
                listing_profile_fingerprint: fingerprint,
            });

            repo.listSubmissions.mockResolvedValue([completed]);
            repo.findProfilesByIds.mockResolvedValue([liveProfile]);

            const service = createService();

            const result = await service.listSubmissions(authUserId, organizationId, {});

            expect(result[0].syncStatus).toBe("stale");
        });

        it("returns syncStatus pending for non-completed submissions", async () => {
            const open = submissionRow({ status: "intent" });
            repo.listSubmissions.mockResolvedValue([open]);
            repo.findProfilesByIds.mockResolvedValue([profileRow()]);

            const service = createService();

            const result = await service.listSubmissions(authUserId, organizationId, {});

            expect(result[0].syncStatus).toBe("pending");
        });

        it("returns syncStatus synced when only unreferenced profile_data changes", async () => {
            const baselineProfile = profileRow({
                name: "Acme",
                profile_data: { pricing_type: "free" },
            });
            const liveProfile = profileRow({
                name: "Acme",
                profile_data: { pricing_type: "paid", extra_note: "ignored" },
            });
            const extensionConfig: AutoLaunchExtensionConfig = {
                version: 1,
                steps: [
                    {
                        id: "product_info",
                        label: "Product info",
                        fields: [{ key: "name", profilePath: "name", label: "Name" }],
                    },
                ],
            };
            const snapshot = buildProfileSnapshot(baselineProfile);
            const fingerprint = computeListingFingerprintForSubmission(snapshot, extensionConfig);
            const completed = submissionRow({
                status: "completed",
                completed_at: faker.date.recent().toISOString(),
                extension_config_snapshot: extensionConfig,
                profile_snapshot: snapshot,
                listing_profile_fingerprint: fingerprint,
            });

            repo.listSubmissions.mockResolvedValue([completed]);
            repo.findProfilesByIds.mockResolvedValue([liveProfile]);

            const service = createService();

            const result = await service.listSubmissions(authUserId, organizationId, {});

            expect(result[0].syncStatus).toBe("synced");
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

            const service = createService();

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
            repo.findProfileById.mockResolvedValue(profileRow());
            repo.findDestinationListRowById.mockResolvedValue({
                ...destinationRow(),
                opportunity_dofollow: "dofollow",
            } as never);
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

            const service = createService();

            const result = await service.completeSubmission(authUserId, {
                launchToken: token,
                evidence: { finalUrl: "https://uneed.best/product/acme" },
                listingUrl: "https://uneed.best/product/acme",
            });

            expect(result.alreadyCompleted).toBe(false);
            expect(result.status).toBe("completed");
            const profile = profileRow();
            const profileSnapshot = buildProfileSnapshot(profile);
            const extensionConfig = open.extension_config_snapshot as AutoLaunchExtensionConfig;
            const expectedFingerprint = computeListingFingerprintForSubmission(
                profileSnapshot,
                extensionConfig
            );
            expect(repo.completeSubmission).toHaveBeenCalledWith(
                expect.objectContaining({
                    submissionId: submissionId,
                    organizationId,
                    profileSnapshot,
                    listingProfileFingerprint: expectedFingerprint,
                    evidence: expect.objectContaining({ listingDofollow: true }),
                })
            );
        });
    });

    describe("createSubmissionIntent profile resolution", () => {
        it("uses directory variant when main profile has a matching site variant", async () => {
            const main = profileRow();
            const variant = profileRow({
                id: faker.string.uuid(),
                profile_kind: "directory_variant",
                parent_profile_id: main.id,
                directory_site_key: "uneed",
                name: "Acme (uneed)",
            });
            const dest = destinationRow({ provider_slug: "uneed-join-line" });

            repo.findDestinationById.mockResolvedValue(dest);
            repo.findProfileById.mockResolvedValue(main);
            repo.findDirectoryVariantByParentAndSiteKey.mockResolvedValue(variant);
            repo.findLatestSubmissionForProductDestination.mockResolvedValue(null);
            repo.insertSubmissionIntent.mockResolvedValue(
                submissionRow({ product_profile_id: variant.id })
            );

            const service = createService();

            await service.createSubmissionIntent(authUserId, {
                organizationId,
                productProfileId: main.id,
                destinationId,
            });

            expect(repo.insertSubmissionIntent).toHaveBeenCalledWith(
                expect.objectContaining({ productProfileId: variant.id })
            );
        });
    });

    describe("recordManualSubmissionComplete", () => {
        const extensionConfig: AutoLaunchExtensionConfig = {
            version: 1,
            steps: [
                {
                    id: "product_info",
                    label: "Product info",
                    fields: [{ key: "name", profilePath: "name", label: "Name" }],
                },
            ],
        };

        it("updates listing sync baseline when an existing completed row is stale", async () => {
            const liveProfile = profileRow({ name: "Acme Renamed" });
            const baselineSnapshot = buildProfileSnapshot(profileRow({ name: "Acme" }));
            const staleFingerprint = computeListingFingerprintForSubmission(
                baselineSnapshot,
                extensionConfig
            );
            const existingCompleted = submissionRow({
                status: "completed",
                extension_config_snapshot: extensionConfig,
                profile_snapshot: baselineSnapshot,
                listing_profile_fingerprint: staleFingerprint,
            });
            const updated = submissionRow({
                status: "completed",
                extension_config_snapshot: extensionConfig,
                profile_snapshot: buildProfileSnapshot(liveProfile),
                listing_profile_fingerprint: computeListingFingerprintForSubmission(
                    buildProfileSnapshot(liveProfile),
                    extensionConfig
                ),
                listing_url: "https://uneed.best/product/acme-renamed",
            });

            repo.findProfileById.mockResolvedValue(liveProfile);
            repo.findDestinationById.mockResolvedValue(
                destinationRow({ extension_config: extensionConfig })
            );
            repo.findLatestSubmissionForProductDestination.mockResolvedValue(existingCompleted);
            repo.updateCompletedSubmissionListingSync.mockResolvedValue(updated);
            repo.updateSubmissionListingDetails.mockResolvedValue(updated);

            const service = createService();

            const row = await service.recordManualSubmissionComplete(authUserId, {
                organizationId,
                productProfileId: profileId,
                destinationId,
                listingUrl: "https://uneed.best/product/acme-renamed",
                listingDofollow: true,
                authEmail: "founder@acme.test",
            });

            expect(row).toBe(updated);
            expect(repo.updateCompletedSubmissionListingSync).toHaveBeenCalledWith(
                expect.objectContaining({
                    submissionId: existingCompleted.id,
                    listingProfileFingerprint: computeListingFingerprintForSubmission(
                        buildProfileSnapshot(liveProfile),
                        extensionConfig
                    ),
                })
            );
            expect(repo.insertManualCompletedSubmission).not.toHaveBeenCalled();
        });

        it("updates listing details on existing completed row when listing is still synced", async () => {
            const profile = profileRow({ name: "Acme" });
            const snapshot = buildProfileSnapshot(profile);
            const fingerprint = computeListingFingerprintForSubmission(snapshot, extensionConfig);
            const existingCompleted = submissionRow({
                status: "completed",
                extension_config_snapshot: extensionConfig,
                profile_snapshot: snapshot,
                listing_profile_fingerprint: fingerprint,
            });

            repo.findProfileById.mockResolvedValue(profile);
            repo.findDestinationById.mockResolvedValue(
                destinationRow({ extension_config: extensionConfig })
            );
            repo.findLatestSubmissionForProductDestination.mockResolvedValue(existingCompleted);
            repo.updateSubmissionListingDetails.mockResolvedValue(existingCompleted);

            const service = createService();

            const row = await service.recordManualSubmissionComplete(authUserId, {
                organizationId,
                productProfileId: profileId,
                destinationId,
                listingUrl: "https://uneed.best/product/acme",
                listingDofollow: false,
                authEmail: "founder@acme.test",
            });

            expect(row).toBe(existingCompleted);
            expect(repo.updateSubmissionListingDetails).toHaveBeenCalled();
            expect(repo.updateCompletedSubmissionListingSync).not.toHaveBeenCalled();
            expect(repo.insertManualCompletedSubmission).not.toHaveBeenCalled();
        });
    });

    describe("getProfileListingSummaryForOrganization", () => {
        it("aggregates published destinations and submission readiness for a profile", async () => {
            const profile = profileRow();
            const destPeerpush = {
                id: faker.string.uuid(),
                provider_slug: "peerpush-standard-launch",
                link_directory_opportunity_id: null,
                name: "PeerPush Standard",
                short_description: null,
                submission_path: "extension" as const,
                start_url: "https://peerpush.com/submit",
                is_published: true,
                created_at: faker.date.recent().toISOString(),
                updated_at: faker.date.recent().toISOString(),
                extension_config: {
                    version: 1,
                    steps: [
                        {
                            id: "info",
                            label: "Info",
                            fields: [
                                {
                                    key: "name",
                                    label: "Name",
                                    profilePath: "name",
                                },
                            ],
                        },
                    ],
                },
                sort_order: 1,
                opportunity_description: null,
                opportunity_title: null,
                opportunity_dofollow: null,
                opportunity_cost_tier: null,
                opportunity_cost_note: null,
                site_domain_rating: null,
                site_metrics_updated_at: null,
                site_title: null,
                picker_group_key: "peerpush",
                picker_group_title: "PeerPush",
            };
            const destUneed = {
                ...destPeerpush,
                id: faker.string.uuid(),
                provider_slug: "uneed-join-line",
                name: "Uneed Join",
                sort_order: 2,
                picker_group_key: "uneed",
                picker_group_title: "Uneed",
            };

            repo.findProfileById.mockResolvedValue(profile);
            repo.listPublishedDestinations.mockResolvedValue([destPeerpush, destUneed]);
            repo.listSubmissions.mockResolvedValue([]);
            repo.findProfilesByIds.mockResolvedValue([profile]);

            const service = createService();
            const summary = await service.getProfileListingSummaryForOrganization(organizationId, profileId);

            expect(summary.profileId).toBe(profileId);
            expect(summary.publishedDirectorySiteCount).toBe(2);
            expect(summary.submittedDirectorySiteCount).toBe(0);
            expect(summary.unsubmittedDirectorySiteCount).toBe(2);
            expect(summary.destinations).toHaveLength(2);
            expect(summary.destinations[0]?.readiness.isReady).toBe(false);
            expect(summary.destinations[0]?.readiness.missingFields).toEqual(
                expect.arrayContaining([expect.objectContaining({ path: "name" })])
            );
        });
    });

    describe("ensureDirectoryVariantProgrammatic", () => {
        it("returns existing variant without creating a duplicate", async () => {
            const main = profileRow({ profile_kind: "main", parent_profile_id: null });
            const variant = profileRow({
                id: faker.string.uuid(),
                profile_kind: "directory_variant",
                parent_profile_id: main.id,
                directory_site_key: "peerpush",
            });

            repo.findProfileById.mockResolvedValue(main);
            repo.findDirectoryVariantByParentAndSiteKey.mockResolvedValue(variant);
            repo.findProfilesByIds.mockResolvedValue([]);

            const service = createService();
            const result = await service.ensureDirectoryVariantProgrammatic(
                organizationId,
                authUserId,
                main.id,
                { directorySiteKey: "peerpush" }
            );

            expect(result.created).toBe(false);
            expect(result.profile.id).toBe(variant.id);
            expect(repo.insertDirectoryVariantFromMain).not.toHaveBeenCalled();
        });
    });
});
