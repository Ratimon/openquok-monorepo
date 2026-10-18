import type {
    AutoLaunchExtensionConfig,
    LaunchStep as AutoLaunchExtensionStep,
} from "openquok-common";

export type { AutoLaunchExtensionConfig, AutoLaunchExtensionStep };

export type AutoLaunchSubmissionStatus =
    | "draft"
    | "intent"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "failed";

/** Merged channel group + product profile row for business profile pickers. */
export type BusinessProfileListRow = {
    integration_customer_id: string | null;
    product_profile_id: string | null;
    name: string;
    tagline: string | null;
    website_url: string | null;
    logo_url: string | null;
};

export type AutoLaunchProductProfileRow = {
    id: string;
    organization_id: string;
    integration_customer_id: string | null;
    name: string;
    tagline: string | null;
    description: string | null;
    website_url: string | null;
    logo_url: string | null;
    profile_data: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    created_by_user_id: string | null;
    deleted_at: string | null;
};

export type AutoLaunchDestinationRow = {
    id: string;
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
    created_at: string;
    updated_at: string;
};

export type AutoLaunchDestinationListRow = AutoLaunchDestinationRow & {
    opportunity_description?: string | null;
    opportunity_title?: string | null;
    opportunity_dofollow?: string | null;
    opportunity_cost_tier?: string | null;
    opportunity_cost_note?: string | null;
    site_domain_rating?: number | null;
    site_title?: string | null;
};

export type AutoLaunchSubmissionRow = {
    id: string;
    organization_id: string;
    product_profile_id: string;
    destination_id: string;
    status: AutoLaunchSubmissionStatus;
    profile_snapshot: Record<string, unknown>;
    extension_config_snapshot: AutoLaunchExtensionConfig;
    evidence: Record<string, unknown>;
    listing_url: string | null;
    intent_created_at: string | null;
    completed_at: string | null;
    created_by_user_id: string | null;
    completed_by_user_id: string | null;
    listing_profile_fingerprint: string | null;
    listing_synced_at: string | null;
    created_at: string;
    updated_at: string;
};

export type AutoLaunchProfileSnapshot = {
    name: string;
    tagline: string | null;
    description: string | null;
    website_url: string | null;
    logo_url: string | null;
    profile_data: Record<string, unknown>;
    integration_customer_id: string | null;
};
