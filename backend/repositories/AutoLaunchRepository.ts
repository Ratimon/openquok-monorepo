import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    AutoLaunchDestinationListRow,
    AutoLaunchDestinationRow,
    AutoLaunchExtensionConfig,
    AutoLaunchProductProfileRow,
    AutoLaunchSubmissionRow,
    AutoLaunchSubmissionStatus,
} from "../data/types/autoLaunchTypes";
import { DatabaseError } from "../errors/InfraError";

const PROFILES_TABLE = "auto_launch_product_profiles";
const DESTINATIONS_TABLE = "auto_launch_destinations";
const SUBMISSIONS_TABLE = "auto_launch_submissions";

const PROFILE_COLS =
    "id, organization_id, integration_customer_id, name, tagline, description, website_url, logo_url, profile_data, created_at, updated_at, created_by_user_id, deleted_at";

const DESTINATION_COLS =
    "id, provider_slug, link_directory_opportunity_id, name, short_description, submission_path, start_url, extension_config, is_published, sort_order, picker_group_key, picker_group_title, created_at, updated_at";

const SUBMISSION_COLS =
    "id, organization_id, product_profile_id, destination_id, status, profile_snapshot, extension_config_snapshot, evidence, listing_url, intent_created_at, completed_at, created_by_user_id, completed_by_user_id, listing_profile_fingerprint, listing_synced_at, created_at, updated_at";

type DestinationJoinRow = AutoLaunchDestinationRow & {
    link_directory_opportunity?: {
        title?: string | null;
        description?: string | null;
        dofollow?: string | null;
        cost_tier?: string | null;
        cost_note?: string | null;
        site?: { title?: string | null; domain_rating?: number | null } | null;
    } | null;
};

const DESTINATION_OPPORTUNITY_JOIN =
    "title, description, dofollow, cost_tier, cost_note, site:link_directory_sites(title, domain_rating)";

function mapDestinationListRow(row: DestinationJoinRow): AutoLaunchDestinationListRow {
    const opp = row.link_directory_opportunity;
    const site = opp?.site;
    return {
        ...row,
        extension_config: (row.extension_config ?? {}) as AutoLaunchExtensionConfig,
        opportunity_title: opp?.title ?? null,
        opportunity_description: opp?.description ?? null,
        opportunity_dofollow: opp?.dofollow ?? null,
        opportunity_cost_tier: opp?.cost_tier ?? null,
        opportunity_cost_note: opp?.cost_note ?? null,
        site_title: site?.title ?? null,
        site_domain_rating: site?.domain_rating ?? null,
    };
}

export class AutoLaunchRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async listPublishedDestinations(): Promise<AutoLaunchDestinationListRow[]> {
        const { data, error } = await this.supabase
            .from(DESTINATIONS_TABLE)
            .select(
                `${DESTINATION_COLS}, link_directory_opportunity:link_directory_opportunities(${DESTINATION_OPPORTUNITY_JOIN})`
            )
            .eq("is_published", true)
            .order("sort_order", { ascending: true });

