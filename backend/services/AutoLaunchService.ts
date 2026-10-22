import {
    directorySiteKeyFromProviderSlug,
    getProfileLaunchSummary,
    mergeBusinessProfileData,
    SubscriptionSection,
    type BusinessProfileData,
    type ProfileLaunchDestinationInput,
    type ProfileLaunchSubmissionInput,
} from "openquok-common";

import { config } from "../config/GlobalConfig";
import type { AutoLaunchRepository } from "../repositories/AutoLaunchRepository";
import type { IntegrationConnectionService } from "./IntegrationConnectionService";
import type { SubscriptionGuardService } from "../guards/subscription/SubscriptionGuardService";
import {
    AutoLaunchDestinationNotFoundError,
    AutoLaunchIntentNotAvailableError,
    AutoLaunchProfileNotFoundError,
    AutoLaunchSubmissionNotFoundError,
    AutoLaunchTokenInvalidError,
} from "../errors/AutoLaunchError";
import { UserValidationError } from "../errors/UserError";
import type {
    AutoLaunchDestinationListRow,
    AutoLaunchDestinationRow,
    AutoLaunchProductProfileRow,
    AutoLaunchSubmissionRow,
    BusinessProfileListRow,
} from "../data/types/autoLaunchTypes";
import type {
    CreateAdminAutoLaunchDestinationBody,
    RecordManualSubmissionCompleteBody,
    UpdateAdminAutoLaunchDestinationBody,
    UpdateSubmissionListingDetailsBody,
} from "../data/schemas/autoLaunchSchemas";
import {
    applyTrustedListingDofollowOnComplete,
    buildManualListingEvidence,
    mergeSubmissionListingEvidence,
    type CatalogOpportunityDofollow,
} from "./autoLaunch/submissionListingEvidence";
import {
    AUTO_LAUNCH_OPEN_SUBMISSION_STATUSES,
    dedupeAutoLaunchSubmissionsByDestination,
} from "./autoLaunch/dedupeAutoLaunchSubmissions";
import {
    computeListingFingerprintForSubmission,
    isCompletedSubmissionListingStale,
    resolveSubmissionSyncStatus,
} from "./autoLaunch/submissionListingSync";
import {
    buildProfileSnapshot,
    toAutoLaunchProductProfileDto,
    toAutoLaunchProductProfileDtoCollection,
    toSubmissionIntentDto,
    type AutoLaunchAdminDestinationDto,
    type AutoLaunchProductProfileDto,
    type AutoLaunchSubmissionCompleteDto,
    type AutoLaunchSubmissionDto,
    type AutoLaunchSubmissionIntentDto,
    type AutoLaunchProfileListingSummaryDto,
    toAutoLaunchAdminDestinationDto,
    toAutoLaunchSubmissionDtoCollection,
} from "../utils/dtos/AutoLaunchDTO";
import { signLaunchToken, verifyLaunchToken } from "../utils/auth/launchToken";
import {
    parseBusinessProfileDataInput,
    parseBusinessProfileDataPatch,
} from "../data/schemas/businessProfileDataSchemas";

function launchTokenSecret(): string {
    return (config.auth as { securitySecret?: string })?.securitySecret?.trim() ?? "";
}

export class AutoLaunchService {
    constructor(
        private readonly autoLaunchRepository: AutoLaunchRepository,
        private readonly integrationConnectionService: IntegrationConnectionService,
        private readonly subscriptionGuard: SubscriptionGuardService
    ) {}

    private async assertDirectoryLaunchEnabled(
        organizationId: string,
        authUserId: string
    ): Promise<void> {
        await this.subscriptionGuard.assert(SubscriptionSection.DIRECTORY_LAUNCH_ENABLED, {
            scope: "workspace",
            organizationId,
            authUserId,
        });
    }

    /** Programmatic API / MCP — membership is enforced by the caller. */
    async assertDirectoryLaunchEnabledForProgrammatic(
        organizationId: string,
        publicUserId: string
    ): Promise<void> {
        await this.subscriptionGuard.assert(SubscriptionSection.DIRECTORY_LAUNCH_ENABLED, {
            scope: "workspace",
            organizationId,
            publicUserId,
        });
    }

    async listPublishedDestinations(): Promise<AutoLaunchDestinationListRow[]> {
        return this.autoLaunchRepository.listPublishedDestinations();
    }

    async listAdminDestinations(): Promise<AutoLaunchAdminDestinationDto[]> {
        const rows = await this.autoLaunchRepository.listAllDestinations();
        return rows.map((row) => toAutoLaunchAdminDestinationDto(row));
    }

    async getAdminDestinationById(destinationId: string): Promise<AutoLaunchAdminDestinationDto> {
        const row = await this.autoLaunchRepository.findDestinationById(destinationId);
        if (!row) {
            throw new AutoLaunchDestinationNotFoundError(destinationId);
        }
        return toAutoLaunchAdminDestinationDto(row);
    }

    async getAdminDestinationByProviderSlug(providerSlug: string): Promise<AutoLaunchAdminDestinationDto | null> {
        const row = await this.autoLaunchRepository.findDestinationByProviderSlug(providerSlug);
        return row ? toAutoLaunchAdminDestinationDto(row) : null;
    }

