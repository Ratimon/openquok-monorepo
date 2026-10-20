import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    DirectorySeoCompetitorRow,
    SeoDomainMetricHistoryRow,
    SeoDomainMetricSnapshotRow,
} from "../data/types/directorySeoTypes";
import { DatabaseError } from "../errors/InfraError";

const COMPETITORS_TABLE = "directory_seo_competitors";
const SNAPSHOTS_TABLE = "seo_domain_metric_snapshots";
const HISTORY_TABLE = "seo_domain_metric_history";
const PROFILES_TABLE = "auto_launch_product_profiles";

export class DirectorySeoRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async countCompetitorsForOrganization(organizationId: string): Promise<number> {
        const { count, error } = await this.supabase
            .from(COMPETITORS_TABLE)
            .select("*", { count: "exact", head: true })
            .eq("organization_id", organizationId);

        if (error) {
            throw new DatabaseError(`Failed to count directory SEO competitors: ${error.message}`);
        }

        return count ?? 0;
    }

    async listCompetitorDomainsByOrganization(): Promise<
        Array<{ organization_id: string; domain: string }>
    > {
        const { data, error } = await this.supabase
            .from(COMPETITORS_TABLE)
            .select("organization_id, domain");

        if (error) {
            throw new DatabaseError(`Failed to list directory SEO competitors: ${error.message}`);
        }

        return (data ?? []) as Array<{ organization_id: string; domain: string }>;
    }

    async listMainProfileWebsiteUrls(): Promise<
        Array<{ organization_id: string; website_url: string }>
    > {
        const { data, error } = await this.supabase
            .from(PROFILES_TABLE)
            .select("organization_id, website_url")
            .eq("profile_kind", "main")
            .is("deleted_at", null)
            .not("website_url", "is", null);

        if (error) {
            throw new DatabaseError(`Failed to list main profile website URLs: ${error.message}`);
        }

        return (data ?? []) as Array<{ organization_id: string; website_url: string }>;
    }

    async getSnapshot(domain: string): Promise<SeoDomainMetricSnapshotRow | null> {
        const { data, error } = await this.supabase
            .from(SNAPSHOTS_TABLE)
            .select("domain, domain_rating, source, checked_at")
            .eq("domain", domain)
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Failed to read SEO domain metric snapshot: ${error.message}`);
        }

        return (data as SeoDomainMetricSnapshotRow | null) ?? null;
    }

    async upsertSnapshot(params: {
        domain: string;
        domainRating: number | null;
        source: string;
        checkedAt: string;
    }): Promise<SeoDomainMetricSnapshotRow> {
        const { data, error } = await this.supabase
            .from(SNAPSHOTS_TABLE)
            .upsert(
                {
                    domain: params.domain,
                    domain_rating: params.domainRating,
                    source: params.source,
                    checked_at: params.checkedAt,
                },
                { onConflict: "domain" }
            )
            .select("domain, domain_rating, source, checked_at")
            .single();

        if (error) {
            throw new DatabaseError(`Failed to upsert SEO domain metric snapshot: ${error.message}`);
        }

        return data as SeoDomainMetricSnapshotRow;
    }

    async getLatestHistory(domain: string): Promise<SeoDomainMetricHistoryRow | null> {
        const { data, error } = await this.supabase
            .from(HISTORY_TABLE)
            .select("id, domain, domain_rating, captured_at")
            .eq("domain", domain)
            .order("captured_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Failed to read SEO domain metric history: ${error.message}`);
        }

        return (data as SeoDomainMetricHistoryRow | null) ?? null;
    }

    async insertHistory(params: {
        domain: string;
        domainRating: number | null;
        capturedAt: string;
    }): Promise<void> {
        const { error } = await this.supabase.from(HISTORY_TABLE).insert({
            domain: params.domain,
            domain_rating: params.domainRating,
            captured_at: params.capturedAt,
        });

        if (error) {
            throw new DatabaseError(`Failed to insert SEO domain metric history: ${error.message}`);
        }
    }

    async listCompetitorsForOrganization(organizationId: string): Promise<DirectorySeoCompetitorRow[]> {
        const { data, error } = await this.supabase
            .from(COMPETITORS_TABLE)
            .select("organization_id, domain, label, sort_order, created_at, updated_at")
            .eq("organization_id", organizationId)
            .order("sort_order", { ascending: true })
            .order("domain", { ascending: true });

        if (error) {
            throw new DatabaseError(`Failed to list directory SEO competitors: ${error.message}`);
        }

        return (data ?? []) as DirectorySeoCompetitorRow[];
    }

    async insertCompetitor(params: {
        organizationId: string;
        domain: string;
        label: string | null;
        sortOrder: number;
    }): Promise<DirectorySeoCompetitorRow> {
        const now = new Date().toISOString();
        const { data, error } = await this.supabase
            .from(COMPETITORS_TABLE)
            .insert({
                organization_id: params.organizationId,
                domain: params.domain,
                label: params.label,
                sort_order: params.sortOrder,
                created_at: now,
                updated_at: now,
            })
            .select("organization_id, domain, label, sort_order, created_at, updated_at")
            .single();

        if (error || !data) {
            throw new DatabaseError(`Failed to add directory SEO competitor: ${error?.message ?? "no row"}`);
        }

        return data as DirectorySeoCompetitorRow;
    }

    async deleteCompetitor(organizationId: string, domain: string): Promise<boolean> {
        const { error, count } = await this.supabase
            .from(COMPETITORS_TABLE)
            .delete({ count: "exact" })
            .eq("organization_id", organizationId)
            .eq("domain", domain);

        if (error) {
            throw new DatabaseError(`Failed to remove directory SEO competitor: ${error.message}`);
        }

        return (count ?? 0) > 0;
    }

    async listHistoryForDomain(params: {
        domain: string;
        sinceIso: string;
    }): Promise<SeoDomainMetricHistoryRow[]> {
        const { data, error } = await this.supabase
            .from(HISTORY_TABLE)
            .select("id, domain, domain_rating, captured_at")
            .eq("domain", params.domain)
            .gte("captured_at", params.sinceIso)
            .order("captured_at", { ascending: true });

        if (error) {
            throw new DatabaseError(`Failed to list SEO domain metric history: ${error.message}`);
        }

        return (data ?? []) as SeoDomainMetricHistoryRow[];
    }

    async findHistoryRatingAtOrBefore(
        domain: string,
        targetIso: string
    ): Promise<number | null> {
        const { data, error } = await this.supabase
            .from(HISTORY_TABLE)
            .select("domain_rating, captured_at")
            .eq("domain", domain)
            .lte("captured_at", targetIso)
            .order("captured_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Failed to read SEO domain metric history: ${error.message}`);
        }

        if (!data) return null;
        const rating = data.domain_rating;
        if (rating == null) return null;
        const n = Number(rating);
        return Number.isFinite(n) ? n : null;
    }
}
