import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    AdminLinkDirectorySitesFilterOptions,
    LinkDirectoryBookmarkRow,
    LinkDirectoryOpportunityRow,
    LinkDirectoryOpportunityTypeRow,
    LinkDirectorySiteRow,
    LinkDirectorySubmissionRow,
    PublishedLinkDirectorySitesFilterOptions,
} from "../data/types/linkDirectoryTypes";
import type {
    LinkDirectoryOpportunityCreateSchemaType,
    LinkDirectoryOpportunityUpdateSchemaType,
    LinkDirectorySiteCreateSchemaType,
    LinkDirectorySiteUpdateSchemaType,
    LinkDirectorySubmissionCreateSchemaType,
} from "../data/schemas/linkDirectorySchemas";
import { DatabaseError, DatabaseEntityNotFoundError, ValidationError } from "../errors/InfraError";
import { stringToSlug } from "../utils/blog/slug";
import { hasOpportunityLevelFilters } from "../utils/linkDirectory/opportunityFilterMatch";
import type { OpportunityFilterCriteria } from "../utils/linkDirectory/opportunityFilterMatch";

const TABLE_SITES = "link_directory_sites";
const TABLE_OPPORTUNITIES = "link_directory_opportunities";
const TABLE_TAG_ASSOC = "link_directory_site_tags_association";
const TABLE_BOOKMARKS = "link_directory_bookmarks";
const TABLE_SUBMISSIONS = "link_directory_submissions";
const TABLE_OPP_TYPES = "link_directory_opportunity_types";

const SITE_COLUMNS =
    "id, slug, title, site_url, logo_url, short_description, long_description, domain_authority, domain_rating, monthly_visits, metrics_source, metrics_updated_at, category_id, is_openquok_auth_supported, openquok_channel_slug, is_admin_published, sort_order, tag_slugs, published_at, created_at, updated_at";

const CATEGORY_EMBED =
    "category:link_directory_categories(id, name, slug, headline, description, sort_order, openquok_channels_hub_path)";

const OPPORTUNITY_EMBED =
    "opportunities:link_directory_opportunities(id, site_id, slug, title, opportunity_type_id, effort, approval_mode, approval_time_hint, dofollow, cost_tier, cost_note, description, steps, openquok_cta_kind, openquok_channel_slug, openquok_plug_name, cta_href, cta_label, sort_order, is_admin_published, published_at, created_at, updated_at, opportunity_type:link_directory_opportunity_types(id, slug, label, description, sort_order))";

const SELECT_OPPORTUNITY =
    "id, site_id, slug, title, opportunity_type_id, effort, approval_mode, approval_time_hint, dofollow, cost_tier, cost_note, description, steps, openquok_cta_kind, openquok_channel_slug, openquok_plug_name, cta_href, cta_label, sort_order, is_admin_published, published_at, created_at, updated_at, opportunity_type:link_directory_opportunity_types(id, slug, label, description, sort_order)";

const SELECT_SITE = `${SITE_COLUMNS}, ${CATEGORY_EMBED}, ${OPPORTUNITY_EMBED}`;

const SELECT_SITE_FOR_BOOKMARK = `${SITE_COLUMNS}, ${CATEGORY_EMBED}`;

const ALLOWED_PUBLISHED_SORT_KEYS = new Set([
    "domain_rating",
    "domain_authority",
    "monthly_visits",
    "title",
    "published_at",
    "sort_order",
]);

const ALLOWED_ADMIN_SORT_KEYS = new Set([
    "created_at",
    "updated_at",
    "published_at",
    "title",
    "domain_rating",
    "is_admin_published",
    "sort_order",
]);

function resolveOrderKey(
    candidate: string | null | undefined,
    fallback: string,
    allowlist: Set<string>
): string {
    const key = candidate?.toString().trim();
    if (!key) return fallback;
    return allowlist.has(key) ? key : fallback;
}

function escapeIlike(term: string): string {
    return term.replace(/[%_\\]/g, "\\$&");
}

export class LinkDirectoryRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async findOpportunityTypes(): Promise<{ data: LinkDirectoryOpportunityTypeRow[] }> {
        const { data, error } = await this.supabase
            .from(TABLE_OPP_TYPES)
            .select("id, slug, label, description, sort_order")
            .order("sort_order", { ascending: true });