    async createAdminDestination(body: CreateAdminAutoLaunchDestinationBody): Promise<AutoLaunchAdminDestinationDto> {
        const existing = await this.autoLaunchRepository.findDestinationByProviderSlug(body.providerSlug);
        if (existing) {
            throw new UserValidationError(`A destination with provider slug "${body.providerSlug}" already exists.`);
        }
        const row = await this.autoLaunchRepository.createDestination({
            provider_slug: body.providerSlug,
            link_directory_opportunity_id: body.linkDirectoryOpportunityId ?? null,
            name: body.name,
            short_description: body.shortDescription ?? null,
            submission_path: body.submissionPath ?? "extension",
            start_url: body.startUrl,
            extension_config: body.extensionConfig ?? {},
            is_published: body.isPublished ?? false,
            sort_order: body.sortOrder ?? 0,
            picker_group_key: body.pickerGroupKey ?? null,
            picker_group_title: body.pickerGroupTitle ?? null,
        });
        return toAutoLaunchAdminDestinationDto(row);
    }

    async updateAdminDestination(
        destinationId: string,
        body: UpdateAdminAutoLaunchDestinationBody
    ): Promise<AutoLaunchAdminDestinationDto> {
        const existing = await this.autoLaunchRepository.findDestinationById(destinationId);
        if (!existing) {
            throw new AutoLaunchDestinationNotFoundError(destinationId);
        }
        if (body.providerSlug && body.providerSlug !== existing.provider_slug) {
            const slugTaken = await this.autoLaunchRepository.findDestinationByProviderSlug(body.providerSlug);
            if (slugTaken && slugTaken.id !== destinationId) {
                throw new UserValidationError(`Provider slug "${body.providerSlug}" is already in use.`);
            }
        }
        const patch: Parameters<AutoLaunchRepository["updateDestination"]>[1] = {};
        if (body.providerSlug !== undefined) patch.provider_slug = body.providerSlug;
        if (body.linkDirectoryOpportunityId !== undefined) {
            patch.link_directory_opportunity_id = body.linkDirectoryOpportunityId;
        }
        if (body.name !== undefined) patch.name = body.name;
        if (body.shortDescription !== undefined) patch.short_description = body.shortDescription;
        if (body.submissionPath !== undefined) patch.submission_path = body.submissionPath;
        if (body.startUrl !== undefined) patch.start_url = body.startUrl;
        if (body.extensionConfig !== undefined) patch.extension_config = body.extensionConfig;
        if (body.isPublished !== undefined) patch.is_published = body.isPublished;
        if (body.sortOrder !== undefined) patch.sort_order = body.sortOrder;
        if (body.pickerGroupKey !== undefined) patch.picker_group_key = body.pickerGroupKey;
        if (body.pickerGroupTitle !== undefined) patch.picker_group_title = body.pickerGroupTitle;

        const updated = await this.autoLaunchRepository.updateDestination(destinationId, patch);
        if (!updated) {
            throw new AutoLaunchDestinationNotFoundError(destinationId);
        }
        return toAutoLaunchAdminDestinationDto(updated);
    }

    async deleteAdminDestination(destinationId: string): Promise<void> {
        const existing = await this.autoLaunchRepository.findDestinationById(destinationId);
        if (!existing) {
            throw new AutoLaunchDestinationNotFoundError(destinationId);
        }
        await this.autoLaunchRepository.deleteDestination(destinationId);
    }