        if (error) {
            throw new DatabaseError("Error listing auto-launch destinations", {
                cause: error as unknown as Error,
                operation: "listPublishedDestinations",
                resource: { type: "table", name: DESTINATIONS_TABLE },
            });
        }
        return ((data ?? []) as DestinationJoinRow[]).map(mapDestinationListRow);
    }

    async findDestinationById(destinationId: string): Promise<AutoLaunchDestinationRow | null> {
        const { data, error } = await this.supabase
            .from(DESTINATIONS_TABLE)
            .select(DESTINATION_COLS)
            .eq("id", destinationId)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Error finding auto-launch destination", {
                cause: error as unknown as Error,
                operation: "findDestinationById",
                resource: { type: "table", name: DESTINATIONS_TABLE },
            });
        }
        if (!data) return null;
        return {
            ...(data as AutoLaunchDestinationRow),
            extension_config: ((data as AutoLaunchDestinationRow).extension_config ??
                {}) as AutoLaunchExtensionConfig,
        };
    }

    async findPublishedDestinationByProviderSlug(providerSlug: string): Promise<AutoLaunchDestinationRow | null> {
        const { data, error } = await this.supabase
            .from(DESTINATIONS_TABLE)
            .select(DESTINATION_COLS)
            .eq("provider_slug", providerSlug)
            .eq("is_published", true)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Error finding auto-launch destination by slug", {
                cause: error as unknown as Error,
                operation: "findPublishedDestinationByProviderSlug",
                resource: { type: "table", name: DESTINATIONS_TABLE },
            });
        }
        if (!data) return null;
        return {
            ...(data as AutoLaunchDestinationRow),
            extension_config: ((data as AutoLaunchDestinationRow).extension_config ??
                {}) as AutoLaunchExtensionConfig,
        };
    }

    async listProfilesByOrganization(
        organizationId: string,
        integrationCustomerId?: string
    ): Promise<AutoLaunchProductProfileRow[]> {
        let query = this.supabase
            .from(PROFILES_TABLE)
            .select(PROFILE_COLS)
            .eq("organization_id", organizationId)
            .is("deleted_at", null)
            .order("updated_at", { ascending: false });

        if (integrationCustomerId) {
            query = query.eq("integration_customer_id", integrationCustomerId);
        }

        const { data, error } = await query;

        if (error) {
            throw new DatabaseError("Error listing auto-launch product profiles", {
                cause: error as unknown as Error,
                operation: "listProfilesByOrganization",
                resource: { type: "table", name: PROFILES_TABLE },
            });
        }
        return (data ?? []) as AutoLaunchProductProfileRow[];
    }

    async findActiveProfileByIntegrationCustomerId(
        organizationId: string,
        integrationCustomerId: string,
        exceptProfileId?: string
    ): Promise<AutoLaunchProductProfileRow | null> {
        let query = this.supabase
            .from(PROFILES_TABLE)
            .select(PROFILE_COLS)
            .eq("organization_id", organizationId)
            .eq("integration_customer_id", integrationCustomerId)
            .is("deleted_at", null);

        if (exceptProfileId) {
            query = query.neq("id", exceptProfileId);
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
            throw new DatabaseError("Error resolving product profile for channel group", {
                cause: error as unknown as Error,
                operation: "findActiveProfileByIntegrationCustomerId",
                resource: { type: "table", name: PROFILES_TABLE },
            });
        }
        return (data ?? null) as AutoLaunchProductProfileRow | null;
    }

    async findProfileById(profileId: string): Promise<AutoLaunchProductProfileRow | null> {
        const { data, error } = await this.supabase
            .from(PROFILES_TABLE)
            .select(PROFILE_COLS)
            .eq("id", profileId)
            .is("deleted_at", null)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Error finding auto-launch product profile", {
                cause: error as unknown as Error,
                operation: "findProfileById",
                resource: { type: "table", name: PROFILES_TABLE },
            });
        }
        return (data ?? null) as AutoLaunchProductProfileRow | null;
    }

    async findProfilesByIds(params: {
        organizationId: string;
        profileIds: string[];
    }): Promise<AutoLaunchProductProfileRow[]> {
        const uniqueIds = [...new Set(params.profileIds)].filter(Boolean);
        if (uniqueIds.length === 0) {
            return [];
        }

        const { data, error } = await this.supabase
            .from(PROFILES_TABLE)
            .select(PROFILE_COLS)
            .eq("organization_id", params.organizationId)
            .in("id", uniqueIds)
            .is("deleted_at", null);

        if (error) {
            throw new DatabaseError("Error finding auto-launch product profiles by id", {
                cause: error as unknown as Error,
                operation: "findProfilesByIds",
                resource: { type: "table", name: PROFILES_TABLE },
            });
        }
        return (data ?? []) as AutoLaunchProductProfileRow[];
    }

    async insertProfile(params: {
        organizationId: string;
        integrationCustomerId: string | null;
        name: string;
        tagline: string | null;
        description: string | null;
        websiteUrl: string | null;
        logoUrl: string | null;
        profileData: Record<string, unknown>;
        createdByUserId: string;
    }): Promise<AutoLaunchProductProfileRow> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(PROFILES_TABLE)
            .insert({
                organization_id: params.organizationId,
                integration_customer_id: params.integrationCustomerId,
                name: params.name,
                tagline: params.tagline,
                description: params.description,
                website_url: params.websiteUrl,
                logo_url: params.logoUrl,
                profile_data: params.profileData,
                created_by_user_id: params.createdByUserId,
                created_at: now,
                updated_at: now,
            })
            .select(PROFILE_COLS)
            .single();

        if (error || !data) {
            throw new DatabaseError("Error inserting auto-launch product profile", {
                cause: (error ?? new Error("no row")) as Error,
                operation: "insertProfile",
                resource: { type: "table", name: PROFILES_TABLE },
            });
        }
        return data as AutoLaunchProductProfileRow;
    }

    async updateProfile(params: {
        profileId: string;
        organizationId: string;
        patch: {
            name?: string;
            tagline?: string | null;
            description?: string | null;
            websiteUrl?: string | null;
            logoUrl?: string | null;
            integrationCustomerId?: string | null;
            profileData?: Record<string, unknown>;
        };
    }): Promise<AutoLaunchProductProfileRow | null> {
        const now = new Date().toISOString();
        const update: Record<string, unknown> = { updated_at: now };
        if (params.patch.name !== undefined) update.name = params.patch.name;
        if (params.patch.tagline !== undefined) update.tagline = params.patch.tagline;
        if (params.patch.description !== undefined) update.description = params.patch.description;
        if (params.patch.websiteUrl !== undefined) update.website_url = params.patch.websiteUrl;
        if (params.patch.logoUrl !== undefined) update.logo_url = params.patch.logoUrl;
        if (params.patch.integrationCustomerId !== undefined) {
            update.integration_customer_id = params.patch.integrationCustomerId;
        }
        if (params.patch.profileData !== undefined) update.profile_data = params.patch.profileData;

        const { data, error } = await this.supabase
            .from(PROFILES_TABLE)
            .update(update)
            .eq("id", params.profileId)
            .eq("organization_id", params.organizationId)
            .is("deleted_at", null)
            .select(PROFILE_COLS)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Error updating auto-launch product profile", {
                cause: error as unknown as Error,
                operation: "updateProfile",
                resource: { type: "table", name: PROFILES_TABLE },
            });
        }
        return (data ?? null) as AutoLaunchProductProfileRow | null;
    }

    async softDeleteProfile(profileId: string, organizationId: string): Promise<boolean> {
        const now = new Date().toISOString();
        const { error, count } = await this.supabase
            .from(PROFILES_TABLE)
            .update({ deleted_at: now, updated_at: now }, { count: "exact" })
            .eq("id", profileId)
            .eq("organization_id", organizationId)
            .is("deleted_at", null);

        if (error) {
            throw new DatabaseError("Error deleting auto-launch product profile", {
                cause: error as unknown as Error,
                operation: "softDeleteProfile",
                resource: { type: "table", name: PROFILES_TABLE },
            });
        }
        return (count ?? 0) > 0;
    }

    async integrationCustomerBelongsToOrg(customerId: string, organizationId: string): Promise<boolean> {
        const { data, error } = await this.supabase
            .from("integration_customers")
            .select("id")
            .eq("id", customerId)
            .eq("organization_id", organizationId)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Error resolving channel group", {
                cause: error as unknown as Error,
                operation: "integrationCustomerBelongsToOrg",
                resource: { type: "table", name: "integration_customers" },
            });
        }
        return Boolean(data?.id);
    }

    async insertSubmissionIntent(params: {
        organizationId: string;
        productProfileId: string;
        destinationId: string;
        profileSnapshot: Record<string, unknown>;
        extensionConfigSnapshot: AutoLaunchExtensionConfig;
        createdByUserId: string;
    }): Promise<AutoLaunchSubmissionRow> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(SUBMISSIONS_TABLE)
            .insert({
                organization_id: params.organizationId,
                product_profile_id: params.productProfileId,
                destination_id: params.destinationId,
                status: "intent",
                profile_snapshot: params.profileSnapshot,
                extension_config_snapshot: params.extensionConfigSnapshot,
                intent_created_at: now,
                created_by_user_id: params.createdByUserId,
                created_at: now,
                updated_at: now,
            })
            .select(SUBMISSION_COLS)
            .single();

        if (error || !data) {
            throw new DatabaseError("Error creating auto-launch submission intent", {
                cause: (error ?? new Error("no row")) as Error,
                operation: "insertSubmissionIntent",
                resource: { type: "table", name: SUBMISSIONS_TABLE },
            });
        }
        return data as AutoLaunchSubmissionRow;
    }

    async findLatestSubmissionForProductDestination(params: {
        organizationId: string;
        productProfileId: string;
        destinationId: string;
        statuses?: AutoLaunchSubmissionStatus[];
    }): Promise<AutoLaunchSubmissionRow | null> {
        let query = this.supabase
            .from(SUBMISSIONS_TABLE)
            .select(SUBMISSION_COLS)
            .eq("organization_id", params.organizationId)
            .eq("product_profile_id", params.productProfileId)
            .eq("destination_id", params.destinationId)
            .order("created_at", { ascending: false })
            .limit(1);

        if (params.statuses?.length) {
            query = query.in("status", params.statuses);
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
            throw new DatabaseError("Error finding auto-launch submission for product destination", {
                cause: error as unknown as Error,
                operation: "findLatestSubmissionForProductDestination",
                resource: { type: "table", name: SUBMISSIONS_TABLE },
            });
        }
        return (data ?? null) as AutoLaunchSubmissionRow | null;
    }

    async refreshSubmissionIntent(params: {
        submissionId: string;
        organizationId: string;
        profileSnapshot: Record<string, unknown>;
        extensionConfigSnapshot: AutoLaunchExtensionConfig;
    }): Promise<AutoLaunchSubmissionRow> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(SUBMISSIONS_TABLE)
            .update({
                profile_snapshot: params.profileSnapshot,
                extension_config_snapshot: params.extensionConfigSnapshot,
                intent_created_at: now,
                updated_at: now,
            })
            .eq("id", params.submissionId)
            .eq("organization_id", params.organizationId)
            .in("status", ["draft", "intent", "in_progress"])
            .select(SUBMISSION_COLS)
            .single();

        if (error || !data) {
            throw new DatabaseError("Error refreshing auto-launch submission intent", {
                cause: (error ?? new Error("no row")) as Error,
                operation: "refreshSubmissionIntent",
                resource: { type: "table", name: SUBMISSIONS_TABLE },
            });
        }
        return data as AutoLaunchSubmissionRow;
    }

    async findSubmissionById(submissionId: string): Promise<AutoLaunchSubmissionRow | null> {
        const { data, error } = await this.supabase
            .from(SUBMISSIONS_TABLE)
            .select(SUBMISSION_COLS)
            .eq("id", submissionId)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Error finding auto-launch submission", {
                cause: error as unknown as Error,
                operation: "findSubmissionById",
                resource: { type: "table", name: SUBMISSIONS_TABLE },
            });
        }
        return (data ?? null) as AutoLaunchSubmissionRow | null;
    }

    async listSubmissions(params: {
        organizationId: string;
        productProfileId?: string;
        destinationId?: string;
    }): Promise<AutoLaunchSubmissionRow[]> {
        let query = this.supabase
            .from(SUBMISSIONS_TABLE)
            .select(SUBMISSION_COLS)
            .eq("organization_id", params.organizationId)
            .order("created_at", { ascending: false });

        if (params.productProfileId) {
            query = query.eq("product_profile_id", params.productProfileId);
        }
        if (params.destinationId) {
            query = query.eq("destination_id", params.destinationId);
        }

        const { data, error } = await query;

        if (error) {
            throw new DatabaseError("Error listing auto-launch submissions", {
                cause: error as unknown as Error,
                operation: "listSubmissions",
                resource: { type: "table", name: SUBMISSIONS_TABLE },
            });
        }
        return (data ?? []) as AutoLaunchSubmissionRow[];
    }

    async insertManualCompletedSubmission(params: {
        organizationId: string;
        productProfileId: string;
        destinationId: string;
        profileSnapshot: Record<string, unknown>;
        extensionConfigSnapshot: AutoLaunchExtensionConfig;
        listingProfileFingerprint: string;
        listingUrl: string | null;
        evidence: Record<string, unknown>;
        createdByUserId: string;
    }): Promise<AutoLaunchSubmissionRow> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(SUBMISSIONS_TABLE)
            .insert({
                organization_id: params.organizationId,
                product_profile_id: params.productProfileId,
                destination_id: params.destinationId,
                status: "completed",
                profile_snapshot: params.profileSnapshot,
                extension_config_snapshot: params.extensionConfigSnapshot,
                listing_profile_fingerprint: params.listingProfileFingerprint,
                listing_synced_at: now,
                evidence: params.evidence,
                listing_url: params.listingUrl,
                intent_created_at: now,
                completed_at: now,
                created_by_user_id: params.createdByUserId,
                completed_by_user_id: params.createdByUserId,
                created_at: now,
                updated_at: now,
            })
            .select(SUBMISSION_COLS)
            .single();

        if (error || !data) {
            throw new DatabaseError("Error recording manual auto-launch completion", {
                cause: (error ?? new Error("no row")) as Error,
                operation: "insertManualCompletedSubmission",
                resource: { type: "table", name: SUBMISSIONS_TABLE },
            });
        }
        return data as AutoLaunchSubmissionRow;
    }

    async completeSubmission(params: {
        submissionId: string;
        organizationId: string;
        profileSnapshot: Record<string, unknown>;
        listingProfileFingerprint: string;
        evidence: Record<string, unknown>;
        listingUrl: string | null;
        completedByUserId: string;
    }): Promise<AutoLaunchSubmissionRow | null> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(SUBMISSIONS_TABLE)
            .update({
                status: "completed" as AutoLaunchSubmissionStatus,
                profile_snapshot: params.profileSnapshot,
                listing_profile_fingerprint: params.listingProfileFingerprint,
                listing_synced_at: now,
                evidence: params.evidence,
                listing_url: params.listingUrl,
                completed_at: now,
                completed_by_user_id: params.completedByUserId,
                updated_at: now,
            })
            .eq("id", params.submissionId)
            .eq("organization_id", params.organizationId)
            .neq("status", "completed")
            .select(SUBMISSION_COLS)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Error completing auto-launch submission", {
                cause: error as unknown as Error,
                operation: "completeSubmission",
                resource: { type: "table", name: SUBMISSIONS_TABLE },
            });
        }
        return (data ?? null) as AutoLaunchSubmissionRow | null;
    }

    async reopenSubmissionForResync(params: {
        submissionId: string;
        organizationId: string;
        profileSnapshot: Record<string, unknown>;
        extensionConfigSnapshot: AutoLaunchExtensionConfig;
    }): Promise<AutoLaunchSubmissionRow> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(SUBMISSIONS_TABLE)
            .update({
                status: "in_progress" as AutoLaunchSubmissionStatus,
                profile_snapshot: params.profileSnapshot,
                extension_config_snapshot: params.extensionConfigSnapshot,
                intent_created_at: now,
                completed_at: null,
                completed_by_user_id: null,
                updated_at: now,
            })
            .eq("id", params.submissionId)
            .eq("organization_id", params.organizationId)
            .eq("status", "completed")
            .select(SUBMISSION_COLS)
            .single();

        if (error || !data) {
            throw new DatabaseError("Error reopening auto-launch submission for resync", {
                cause: (error ?? new Error("no row")) as Error,
                operation: "reopenSubmissionForResync",
                resource: { type: "table", name: SUBMISSIONS_TABLE },
            });
        }
        return data as AutoLaunchSubmissionRow;
    }

    async updateCompletedSubmissionListingSync(params: {
        submissionId: string;
        organizationId: string;
        profileSnapshot: Record<string, unknown>;
        extensionConfigSnapshot: AutoLaunchExtensionConfig;
        listingProfileFingerprint: string;
        listingUrl?: string | null;
        completedByUserId: string;
    }): Promise<AutoLaunchSubmissionRow> {
        const now = new Date().toISOString();
        const update: Record<string, unknown> = {
            profile_snapshot: params.profileSnapshot,
            extension_config_snapshot: params.extensionConfigSnapshot,
            listing_profile_fingerprint: params.listingProfileFingerprint,
            listing_synced_at: now,
            completed_by_user_id: params.completedByUserId,
            updated_at: now,
        };
        if (params.listingUrl !== undefined) {
            update.listing_url = params.listingUrl;
        }

        const { data, error } = await this.supabase
            .from(SUBMISSIONS_TABLE)
            .update(update)
            .eq("id", params.submissionId)
            .eq("organization_id", params.organizationId)
            .eq("status", "completed")
            .select(SUBMISSION_COLS)
            .single();

        if (error || !data) {
            throw new DatabaseError("Error updating completed auto-launch submission listing sync", {
                cause: (error ?? new Error("no row")) as Error,
                operation: "updateCompletedSubmissionListingSync",
                resource: { type: "table", name: SUBMISSIONS_TABLE },
            });
        }
        return data as AutoLaunchSubmissionRow;
    }

    async listAllDestinations(): Promise<AutoLaunchDestinationListRow[]> {
        const { data, error } = await this.supabase
            .from(DESTINATIONS_TABLE)
            .select(
                `${DESTINATION_COLS}, link_directory_opportunity:link_directory_opportunities(${DESTINATION_OPPORTUNITY_JOIN})`
            )
            .order("sort_order", { ascending: true });

        if (error) {
            throw new DatabaseError("Error listing auto-launch destinations (admin)", {
                cause: error as unknown as Error,
                operation: "listAllDestinations",
                resource: { type: "table", name: DESTINATIONS_TABLE },
            });
        }
        return ((data ?? []) as DestinationJoinRow[]).map(mapDestinationListRow);
    }

    async findDestinationByProviderSlug(providerSlug: string): Promise<AutoLaunchDestinationRow | null> {
        const { data, error } = await this.supabase
            .from(DESTINATIONS_TABLE)
            .select(DESTINATION_COLS)
            .eq("provider_slug", providerSlug)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Error finding auto-launch destination by provider slug", {
                cause: error as unknown as Error,
                operation: "findDestinationByProviderSlug",
                resource: { type: "table", name: DESTINATIONS_TABLE },
            });
        }
        if (!data) return null;
        return {
            ...(data as AutoLaunchDestinationRow),
            extension_config: ((data as AutoLaunchDestinationRow).extension_config ??
                {}) as AutoLaunchExtensionConfig,
        };
    }

    async createDestination(row: {
        provider_slug: string;
        link_directory_opportunity_id: string | null;
        name: string;
        short_description: string | null;
        submission_path: "extension" | "auto";
        start_url: string;
        extension_config: AutoLaunchExtensionConfig;
        is_published: boolean;
        sort_order: number;
        picker_group_key: string | null;
        picker_group_title: string | null;
    }): Promise<AutoLaunchDestinationRow> {
        const { data, error } = await this.supabase
            .from(DESTINATIONS_TABLE)
            .insert({
                ...row,
                updated_at: new Date().toISOString(),
            })
            .select(DESTINATION_COLS)
            .single();

        if (error) {
            throw new DatabaseError("Error creating auto-launch destination", {
                cause: error as unknown as Error,
                operation: "createDestination",
                resource: { type: "table", name: DESTINATIONS_TABLE },
            });
        }
        return {
            ...(data as AutoLaunchDestinationRow),
            extension_config: ((data as AutoLaunchDestinationRow).extension_config ??
                {}) as AutoLaunchExtensionConfig,
        };
    }

    async updateDestination(
        destinationId: string,
        fields: Partial<{
            provider_slug: string;
            link_directory_opportunity_id: string | null;
            name: string;
            short_description: string | null;
            submission_path: "extension" | "auto";
            start_url: string;
            extension_config: AutoLaunchExtensionConfig;
            is_published: boolean;
            sort_order: number;
            picker_group_key: string | null;
            picker_group_title: string | null;
        }>
    ): Promise<AutoLaunchDestinationRow | null> {
        const { data, error } = await this.supabase
            .from(DESTINATIONS_TABLE)
            .update({
                ...fields,
                updated_at: new Date().toISOString(),
            })
            .eq("id", destinationId)
            .select(DESTINATION_COLS)
            .maybeSingle();

        if (error) {
            throw new DatabaseError("Error updating auto-launch destination", {
                cause: error as unknown as Error,
                operation: "updateDestination",
                resource: { type: "table", name: DESTINATIONS_TABLE },
            });
        }
        if (!data) return null;
        return {
            ...(data as AutoLaunchDestinationRow),
            extension_config: ((data as AutoLaunchDestinationRow).extension_config ??
                {}) as AutoLaunchExtensionConfig,
        };
    }

    async deleteDestination(destinationId: string): Promise<void> {
        const { error } = await this.supabase.from(DESTINATIONS_TABLE).delete().eq("id", destinationId);

        if (error) {
            throw new DatabaseError("Error deleting auto-launch destination", {
                cause: error as unknown as Error,
                operation: "deleteDestination",
                resource: { type: "table", name: DESTINATIONS_TABLE },
            });
        }
    }
}