        if (error) {
            throw new DatabaseError(`Error fetching opportunity types: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: (data ?? []) as LinkDirectoryOpportunityTypeRow[] };
    }

    private async findSiteIdsMatchingOpportunityFilters(
        filters: OpportunityFilterCriteria,
        publishedOnly: boolean
    ): Promise<string[]> {
        let query = this.supabase.from(TABLE_OPPORTUNITIES).select("site_id");

        if (publishedOnly) {
            query = query.eq("is_admin_published", true);
        }
        if (filters.costTiers?.length) {
            query = query.in("cost_tier", filters.costTiers);
        }
        if (filters.dofollow?.length) {
            query = query.in("dofollow", filters.dofollow);
        }
        if (filters.effort?.length) {
            query = query.in("effort", filters.effort);
        }
        if (filters.approvalMode?.length) {
            query = query.in("approval_mode", filters.approvalMode);
        }
        if (filters.opportunityTypeSlugs?.length) {
            const typeIds = await this.findOpportunityTypeIdsBySlugs(filters.opportunityTypeSlugs);
            if (typeIds.length === 0) {
                return [];
            }
            query = query.in("opportunity_type_id", typeIds);
        }

        const { data, error } = await query;

        if (error) {
            throw new DatabaseError(`Error resolving opportunity filters: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        const ids = new Set<string>();
        for (const row of data ?? []) {
            if (row.site_id) ids.add(row.site_id as string);
        }
        return [...ids];
    }

    private async findSiteIdsByOpportunityTitleSearch(term: string): Promise<string[]> {
        const pattern = `%${escapeIlike(term)}%`;
        const { data, error } = await this.supabase
            .from(TABLE_OPPORTUNITIES)
            .select("site_id")
            .eq("is_admin_published", true)
            .ilike("title", pattern);

        if (error) {
            throw new DatabaseError(`Error searching opportunities: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        const ids = new Set<string>();
        for (const row of data ?? []) {
            if (row.site_id) ids.add(row.site_id as string);
        }
        return [...ids];
    }

    private async findCategoryIdBySlug(categorySlug: string): Promise<string | null> {
        const slug = categorySlug.trim();
        if (!slug) return null;

        const { data, error } = await this.supabase
            .from("link_directory_categories")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Error resolving link directory category: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return (data?.id as string | undefined) ?? null;
    }

    private async findOpportunityTypeIdsBySlugs(slugs: string[]): Promise<string[]> {
        const normalized = slugs.map((slug) => slug.trim()).filter(Boolean);
        if (normalized.length === 0) {
            return [];
        }

        const { data, error } = await this.supabase
            .from(TABLE_OPP_TYPES)
            .select("id")
            .in("slug", normalized);

        if (error) {
            throw new DatabaseError(`Error resolving opportunity type slugs: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        const ids = new Set<string>();
        for (const row of data ?? []) {
            if (row.id) ids.add(row.id as string);
        }
        return [...ids];
    }

    async findPublishedSites(
        options: PublishedLinkDirectorySitesFilterOptions
    ): Promise<{ data: LinkDirectorySiteRow[]; count: number }> {
        const {
            limit = 20,
            skip = 0,
            searchTerm,
            tagSlugs,
            categorySlug,
            costTiers,
            dofollow,
            effort,
            approvalMode,
            opportunityTypeSlugs,
            sortByKey,
            sortByOrder,
            range,
        } = options;

        const oppFilters: OpportunityFilterCriteria = {
            costTiers,
            dofollow,
            effort,
            approvalMode,
            opportunityTypeSlugs,
        };

        let query = this.supabase
            .from(TABLE_SITES)
            .select(SELECT_SITE, { count: "exact" })
            .eq("is_admin_published", true);

        if (categorySlug?.trim()) {
            const categoryId = await this.findCategoryIdBySlug(categorySlug);
            if (!categoryId) {
                return { data: [], count: 0 };
            }
            query = query.eq("category_id", categoryId);
        }
        if (tagSlugs && tagSlugs.length > 0) {
            query = query.contains("tag_slugs", tagSlugs);
        }

        if (hasOpportunityLevelFilters(oppFilters)) {
            const siteIds = await this.findSiteIdsMatchingOpportunityFilters(oppFilters, true);
            if (siteIds.length === 0) {
                return { data: [], count: 0 };
            }
            query = query.in("id", siteIds);
        }

        const trimmedSearch = searchTerm?.trim();
        if (trimmedSearch) {
            const oppSiteIds = await this.findSiteIdsByOpportunityTitleSearch(trimmedSearch);
            const pattern = `%${escapeIlike(trimmedSearch)}%`;
            const clauses = [
                `title.ilike.${pattern}`,
                `site_url.ilike.${pattern}`,
                `slug.ilike.${pattern}`,
            ];
            if (oppSiteIds.length > 0) {
                clauses.push(`id.in.(${oppSiteIds.join(",")})`);
            }
            query = query.or(clauses.join(","));
        }

        const orderKey = resolveOrderKey(sortByKey ?? undefined, "domain_rating", ALLOWED_PUBLISHED_SORT_KEYS);
        const ascending =
            orderKey === "title" ? (sortByOrder ?? true) : (sortByOrder ?? false);
        query = query.order(orderKey, { ascending, nullsFirst: false });

        if (range) {
            query = query.range(range.start, range.end);
        } else {
            query = query.range(skip, skip + limit - 1);
        }

        const { data, error, count } = await query;

        if (error) {
            throw new DatabaseError(`Error fetching published link directory sites: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        const rows = (data ?? []) as unknown as LinkDirectorySiteRow[];
        return {
            data: rows.map((site) => this.filterPublishedOpportunities(site)),
            count: count ?? 0,
        };
    }

    async findPublishedSiteBySlug(siteSlug: string): Promise<{ data: LinkDirectorySiteRow | null }> {
        const { data, error } = await this.supabase
            .from(TABLE_SITES)
            .select(SELECT_SITE)
            .eq("slug", siteSlug)
            .eq("is_admin_published", true)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return { data: null };
            }
            throw new DatabaseError(`Error fetching published site: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: this.filterPublishedOpportunities(data as unknown as LinkDirectorySiteRow) };
    }

    async findAdminSites(
        options: AdminLinkDirectorySitesFilterOptions
    ): Promise<{ data: LinkDirectorySiteRow[]; count: number }> {
        const { limit = 50, searchTerm, sortByKey, sortByOrder, range } = options;

        let query = this.supabase.from(TABLE_SITES).select(SELECT_SITE, { count: "exact" });

        const trimmedSearch = searchTerm?.trim();
        if (trimmedSearch) {
            const pattern = `%${escapeIlike(trimmedSearch)}%`;
            query = query.or(`title.ilike.${pattern},slug.ilike.${pattern},site_url.ilike.${pattern}`);
        }

        const orderKey = resolveOrderKey(sortByKey ?? undefined, "updated_at", ALLOWED_ADMIN_SORT_KEYS);
        if (orderKey === "is_admin_published") {
            query = query.order("is_admin_published", { ascending: true });
        } else {
            query = query.order(orderKey, { ascending: sortByOrder ?? false });
        }

        if (range) {
            query = query.range(range.start, range.end);
        } else {
            query = query.range(0, limit - 1);
        }

        const { data, error, count } = await query;

        if (error) {
            throw new DatabaseError(`Error fetching admin link directory sites: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: (data ?? []) as unknown as LinkDirectorySiteRow[], count: count ?? 0 };
    }

    async findSiteById(siteId: string): Promise<{ data: LinkDirectorySiteRow }> {
        const { data, error } = await this.supabase
            .from(TABLE_SITES)
            .select(SELECT_SITE)
            .eq("id", siteId)
            .single();

        if (error) {
            throw new DatabaseError(`Error fetching link directory site: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: data as unknown as LinkDirectorySiteRow };
    }

    async createSite(
        payload: LinkDirectorySiteCreateSchemaType,
        tagIds: string[] = []
    ): Promise<string> {
        const { data, error } = await this.supabase
            .from(TABLE_SITES)
            .insert({
                ...payload,
                slug: payload.slug ?? stringToSlug(payload.title),
            })
            .select("id")
            .single();

        if (error) {
            if (error.message.includes("duplicate key value")) {
                throw new ValidationError("A site with this slug already exists.");
            }
            throw new DatabaseError(`Error creating link directory site: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "insert",
            });
        }

        const siteId = data.id as string;
        await this.syncSiteTags(siteId, tagIds);
        return siteId;
    }

    async updateSite(
        payload: LinkDirectorySiteUpdateSchemaType,
        tagIds?: string[]
    ): Promise<string> {
        const { id, ...fields } = payload;
        const { data, error } = await this.supabase
            .from(TABLE_SITES)
            .update({
                ...fields,
                slug: fields.slug ?? stringToSlug(payload.title),
            })
            .eq("id", id)
            .select("id")
            .single();

        if (error) {
            if (error.message.includes("duplicate key value")) {
                throw new ValidationError("A site with this slug already exists.");
            }
            throw new DatabaseError(`Error updating link directory site: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "update",
            });
        }

        if (tagIds) {
            await this.syncSiteTags(id, tagIds);
        }

        return data.id as string;
    }

    async deleteSite(siteId: string): Promise<void> {
        const { error } = await this.supabase.from(TABLE_SITES).delete().eq("id", siteId);

        if (error) {
            throw new DatabaseError(`Error deleting link directory site: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "delete",
            });
        }
    }

    async createOpportunity(
        siteId: string,
        payload: LinkDirectoryOpportunityCreateSchemaType
    ): Promise<string> {
        const { data, error } = await this.supabase
            .from(TABLE_OPPORTUNITIES)
            .insert({
                ...payload,
                site_id: siteId,
                slug: payload.slug ?? stringToSlug(payload.title),
                steps: payload.steps ?? [],
            })
            .select("id")
            .single();

        if (error) {
            if (error.message.includes("duplicate key value")) {
                throw new ValidationError("An opportunity with this slug already exists on this site.");
            }
            throw new DatabaseError(`Error creating opportunity: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "insert",
            });
        }

        return data.id as string;
    }

    async updateOpportunity(payload: LinkDirectoryOpportunityUpdateSchemaType): Promise<string> {
        const { id, ...fields } = payload;
        const { data, error } = await this.supabase
            .from(TABLE_OPPORTUNITIES)
            .update({
                ...fields,
                slug: fields.slug ?? stringToSlug(payload.title),
                steps: fields.steps ?? undefined,
            })
            .eq("id", id)
            .select("id")
            .single();

        if (error) {
            if (error.message.includes("duplicate key value")) {
                throw new ValidationError("An opportunity with this slug already exists on this site.");
            }
            throw new DatabaseError(`Error updating opportunity: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "update",
            });
        }

        return data.id as string;
    }

    async deleteOpportunity(opportunityId: string): Promise<void> {
        const { error } = await this.supabase.from(TABLE_OPPORTUNITIES).delete().eq("id", opportunityId);

        if (error) {
            throw new DatabaseError(`Error deleting opportunity: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "delete",
            });
        }
    }

    async findOpportunityById(opportunityId: string): Promise<{ data: LinkDirectoryOpportunityRow }> {
        const { data, error } = await this.supabase
            .from(TABLE_OPPORTUNITIES)
            .select(SELECT_OPPORTUNITY)
            .eq("id", opportunityId)
            .single();

        if (error) {
            throw new DatabaseError(`Error fetching opportunity: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: data as unknown as LinkDirectoryOpportunityRow };
    }

    async createSubmission(
        payload: LinkDirectorySubmissionCreateSchemaType,
        userId?: string | null
    ): Promise<string> {
        const { data, error } = await this.supabase
            .from(TABLE_SUBMISSIONS)
            .insert({
                email: payload.email,
                site_url: payload.site_url,
                proposed_title: payload.proposed_title ?? null,
                notes: payload.notes ?? null,
                payload: payload.payload ?? {},
                user_id: userId ?? null,
            })
            .select("id")
            .single();

        if (error) {
            throw new DatabaseError(`Error creating submission: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "insert",
            });
        }

        return data.id as string;
    }

    async findAdminSubmissions(): Promise<{ data: LinkDirectorySubmissionRow[] }> {
        const { data, error } = await this.supabase
            .from(TABLE_SUBMISSIONS)
            .select(
                "id, status, email, user_id, site_url, proposed_title, notes, payload, reviewed_by, reviewed_at, created_at, updated_at"
            )
            .order("created_at", { ascending: false });

        if (error) {
            throw new DatabaseError(`Error fetching submissions: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: (data ?? []) as LinkDirectorySubmissionRow[] };
    }

    async updateSubmissionStatus(
        submissionId: string,
        status: "approved" | "rejected",
        reviewedByUserId: string
    ): Promise<void> {
        const { error } = await this.supabase
            .from(TABLE_SUBMISSIONS)
            .update({
                status,
                reviewed_by: reviewedByUserId,
                reviewed_at: new Date().toISOString(),
            })
            .eq("id", submissionId);

        if (error) {
            throw new DatabaseError(`Error updating submission: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "update",
            });
        }
    }