    async listProfiles(
        authUserId: string,
        organizationId: string,
        integrationCustomerId?: string
    ): Promise<AutoLaunchProductProfileDto[]> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);
        await this.assertDirectoryLaunchEnabled(organizationId, authUserId);
        const rows = await this.autoLaunchRepository.listProfilesByOrganization(
            organizationId,
            integrationCustomerId
        );
        return this.enrichProfileDtos(organizationId, rows);
    }

    async getProfileForMember(authUserId: string, profileId: string): Promise<AutoLaunchProductProfileDto | null> {
        const row = await this.autoLaunchRepository.findProfileById(profileId);
        if (!row) return null;
        await this.integrationConnectionService.assertOrganizationMember(authUserId, row.organization_id);
        await this.assertDirectoryLaunchEnabled(row.organization_id, authUserId);
        const [dto] = await this.enrichProfileDtos(row.organization_id, [row]);
        return dto ?? null;
    }

    async createDirectoryVariant(
        authUserId: string,
        mainProfileId: string,
        input: { directorySiteKey: string; name?: string }
    ): Promise<AutoLaunchProductProfileDto> {
        const main = await this.autoLaunchRepository.findProfileById(mainProfileId);
        if (!main) {
            throw new AutoLaunchProfileNotFoundError(mainProfileId);
        }
        await this.integrationConnectionService.assertOrganizationMember(authUserId, main.organization_id);
        await this.assertDirectoryLaunchEnabled(main.organization_id, authUserId);
        if (main.profile_kind === "directory_variant" || main.parent_profile_id) {
            throw new UserValidationError("Directory variants must be created from a main product profile.");
        }

        const directorySiteKey = input.directorySiteKey.trim();
        const existing = await this.autoLaunchRepository.findDirectoryVariantByParentAndSiteKey({
            parentProfileId: main.id,
            directorySiteKey,
        });
        if (existing) {
            throw new UserValidationError(
                `A tailored profile for "${directorySiteKey}" already exists for this product.`
            );
        }

        const variantName = input.name?.trim() || `${main.name} (${directorySiteKey})`;
        const variant = await this.autoLaunchRepository.insertDirectoryVariantFromMain({
            mainProfile: main,
            directorySiteKey,
            name: variantName,
            createdByUserId: authUserId,
        });
        const [dto] = await this.enrichProfileDtos(main.organization_id, [variant]);
        return dto!;
    }

    async createProfile(
        authUserId: string,
        input: {
            organizationId: string;
            integrationCustomerId?: string | null;
            name: string;
            tagline?: string | null;
            description?: string | null;
            websiteUrl?: string | null;
            logoUrl?: string | null;
            profileData: Record<string, unknown> | BusinessProfileData;
        }
    ): Promise<AutoLaunchProductProfileDto> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, input.organizationId);
        await this.assertDirectoryLaunchEnabled(input.organizationId, authUserId);
        const integrationCustomerId = await this.resolveIntegrationCustomerIdForNewProfile(
            authUserId,
            input.organizationId,
            input.name,
            input.integrationCustomerId ?? null
        );
        const row = await this.autoLaunchRepository.insertProfile({
            organizationId: input.organizationId,
            integrationCustomerId,
            name: input.name.trim(),
            tagline: input.tagline ?? null,
            description: input.description ?? null,
            websiteUrl: input.websiteUrl ?? null,
            logoUrl: input.logoUrl ?? null,
            profileData: parseBusinessProfileDataInput(
                input.profileData as Record<string, unknown> | undefined
            ),
            createdByUserId: authUserId,
        });
        const [dto] = await this.enrichProfileDtos(input.organizationId, [row]);
        return dto!;
    }

    async listBusinessProfiles(
        authUserId: string,
        organizationId: string
    ): Promise<BusinessProfileListRow[]> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);
        await this.assertDirectoryLaunchEnabled(organizationId, authUserId);
        const customers = await this.integrationConnectionService.getIntegrationCustomers(
            authUserId,
            organizationId
        );
        const profiles = await this.autoLaunchRepository.listProfilesByOrganization(organizationId);
        const profileByCustomerId = new Map(
            profiles
                .filter((p) => p.integration_customer_id)
                .map((p) => [p.integration_customer_id as string, p])
        );

        const rows: BusinessProfileListRow[] = customers.map((customer) => {
            const profile = profileByCustomerId.get(customer.id);
            return {
                integration_customer_id: customer.id,
                product_profile_id: profile?.id ?? null,
                name: profile?.name ?? customer.name,
                tagline: profile?.tagline ?? null,
                website_url: profile?.website_url ?? null,
                logo_url: profile?.logo_url ?? null,
            };
        });

        for (const profile of profiles) {
            if (
                profile.integration_customer_id &&
                customers.some((c) => c.id === profile.integration_customer_id)
            ) {
                continue;
            }
            rows.push({
                integration_customer_id: profile.integration_customer_id,
                product_profile_id: profile.id,
                name: profile.name,
                tagline: profile.tagline,
                website_url: profile.website_url,
                logo_url: profile.logo_url,
            });
        }

        rows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
        return rows;
    }

    async updateProfile(
        authUserId: string,
        profileId: string,
        patch: {
            name?: string;
            tagline?: string | null;
            description?: string | null;
            websiteUrl?: string | null;
            logoUrl?: string | null;
            integrationCustomerId?: string | null;
            profileData?: Record<string, unknown> | BusinessProfileData;
        }
    ): Promise<AutoLaunchProductProfileDto> {
        const existing = await this.autoLaunchRepository.findProfileById(profileId);
        if (!existing) {
            throw new AutoLaunchProfileNotFoundError(profileId);
        }
        await this.integrationConnectionService.assertOrganizationMember(authUserId, existing.organization_id);
        await this.assertDirectoryLaunchEnabled(existing.organization_id, authUserId);

        if (patch.integrationCustomerId === null) {
            throw new UserValidationError("Business profile must stay linked to a channel group");
        }

        const nextCustomerId = patch.integrationCustomerId ?? existing.integration_customer_id;
        if (nextCustomerId) {
            const ok = await this.autoLaunchRepository.integrationCustomerBelongsToOrg(
                nextCustomerId,
                existing.organization_id
            );
            if (!ok) {
                throw new UserValidationError("Channel group does not belong to this workspace");
            }
            const conflict = await this.autoLaunchRepository.findActiveProfileByIntegrationCustomerId(
                existing.organization_id,
                nextCustomerId,
                profileId
            );
            if (conflict) {
                throw new UserValidationError("Another business profile is already linked to this channel group");
            }
        }

        const nextProfileData =
            patch.profileData !== undefined
                ? mergeBusinessProfileData(
                      existing.profile_data,
                      parseBusinessProfileDataPatch(patch.profileData as Record<string, unknown>)
                  )
                : undefined;

        const updated = await this.autoLaunchRepository.updateProfile({
            profileId,
            organizationId: existing.organization_id,
            patch: {
                name: patch.name,
                tagline: patch.tagline,
                description: patch.description,
                websiteUrl: patch.websiteUrl,
                logoUrl: patch.logoUrl,
                integrationCustomerId: patch.integrationCustomerId,
                profileData: nextProfileData,
            },
        });
        if (!updated) {
            throw new AutoLaunchProfileNotFoundError(profileId);
        }

        const customerIdToSync = updated.integration_customer_id;
        if (patch.name?.trim() && customerIdToSync) {
            await this.integrationConnectionService.updateIntegrationCustomerName(
                authUserId,
                existing.organization_id,
                customerIdToSync,
                patch.name.trim()
            );
        }

        const [dto] = await this.enrichProfileDtos(existing.organization_id, [updated]);
        return dto!;
    }

    async deleteProfile(authUserId: string, profileId: string): Promise<void> {
        const existing = await this.autoLaunchRepository.findProfileById(profileId);
        if (!existing) {
            throw new AutoLaunchProfileNotFoundError(profileId);
        }
        await this.integrationConnectionService.assertOrganizationMember(authUserId, existing.organization_id);
        await this.assertDirectoryLaunchEnabled(existing.organization_id, authUserId);
        const ok = await this.autoLaunchRepository.softDeleteProfile(profileId, existing.organization_id);
        if (!ok) {
            throw new AutoLaunchProfileNotFoundError(profileId);
        }
        // Channel group (`integration_customers`) is kept so linked social channels stay grouped.
    }

    private async resolveIntegrationCustomerIdForNewProfile(
        authUserId: string,
        organizationId: string,
        name: string,
        explicitCustomerId: string | null
    ): Promise<string> {
        const trimmedName = name.trim();
        if (!trimmedName) {
            throw new UserValidationError("Business profile name is required");
        }

        if (explicitCustomerId) {
            const ok = await this.autoLaunchRepository.integrationCustomerBelongsToOrg(
                explicitCustomerId,
                organizationId
            );
            if (!ok) {
                throw new UserValidationError("Channel group does not belong to this workspace");
            }
            const existing = await this.autoLaunchRepository.findActiveProfileByIntegrationCustomerId(
                organizationId,
                explicitCustomerId
            );
            if (existing) {
                throw new UserValidationError("A business profile already exists for this channel group");
            }
            return explicitCustomerId;
        }

        const byName = await this.integrationConnectionService.findIntegrationCustomerByOrgAndName(
            organizationId,
            trimmedName
        );
        if (byName) {
            const existing = await this.autoLaunchRepository.findActiveProfileByIntegrationCustomerId(
                organizationId,
                byName.id
            );
            if (existing) {
                throw new UserValidationError("A business profile with this name already exists");
            }
            return byName.id;
        }

        const created = await this.integrationConnectionService.createIntegrationCustomer(
            authUserId,
            organizationId,
            trimmedName
        );
        return created.id;
    }

    async listSubmissions(
        authUserId: string,
        organizationId: string,
        filters: { productProfileId?: string; destinationId?: string }
    ): Promise<AutoLaunchSubmissionDto[]> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);
        await this.assertDirectoryLaunchEnabled(organizationId, authUserId);
        const rows = await this.autoLaunchRepository.listSubmissions({
            organizationId,
            productProfileId: filters.productProfileId,
            destinationId: filters.destinationId,
        });
        const deduped = dedupeAutoLaunchSubmissionsByDestination(rows);
        const profileIds = deduped.map((row) => row.product_profile_id);
        const profiles = await this.autoLaunchRepository.findProfilesByIds({
            organizationId,
            profileIds,
        });
        const liveSnapshotByProfileId = new Map(
            profiles.map((profile) => [profile.id, buildProfileSnapshot(profile)])
        );

        const syncStatusBySubmissionId = new Map(
            deduped.map((row) => [
                row.id,
                resolveSubmissionSyncStatus(
                    row,
                    liveSnapshotByProfileId.get(row.product_profile_id) ?? null
                ),
            ])
        );

        return toAutoLaunchSubmissionDtoCollection(deduped, { syncStatusBySubmissionId });
    }

    async recordManualSubmissionComplete(
        authUserId: string,
        input: RecordManualSubmissionCompleteBody
    ): Promise<AutoLaunchSubmissionRow> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, input.organizationId);
        await this.assertDirectoryLaunchEnabled(input.organizationId, authUserId);

        const destination = await this.autoLaunchRepository.findDestinationById(input.destinationId);
        if (!destination?.is_published) {
            throw new AutoLaunchDestinationNotFoundError(input.destinationId);
        }

        const profile = await this.resolveProductProfileForLaunch(
            input.organizationId,
            input.productProfileId,
            destination
        );

        const destinationListRow = await this.autoLaunchRepository.findDestinationListRowById(destination.id);
        const opportunityDofollow = normalizeOpportunityDofollow(
            destinationListRow?.opportunity_dofollow
        );
        const listingEvidence = applyTrustedListingDofollowOnComplete(
            buildManualListingEvidence({
                listingDofollow: input.listingDofollow,
                authEmail: input.authEmail ?? null,
            }),
            opportunityDofollow
        );

        const profileSnapshot = buildProfileSnapshot(profile);
        const extensionConfig = destination.extension_config ?? {};
        const listingProfileFingerprint = computeListingFingerprintForSubmission(
            profileSnapshot,
            extensionConfig
        );
        const listingUrl = input.listingUrl ?? null;

        const existingCompleted =
            await this.autoLaunchRepository.findLatestSubmissionForProductDestination({
                organizationId: input.organizationId,
                productProfileId: profile.id,
                destinationId: destination.id,
                statuses: ["completed"],
            });
        if (existingCompleted) {
            if (
                isCompletedSubmissionListingStale(existingCompleted, profileSnapshot)
            ) {
                const synced = await this.autoLaunchRepository.updateCompletedSubmissionListingSync({
                    submissionId: existingCompleted.id,
                    organizationId: input.organizationId,
                    profileSnapshot,
                    extensionConfigSnapshot: extensionConfig,
                    listingProfileFingerprint,
                    listingUrl: input.listingUrl ?? undefined,
                    completedByUserId: authUserId,
                });
                return this.autoLaunchRepository.updateSubmissionListingDetails({
                    submissionId: synced.id,
                    organizationId: input.organizationId,
                    listingUrl,
                    evidence: mergeSubmissionListingEvidence(synced.evidence, listingEvidence),
                    completedByUserId: authUserId,
                });
            }
            return this.autoLaunchRepository.updateSubmissionListingDetails({
                submissionId: existingCompleted.id,
                organizationId: input.organizationId,
                listingUrl,
                evidence: mergeSubmissionListingEvidence(existingCompleted.evidence, listingEvidence),
                completedByUserId: authUserId,
            });
        }

        const openSubmission =
            await this.autoLaunchRepository.findLatestSubmissionForProductDestination({
                organizationId: input.organizationId,
                productProfileId: profile.id,
                destinationId: destination.id,
                statuses: AUTO_LAUNCH_OPEN_SUBMISSION_STATUSES,
            });
        if (openSubmission) {
            const completed = await this.autoLaunchRepository.completeSubmission({
                submissionId: openSubmission.id,
                organizationId: input.organizationId,
                profileSnapshot,
                listingProfileFingerprint,
                evidence: listingEvidence,
                listingUrl,
                completedByUserId: authUserId,
            });
            if (completed) {
                return completed;
            }
            const after = await this.autoLaunchRepository.findSubmissionById(openSubmission.id);
            if (after) {
                return after;
            }
        }

        return this.autoLaunchRepository.insertManualCompletedSubmission({
            organizationId: input.organizationId,
            productProfileId: profile.id,
            destinationId: destination.id,
            profileSnapshot,
            extensionConfigSnapshot: extensionConfig,
            listingProfileFingerprint,
            listingUrl,
            evidence: listingEvidence,
            createdByUserId: authUserId,
        });
    }

    async deleteCompletedSubmission(
        authUserId: string,
        submissionId: string,
        organizationId: string
    ): Promise<void> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, organizationId);
        await this.assertDirectoryLaunchEnabled(organizationId, authUserId);

        const submission = await this.autoLaunchRepository.findSubmissionById(submissionId);
        if (!submission || submission.organization_id !== organizationId) {
            throw new AutoLaunchSubmissionNotFoundError(submissionId);
        }
        if (submission.status !== "completed") {
            throw new AutoLaunchIntentNotAvailableError(
                "Only completed directory launches can be removed."
            );
        }

        await this.autoLaunchRepository.deleteSubmission(submissionId, organizationId);
    }

    async updateSubmissionListingDetails(
        authUserId: string,
        submissionId: string,
        input: UpdateSubmissionListingDetailsBody
    ): Promise<AutoLaunchSubmissionRow> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, input.organizationId);
        await this.assertDirectoryLaunchEnabled(input.organizationId, authUserId);

        const submission = await this.autoLaunchRepository.findSubmissionById(submissionId);
        if (!submission || submission.organization_id !== input.organizationId) {
            throw new AutoLaunchSubmissionNotFoundError(submissionId);
        }

        const listingUrl =
            input.listingUrl !== undefined ? (input.listingUrl ?? null) : submission.listing_url;

        return this.autoLaunchRepository.updateSubmissionListingDetails({
            submissionId,
            organizationId: input.organizationId,
            listingUrl,
            evidence: mergeSubmissionListingEvidence(submission.evidence, {
                listingDofollow: input.listingDofollow,
                authEmail: input.authEmail ?? null,
            }),
            completedByUserId: authUserId,
        });
    }

    async createSubmissionIntent(
        authUserId: string,
        input: {
            organizationId: string;
            productProfileId: string;
            destinationId?: string;
            providerSlug?: string;
        }
    ): Promise<AutoLaunchSubmissionIntentDto> {
        await this.integrationConnectionService.assertOrganizationMember(authUserId, input.organizationId);
        await this.assertDirectoryLaunchEnabled(input.organizationId, authUserId);

        const destination = await this.resolveDestination(input.destinationId, input.providerSlug);
        const profile = await this.resolveProductProfileForLaunch(
            input.organizationId,
            input.productProfileId,
            destination
        );
        if (!destination.is_published) {
            throw new AutoLaunchDestinationNotFoundError(destination.id);
        }
        if (destination.submission_path !== "extension") {
            throw new AutoLaunchIntentNotAvailableError(
                "This destination does not support extension launch yet"
            );
        }

        const profileSnapshot = buildProfileSnapshot(profile);
        const extensionConfig = destination.extension_config ?? {};

        const openSubmission =
            await this.autoLaunchRepository.findLatestSubmissionForProductDestination({
                organizationId: input.organizationId,
                productProfileId: profile.id,
                destinationId: destination.id,
                statuses: AUTO_LAUNCH_OPEN_SUBMISSION_STATUSES,
            });

        let submission: AutoLaunchSubmissionRow;
        if (openSubmission) {
            submission = await this.autoLaunchRepository.refreshSubmissionIntent({
                submissionId: openSubmission.id,
                organizationId: input.organizationId,
                profileSnapshot,
                extensionConfigSnapshot: extensionConfig,
            });
        } else {
            const latestCompleted =
                await this.autoLaunchRepository.findLatestSubmissionForProductDestination({
                    organizationId: input.organizationId,
                    productProfileId: profile.id,
                    destinationId: destination.id,
                    statuses: ["completed"],
                });
            if (
                latestCompleted &&
                isCompletedSubmissionListingStale(latestCompleted, profileSnapshot)
            ) {
                submission = await this.autoLaunchRepository.reopenSubmissionForResync({
                    submissionId: latestCompleted.id,
                    organizationId: input.organizationId,
                    profileSnapshot,
                    extensionConfigSnapshot: extensionConfig,
                });
            } else {
                submission = await this.autoLaunchRepository.insertSubmissionIntent({
                    organizationId: input.organizationId,
                    productProfileId: profile.id,
                    destinationId: destination.id,
                    profileSnapshot,
                    extensionConfigSnapshot: extensionConfig,
                    createdByUserId: authUserId,
                });
            }
        }

        const secret = launchTokenSecret();
        const launchToken = signLaunchToken(
            {
                submissionId: submission.id,
                organizationId: input.organizationId,
                destinationId: destination.id,
                providerSlug: destination.provider_slug,
            },
            secret
        );

        return toSubmissionIntentDto({
            submissionId: submission.id,
            launchToken,
            destination,
            profileSnapshot,
        });
    }

    async completeSubmission(
        authUserId: string,
        input: {
            launchToken: string;
            evidence: Record<string, unknown>;
            listingUrl?: string;
        }
    ): Promise<AutoLaunchSubmissionCompleteDto> {
        const secret = launchTokenSecret();
        const payload = verifyLaunchToken(input.launchToken, secret);
        if (!payload) {
            throw new AutoLaunchTokenInvalidError();
        }

        await this.integrationConnectionService.assertOrganizationMember(authUserId, payload.organizationId);
        await this.assertDirectoryLaunchEnabled(payload.organizationId, authUserId);

        const existing = await this.autoLaunchRepository.findSubmissionById(payload.submissionId);
        if (!existing || existing.organization_id !== payload.organizationId) {
            throw new AutoLaunchSubmissionNotFoundError(payload.submissionId);
        }

        if (existing.status === "completed") {
            return {
                submissionId: existing.id,
                status: existing.status,
                listingUrl: existing.listing_url,
                alreadyCompleted: true,
            };
        }

        const profile = await this.autoLaunchRepository.findProfileById(existing.product_profile_id);
        if (!profile || profile.organization_id !== payload.organizationId) {
            throw new AutoLaunchProfileNotFoundError(existing.product_profile_id);
        }

        const profileSnapshot = buildProfileSnapshot(profile);
        const listingProfileFingerprint = computeListingFingerprintForSubmission(
            profileSnapshot,
            existing.extension_config_snapshot
        );

        const listingUrl = input.listingUrl ?? existing.listing_url;
        const destinationListRow = await this.autoLaunchRepository.findDestinationListRowById(
            existing.destination_id
        );
        const opportunityDofollow = normalizeOpportunityDofollow(
            destinationListRow?.opportunity_dofollow
        );
        const evidence = applyTrustedListingDofollowOnComplete(
            input.evidence ?? {},
            opportunityDofollow
        );

        const updated = await this.autoLaunchRepository.completeSubmission({
            submissionId: existing.id,
            organizationId: payload.organizationId,
            profileSnapshot,
            listingProfileFingerprint,
            evidence,
            listingUrl: listingUrl ?? null,
            completedByUserId: authUserId,
        });

        if (updated) {
            return {
                submissionId: updated.id,
                status: updated.status,
                listingUrl: updated.listing_url,
                alreadyCompleted: false,
            };
        }

        const after = await this.autoLaunchRepository.findSubmissionById(existing.id);
        if (after?.status === "completed") {
            return {
                submissionId: after.id,
                status: after.status,
                listingUrl: after.listing_url,
                alreadyCompleted: true,
            };
        }

        throw new AutoLaunchSubmissionNotFoundError(existing.id);
    }

    private async enrichProfileDtos(
        organizationId: string,
        rows: AutoLaunchProductProfileRow[]
    ): Promise<AutoLaunchProductProfileDto[]> {
        const parentIds = [
            ...new Set(
                rows
                    .map((row) => row.parent_profile_id)
                    .filter((id): id is string => Boolean(id))
            ),
        ];
        const mains =
            parentIds.length > 0
                ? await this.autoLaunchRepository.findProfilesByIds({
                      organizationId,
                      profileIds: parentIds,
                  })
                : [];
        const mainById = new Map(mains.map((main) => [main.id, main]));
        return toAutoLaunchProductProfileDtoCollection(rows, mainById);
    }

    private async resolveProductProfileForLaunch(
        organizationId: string,
        productProfileId: string,
        destination: AutoLaunchDestinationRow
    ): Promise<AutoLaunchProductProfileRow> {
        const profile = await this.autoLaunchRepository.findProfileById(productProfileId);
        if (!profile || profile.organization_id !== organizationId) {
            throw new AutoLaunchProfileNotFoundError(productProfileId);
        }

        if (profile.profile_kind === "directory_variant") {
            return profile;
        }

        const siteKey = directorySiteKeyFromProviderSlug(destination.provider_slug);
        const variant = await this.autoLaunchRepository.findDirectoryVariantByParentAndSiteKey({
            parentProfileId: profile.id,
            directorySiteKey: siteKey,
        });
        return variant ?? profile;
    }

    private async resolveDestination(destinationId?: string, providerSlug?: string) {
        if (destinationId) {
            const row = await this.autoLaunchRepository.findDestinationById(destinationId);
            if (!row) {
                throw new AutoLaunchDestinationNotFoundError(destinationId);
            }
            return row;
        }
        if (providerSlug) {
            const row = await this.autoLaunchRepository.findPublishedDestinationByProviderSlug(providerSlug);
            if (!row) {
                throw new AutoLaunchDestinationNotFoundError(providerSlug);
            }
            return row;
        }
        throw new UserValidationError("destinationId or providerSlug is required");
    }

    async listProfilesProgrammatic(
        organizationId: string,
        integrationCustomerId?: string
    ): Promise<AutoLaunchProductProfileDto[]> {
        const rows = await this.autoLaunchRepository.listProfilesByOrganization(
            organizationId,
            integrationCustomerId
        );
        return this.enrichProfileDtos(organizationId, rows);
    }

    async getProfileProgrammatic(
        organizationId: string,
        profileId: string
    ): Promise<AutoLaunchProductProfileDto | null> {
        const row = await this.autoLaunchRepository.findProfileById(profileId);
        if (!row || row.organization_id !== organizationId) {
            return null;
        }
        const [dto] = await this.enrichProfileDtos(organizationId, [row]);
        return dto ?? null;
    }

    async createProfileProgrammatic(
        publicUserId: string,
        input: {
            organizationId: string;
            integrationCustomerId?: string | null;
            name: string;
            tagline?: string | null;
            description?: string | null;
            websiteUrl?: string | null;
            logoUrl?: string | null;
            profileData: Record<string, unknown> | BusinessProfileData;
        }
    ): Promise<AutoLaunchProductProfileDto> {
        const integrationCustomerId = await this.resolveIntegrationCustomerIdForProgrammaticProfile(
            input.organizationId,
            input.name,
            input.integrationCustomerId ?? null
        );
        const row = await this.autoLaunchRepository.insertProfile({
            organizationId: input.organizationId,
            integrationCustomerId,
            name: input.name.trim(),
            tagline: input.tagline ?? null,
            description: input.description ?? null,
            websiteUrl: input.websiteUrl ?? null,
            logoUrl: input.logoUrl ?? null,
            profileData: parseBusinessProfileDataInput(
                input.profileData as Record<string, unknown> | undefined
            ),
            createdByUserId: publicUserId,
        });
        const [dto] = await this.enrichProfileDtos(input.organizationId, [row]);
        return dto!;
    }

    async updateProfileProgrammatic(
        organizationId: string,
        profileId: string,
        patch: {
            name?: string;
            tagline?: string | null;
            description?: string | null;
            websiteUrl?: string | null;
            logoUrl?: string | null;
            integrationCustomerId?: string | null;
            profileData?: Record<string, unknown> | BusinessProfileData;
        }
    ): Promise<AutoLaunchProductProfileDto> {
        const existing = await this.autoLaunchRepository.findProfileById(profileId);
        if (!existing || existing.organization_id !== organizationId) {
            throw new AutoLaunchProfileNotFoundError(profileId);
        }

        if (patch.integrationCustomerId === null) {
            throw new UserValidationError("Business profile must stay linked to a channel group");
        }

        const nextCustomerId = patch.integrationCustomerId ?? existing.integration_customer_id;
        if (nextCustomerId) {
            const ok = await this.autoLaunchRepository.integrationCustomerBelongsToOrg(
                nextCustomerId,
                organizationId
            );
            if (!ok) {
                throw new UserValidationError("Channel group does not belong to this workspace");
            }
            const conflict = await this.autoLaunchRepository.findActiveProfileByIntegrationCustomerId(
                organizationId,
                nextCustomerId,
                profileId
            );
            if (conflict) {
                throw new UserValidationError("Another business profile is already linked to this channel group");
            }
        }

        const nextProfileData =
            patch.profileData !== undefined
                ? mergeBusinessProfileData(
                      existing.profile_data,
                      parseBusinessProfileDataPatch(patch.profileData as Record<string, unknown>)
                  )
                : undefined;

        const updated = await this.autoLaunchRepository.updateProfile({
            profileId,
            organizationId,
            patch: {
                name: patch.name,
                tagline: patch.tagline,
                description: patch.description,
                websiteUrl: patch.websiteUrl,
                logoUrl: patch.logoUrl,
                integrationCustomerId: patch.integrationCustomerId,
                profileData: nextProfileData,
            },
        });
        if (!updated) {
            throw new AutoLaunchProfileNotFoundError(profileId);
        }

        const customerIdToSync = updated.integration_customer_id;
        if (patch.name?.trim() && customerIdToSync) {
            await this.integrationConnectionService.publicUpdateIntegrationCustomerName(
                organizationId,
                customerIdToSync,
                patch.name.trim()
            );
        }

        const [dto] = await this.enrichProfileDtos(organizationId, [updated]);
        return dto!;
    }

    async ensureDirectoryVariantProgrammatic(
        organizationId: string,
        publicUserId: string,
        mainProfileId: string,
        input: { directorySiteKey: string; name?: string }
    ): Promise<{ profile: AutoLaunchProductProfileDto; created: boolean }> {
        const main = await this.autoLaunchRepository.findProfileById(mainProfileId);
        if (!main || main.organization_id !== organizationId) {
            throw new AutoLaunchProfileNotFoundError(mainProfileId);
        }
        if (main.profile_kind === "directory_variant" || main.parent_profile_id) {
            throw new UserValidationError("Directory variants must be created from a main product profile.");
        }

        const directorySiteKey = input.directorySiteKey.trim();
        const existing = await this.autoLaunchRepository.findDirectoryVariantByParentAndSiteKey({
            parentProfileId: main.id,
            directorySiteKey,
        });
        if (existing) {
            const [dto] = await this.enrichProfileDtos(organizationId, [existing]);
            return { profile: dto!, created: false };
        }

        const variantName = input.name?.trim() || `${main.name} (${directorySiteKey})`;
        const variant = await this.autoLaunchRepository.insertDirectoryVariantFromMain({
            mainProfile: main,
            directorySiteKey,
            name: variantName,
            createdByUserId: publicUserId,
        });
        const [dto] = await this.enrichProfileDtos(organizationId, [variant]);
        return { profile: dto!, created: true };
    }

    async listBusinessProfilesProgrammatic(organizationId: string): Promise<BusinessProfileListRow[]> {
        const customers = await this.integrationConnectionService.publicGetIntegrationCustomers(
            organizationId
        );
        const profiles = await this.autoLaunchRepository.listProfilesByOrganization(organizationId);
        const profileByCustomerId = new Map(
            profiles
                .filter((p) => p.integration_customer_id)
                .map((p) => [p.integration_customer_id as string, p])
        );

        const rows: BusinessProfileListRow[] = customers.map((customer) => {
            const profile = profileByCustomerId.get(customer.id);
            return {
                integration_customer_id: customer.id,
                product_profile_id: profile?.id ?? null,
                name: profile?.name ?? customer.name,
                tagline: profile?.tagline ?? null,
                website_url: profile?.website_url ?? null,
                logo_url: profile?.logo_url ?? null,
            };
        });

        for (const profile of profiles) {
            if (
                profile.integration_customer_id &&
                customers.some((c) => c.id === profile.integration_customer_id)
            ) {
                continue;
            }
            rows.push({
                integration_customer_id: profile.integration_customer_id,
                product_profile_id: profile.id,
                name: profile.name,
                tagline: profile.tagline,
                website_url: profile.website_url,
                logo_url: profile.logo_url,
            });
        }

        rows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
        return rows;
    }

    async listSubmissionsProgrammatic(
        organizationId: string,
        filters: { productProfileId?: string; destinationId?: string }
    ): Promise<AutoLaunchSubmissionDto[]> {
        const rows = await this.autoLaunchRepository.listSubmissions({
            organizationId,
            productProfileId: filters.productProfileId,
            destinationId: filters.destinationId,
        });
        const deduped = dedupeAutoLaunchSubmissionsByDestination(rows);
        const profileIds = deduped.map((row) => row.product_profile_id);
        const profiles = await this.autoLaunchRepository.findProfilesByIds({
            organizationId,
            profileIds,
        });
        const liveSnapshotByProfileId = new Map(
            profiles.map((profile) => [profile.id, buildProfileSnapshot(profile)])
        );

        const syncStatusBySubmissionId = new Map(
            deduped.map((row) => [
                row.id,
                resolveSubmissionSyncStatus(
                    row,
                    liveSnapshotByProfileId.get(row.product_profile_id) ?? null
                ),
            ])
        );

        return toAutoLaunchSubmissionDtoCollection(deduped, { syncStatusBySubmissionId });
    }

    async getProfileListingSummaryForOrganization(
        organizationId: string,
        profileId: string
    ): Promise<AutoLaunchProfileListingSummaryDto> {
        const profile = await this.autoLaunchRepository.findProfileById(profileId);
        if (!profile || profile.organization_id !== organizationId) {
            throw new AutoLaunchProfileNotFoundError(profileId);
        }

        const destinationRows = await this.autoLaunchRepository.listPublishedDestinations();
        const destinations: ProfileLaunchDestinationInput[] = destinationRows.map((row) => ({
            id: row.id,
            providerSlug: row.provider_slug,
            name: row.name,
            sortOrder: row.sort_order,
            extensionConfig: row.extension_config ?? {},
        }));

        const submissionRows = await this.autoLaunchRepository.listSubmissions({
            organizationId,
            productProfileId: profileId,
        });
        const deduped = dedupeAutoLaunchSubmissionsByDestination(submissionRows);
        const profiles = await this.autoLaunchRepository.findProfilesByIds({
            organizationId,
            profileIds: [profileId],
        });
        const liveSnapshot =
            profiles[0] ? buildProfileSnapshot(profiles[0]) : buildProfileSnapshot(profile);
        const syncStatusBySubmissionId = new Map(
            deduped.map((row) => [
                row.id,
                resolveSubmissionSyncStatus(row, liveSnapshot),
            ])
        );
        const submissionDtos = toAutoLaunchSubmissionDtoCollection(deduped, {
            syncStatusBySubmissionId,
        });
        const submissionInputs: ProfileLaunchSubmissionInput[] = submissionDtos.map((submission) => ({
            destinationId: submission.destinationId,
            status: submission.status,
            syncStatus: submission.syncStatus,
            completedAt: submission.completedAt,
            updatedAt: submission.updatedAt,
        }));

        const summary = getProfileLaunchSummary(
            buildProfileSnapshot(profile),
            destinations,
            submissionInputs
        );

        const unsubmittedDirectorySiteCount = Math.max(
            0,
            summary.publishedDirectorySiteCount - summary.submittedDirectorySiteCount
        );

        return {
            profileId,
            publishedDirectorySiteCount: summary.publishedDirectorySiteCount,
            submittedDirectorySiteCount: summary.submittedDirectorySiteCount,
            unsubmittedDirectorySiteCount,
            destinations: summary.destinations.map((row) => ({
                destinationId: row.destinationId,
                providerSlug: row.providerSlug,
                destinationName: row.destinationName,
                submissionStatus: row.submissionStatus,
                syncStatus: row.syncStatus,
                readiness: {
                    isReady: row.readiness.isReady,
                    missingFields: row.readiness.missingFields,
                },
            })),
        };
    }

    private async resolveIntegrationCustomerIdForProgrammaticProfile(
        organizationId: string,
        name: string,
        explicitCustomerId: string | null
    ): Promise<string> {
        const trimmedName = name.trim();
        if (!trimmedName) {
            throw new UserValidationError("Business profile name is required");
        }

        if (explicitCustomerId) {
            const ok = await this.autoLaunchRepository.integrationCustomerBelongsToOrg(
                explicitCustomerId,
                organizationId
            );
            if (!ok) {
                throw new UserValidationError("Channel group does not belong to this workspace");
            }
            const existing = await this.autoLaunchRepository.findActiveProfileByIntegrationCustomerId(
                organizationId,
                explicitCustomerId
            );
            if (existing) {
                throw new UserValidationError("A business profile already exists for this channel group");
            }
            return explicitCustomerId;
        }

        const byName = await this.integrationConnectionService.findIntegrationCustomerByOrgAndName(
            organizationId,
            trimmedName
        );
        if (byName) {
            const existing = await this.autoLaunchRepository.findActiveProfileByIntegrationCustomerId(
                organizationId,
                byName.id
            );
            if (existing) {
                throw new UserValidationError("A business profile with this name already exists");
            }
            return byName.id;
        }

        const created = await this.integrationConnectionService.publicCreateIntegrationCustomer(
            organizationId,
            trimmedName
        );
        return created.id;
    }
}

function normalizeOpportunityDofollow(value: string | null | undefined): CatalogOpportunityDofollow {
    if (value === "dofollow" || value === "nofollow" || value === "unknown") return value;
    return null;
}