    async findUserBookmarks(userId: string): Promise<{ data: LinkDirectoryBookmarkRow[] }> {
        const { data, error } = await this.supabase
            .from(TABLE_BOOKMARKS)
            .select(
                `id, user_id, site_id, sort_order, created_at, site:link_directory_sites(${SELECT_SITE_FOR_BOOKMARK})`
            )
            .eq("user_id", userId)
            .order("sort_order", { ascending: true });

        if (error) {
            throw new DatabaseError(`Error fetching bookmarks: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        const rows = (data ?? []) as unknown as LinkDirectoryBookmarkRow[];
        return {
            data: rows.map((row) => ({
                ...row,
                site: row.site ? this.filterPublishedOpportunities(row.site) : row.site,
            })),
        };
    }

    async replaceUserBookmarks(userId: string, siteIds: string[]): Promise<void> {
        const { error: deleteError } = await this.supabase
            .from(TABLE_BOOKMARKS)
            .delete()
            .eq("user_id", userId);

        if (deleteError) {
            throw new DatabaseError(`Error clearing bookmarks: ${deleteError.message}`, {
                cause: deleteError as unknown as Error,
                operation: "delete",
            });
        }

        if (siteIds.length === 0) return;

        const { error: insertError } = await this.supabase.from(TABLE_BOOKMARKS).insert(
            siteIds.map((siteId, index) => ({
                user_id: userId,
                site_id: siteId,
                sort_order: index,
            }))
        );

        if (insertError) {
            throw new DatabaseError(`Error saving bookmarks: ${insertError.message}`, {
                cause: insertError as unknown as Error,
                operation: "insert",
            });
        }
    }

    async reorderUserBookmarks(userId: string, siteIds: string[]): Promise<void> {
        for (let index = 0; index < siteIds.length; index++) {
            const siteId = siteIds[index];
            const { error } = await this.supabase
                .from(TABLE_BOOKMARKS)
                .update({ sort_order: index })
                .eq("user_id", userId)
                .eq("site_id", siteId);

            if (error) {
                throw new DatabaseEntityNotFoundError("Bookmark not found for reorder", {
                    userId,
                    siteId,
                });
            }
        }
    }

    private filterPublishedOpportunities(site: LinkDirectorySiteRow): LinkDirectorySiteRow {
        const opportunities = (site.opportunities ?? [])
            .filter((opp) => opp.is_admin_published)
            .sort((a, b) => a.sort_order - b.sort_order);
        return { ...site, opportunities };
    }

    async findPublishedHubStats(): Promise<{
        siteCount: number;
        opportunityCount: number;
        freeOrFreemiumOpportunityCount: number;
        quickWinOpportunityCount: number;
    }> {
        const publishedOpportunity = () =>
            this.supabase
                .from(TABLE_OPPORTUNITIES)
                .select("id", { count: "exact", head: true })
                .eq("is_admin_published", true);

        const [sitesResult, opportunitiesResult, freeOrFreemiumResult, quickWinsResult] =
            await Promise.all([
                this.supabase
                    .from(TABLE_SITES)
                    .select("id", { count: "exact", head: true })
                    .eq("is_admin_published", true),
                publishedOpportunity(),
                publishedOpportunity().in("cost_tier", ["free", "freemium"]),
                publishedOpportunity().eq("cost_tier", "free").eq("effort", "easy"),
            ]);

        const errors = [
            sitesResult.error,
            opportunitiesResult.error,
            freeOrFreemiumResult.error,
            quickWinsResult.error,
        ].filter(Boolean);
        if (errors.length > 0) {
            const message = errors.map((err) => err?.message).filter(Boolean).join("; ");
            throw new DatabaseError(`Error fetching published hub stats: ${message}`, {
                operation: "select",
            });
        }

        return {
            siteCount: sitesResult.count ?? 0,
            opportunityCount: opportunitiesResult.count ?? 0,
            freeOrFreemiumOpportunityCount: freeOrFreemiumResult.count ?? 0,
            quickWinOpportunityCount: quickWinsResult.count ?? 0,
        };
    }

    private async syncSiteTags(siteId: string, tagIds: string[]): Promise<void> {
        const { error: deleteError } = await this.supabase
            .from(TABLE_TAG_ASSOC)
            .delete()
            .eq("site_id", siteId);

        if (deleteError) {
            throw new DatabaseError(`Error clearing site tags: ${deleteError.message}`, {
                cause: deleteError as unknown as Error,
                operation: "delete",
            });
        }

        if (tagIds.length === 0) return;

        const { error: insertError } = await this.supabase.from(TABLE_TAG_ASSOC).insert(
            tagIds.map((tagId) => ({
                site_id: siteId,
                link_directory_tag_id: tagId,
            }))
        );

        if (insertError) {
            throw new DatabaseError(`Error syncing site tags: ${insertError.message}`, {
                cause: insertError as unknown as Error,
                operation: "insert",
            });
        }
    }
}
