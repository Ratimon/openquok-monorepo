import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    AdminLinkDirectorySiteComment,
    AdminLinkDirectorySiteCommentsFilterOptions,
    AdminLinkDirectorySitesFilterOptions,
    LinkDirectorySavedSiteRow,
    LinkDirectoryOpportunityRow,
    LinkDirectoryOpportunityTypeRow,
    LinkDirectorySiteComment,
    LinkDirectorySiteRow,
    LinkDirectorySubmissionRow,
    PublishedLinkDirectorySitesFilterOptions,
} from "../data/types/linkDirectoryTypes";
import type {
    LinkDirectoryOpportunityCreateSchemaType,
    LinkDirectoryOpportunityUpdateSchemaType,
    LinkDirectorySiteCommentCreateSchemaType,
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
const TABLE_SAVED_SITES = "link_directory_saved_sites";
const TABLE_SUBMISSIONS = "link_directory_submissions";
const TABLE_OPP_TYPES = "link_directory_opportunity_types";
const TABLE_SITE_COMMENTS = "link_directory_site_comments";
const TABLE_SITE_RATINGS = "link_directory_site_ratings";

const SITE_COLUMNS =
    "id, slug, title, site_url, logo_url, short_description, long_description, domain_authority, domain_rating, monthly_visits, metrics_source, metrics_updated_at, category_id, is_openquok_auth_supported, openquok_channel_slug, is_admin_published, sort_order, tag_slugs, published_at, likes, views, bookmark_count, average_rating, ratings_count, created_at, updated_at";

const ALLOWED_ADMIN_SITE_COMMENT_SORT_KEYS = new Set(["created_at", "updated_at", "content"]);

const SELECT_SITE_COMMENT = `
  id,
  content,
  is_approved,
  created_at,
  updated_at,
  parent_id,
  user_id,
  author:users!user_id(id, full_name, user_profiles(avatar_url))
`;

const SELECT_SITE_COMMENT_ADMIN = `
  id,
  content,
  is_approved,
  created_at,
  updated_at,
  parent_id,
  user_id,
  site_id,
  author:users!user_id(id, full_name, user_profiles(avatar_url)),
  site:site_id(id, title, slug)
`;

const CATEGORY_EMBED =
    "category:link_directory_categories(id, name, slug, headline, description, sort_order, openquok_channels_hub_path)";

const OPPORTUNITY_EMBED =
    "opportunities:link_directory_opportunities(id, site_id, slug, title, opportunity_type_id, effort, approval_mode, approval_time_hint, dofollow, cost_tier, cost_note, description, steps, openquok_cta_kind, openquok_channel_slug, openquok_plug_name, cta_href, cta_label, sort_order, is_admin_published, published_at, created_at, updated_at, opportunity_type:link_directory_opportunity_types(id, slug, label, description, sort_order))";

const SELECT_OPPORTUNITY =
    "id, site_id, slug, title, opportunity_type_id, effort, approval_mode, approval_time_hint, dofollow, cost_tier, cost_note, description, steps, openquok_cta_kind, openquok_channel_slug, openquok_plug_name, cta_href, cta_label, sort_order, is_admin_published, published_at, created_at, updated_at, opportunity_type:link_directory_opportunity_types(id, slug, label, description, sort_order)";

const SELECT_SITE = `${SITE_COLUMNS}, ${CATEGORY_EMBED}, ${OPPORTUNITY_EMBED}`;

const SELECT_SITE_FOR_SAVED_SITE = `${SITE_COLUMNS}, ${CATEGORY_EMBED}`;

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

    async assertPublishedSiteIds(siteIds: string[]): Promise<void> {
        if (siteIds.length === 0) return;

        const { data, error } = await this.supabase
            .from(TABLE_SITES)
            .select("id")
            .in("id", siteIds)
            .eq("is_admin_published", true);

        if (error) {
            throw new DatabaseError(`Error validating saved sites: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        const publishedIds = new Set((data ?? []).map((row) => row.id as string));
        const invalidIds = siteIds.filter((id) => !publishedIds.has(id));
        if (invalidIds.length > 0) {
            throw new ValidationError(
                `One or more sites are invalid or not published: ${invalidIds.join(", ")}`
            );
        }
    }

    async findUserSavedSites(userId: string): Promise<{ data: LinkDirectorySavedSiteRow[] }> {
        const { data, error } = await this.supabase
            .from(TABLE_SAVED_SITES)
            .select(
                `id, user_id, site_id, sort_order, created_at, outreach_completed_at, site:link_directory_sites(${SELECT_SITE_FOR_SAVED_SITE})`
            )
            .eq("user_id", userId)
            .order("sort_order", { ascending: true });

        if (error) {
            throw new DatabaseError(`Error fetching saved sites: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        const rows = (data ?? []) as unknown as LinkDirectorySavedSiteRow[];
        return {
            data: rows.map((row) => ({
                ...row,
                site: row.site ? this.filterPublishedOpportunities(row.site) : row.site,
            })),
        };
    }

    async replaceUserSavedSites(userId: string, siteIds: string[]): Promise<void> {
        const { data: existingRows, error: fetchError } = await this.supabase
            .from(TABLE_SAVED_SITES)
            .select("site_id")
            .eq("user_id", userId);

        if (fetchError) {
            throw new DatabaseError(`Error fetching saved sites: ${fetchError.message}`, {
                cause: fetchError as unknown as Error,
                operation: "select",
            });
        }

        const previousSiteIds = new Set((existingRows ?? []).map((row) => row.site_id as string));
        const nextSiteIds = new Set(siteIds);

        const { error: deleteError } = await this.supabase
            .from(TABLE_SAVED_SITES)
            .delete()
            .eq("user_id", userId);

        if (deleteError) {
            throw new DatabaseError(`Error clearing saved sites: ${deleteError.message}`, {
                cause: deleteError as unknown as Error,
                operation: "delete",
            });
        }

        if (siteIds.length > 0) {
            const { error: insertError } = await this.supabase.from(TABLE_SAVED_SITES).insert(
                siteIds.map((siteId, index) => ({
                    user_id: userId,
                    site_id: siteId,
                    sort_order: index,
                }))
            );

            if (insertError) {
                throw new DatabaseError(`Error saving saved sites: ${insertError.message}`, {
                    cause: insertError as unknown as Error,
                    operation: "insert",
                });
            }
        }

        for (const siteId of nextSiteIds) {
            if (!previousSiteIds.has(siteId)) {
                await this.incrementSiteBookmarkCount(siteId);
            }
        }
        for (const siteId of previousSiteIds) {
            if (!nextSiteIds.has(siteId)) {
                await this.decrementSiteBookmarkCount(siteId);
            }
        }
    }

    async reorderUserSavedSites(userId: string, siteIds: string[]): Promise<void> {
        for (let index = 0; index < siteIds.length; index++) {
            const siteId = siteIds[index];
            const { error } = await this.supabase
                .from(TABLE_SAVED_SITES)
                .update({ sort_order: index })
                .eq("user_id", userId)
                .eq("site_id", siteId);

            if (error) {
                throw new DatabaseEntityNotFoundError("Saved site not found for reorder", {
                    userId,
                    siteId,
                });
            }
        }
    }

    async setUserSavedSiteOutreachCompleted(
        userId: string,
        siteId: string,
        outreachCompletedAt: string | null
    ): Promise<void> {
        const { data, error } = await this.supabase
            .from(TABLE_SAVED_SITES)
            .update({ outreach_completed_at: outreachCompletedAt })
            .eq("user_id", userId)
            .eq("site_id", siteId)
            .select("id")
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Error updating saved site outreach completion: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "update",
            });
        }

        if (!data) {
            throw new DatabaseEntityNotFoundError("Saved site not found for outreach completion update", {
                userId,
                siteId,
            });
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

    private async incrementSiteBookmarkCount(siteId: string): Promise<void> {
        const { error } = await this.supabase.rpc("increment_link_directory_site_field", {
            p_site_id: siteId,
            field_name: "bookmark_count",
        });

        if (error) {
            throw new DatabaseError(`Error incrementing site bookmark count: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "rpc",
            });
        }
    }

    private async decrementSiteBookmarkCount(siteId: string): Promise<void> {
        const { data: siteRow, error: fetchError } = await this.supabase
            .from(TABLE_SITES)
            .select("bookmark_count")
            .eq("id", siteId)
            .single();

        if (fetchError) {
            throw new DatabaseError(`Error fetching site bookmark count: ${fetchError.message}`, {
                cause: fetchError as unknown as Error,
                operation: "select",
            });
        }

        const nextCount = Math.max((siteRow?.bookmark_count as number | null) ?? 1, 1) - 1;
        const { error: updateError } = await this.supabase
            .from(TABLE_SITES)
            .update({ bookmark_count: nextCount })
            .eq("id", siteId);

        if (updateError) {
            throw new DatabaseError(`Error decrementing site bookmark count: ${updateError.message}`, {
                cause: updateError as unknown as Error,
                operation: "update",
            });
        }
    }

    async incrementSiteStatCounter(
        siteId: string,
        fieldName: "views" | "likes"
    ): Promise<void> {
        const { error } = await this.supabase.rpc("increment_link_directory_site_field", {
            p_site_id: siteId,
            field_name: fieldName,
        });

        if (error) {
            throw new DatabaseError(`Error incrementing site ${fieldName}: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "rpc",
            });
        }
    }

    async findSiteComments(siteId: string): Promise<{ data: LinkDirectorySiteComment[] }> {
        const { data, error } = await this.supabase
            .from(TABLE_SITE_COMMENTS)
            .select(SELECT_SITE_COMMENT)
            .eq("site_id", siteId)
            .eq("is_approved", true)
            .order("created_at", { ascending: true });

        if (error) {
            throw new DatabaseError(`Error fetching site comments: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_SITE_COMMENTS },
            });
        }

        return { data: this.mapSiteCommentRows(data ?? []) };
    }

    async createSiteComment(
        siteId: string,
        payload: LinkDirectorySiteCommentCreateSchemaType,
        userId: string
    ): Promise<{ id: string; site_id: string }> {
        const { data, error } = await this.supabase
            .from(TABLE_SITE_COMMENTS)
            .insert({
                site_id: siteId,
                parent_id: payload.parentId ?? null,
                content: payload.content,
                user_id: userId,
                is_approved: false,
            })
            .select("id, site_id")
            .single();

        if (error || !data?.id) {
            throw new DatabaseError(`Error creating site comment: ${error?.message ?? "no id returned"}`, {
                cause: error as unknown as Error,
                operation: "insert",
                resource: { type: "table", name: TABLE_SITE_COMMENTS },
            });
        }

        return { id: data.id as string, site_id: data.site_id as string };
    }

    async upsertSiteRating(
        siteId: string,
        userId: string,
        rating: number
    ): Promise<{ id: string }> {
        const { data, error } = await this.supabase
            .from(TABLE_SITE_RATINGS)
            .upsert(
                {
                    site_id: siteId,
                    user_id: userId,
                    rating,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id,site_id" }
            )
            .select("id")
            .single();

        if (error || !data?.id) {
            throw new DatabaseError(`Error upserting site rating: ${error?.message ?? "no id returned"}`, {
                cause: error as unknown as Error,
                operation: "upsert",
                resource: { type: "table", name: TABLE_SITE_RATINGS },
            });
        }

        return { id: data.id as string };
    }

    async findAdminSiteComments(
        options: AdminLinkDirectorySiteCommentsFilterOptions
    ): Promise<{ data: AdminLinkDirectorySiteComment[]; count: number }> {
        const { limit = 10, searchTerm, sortByKey, sortByOrder, range } = options;

        let query = this.supabase
            .from(TABLE_SITE_COMMENTS)
            .select(SELECT_SITE_COMMENT_ADMIN, { count: "exact" });

        if (searchTerm) {
            query = query.ilike("content", `%${searchTerm}%`);
        }

        const orderKey = resolveOrderKey(
            sortByKey ?? undefined,
            "created_at",
            ALLOWED_ADMIN_SITE_COMMENT_SORT_KEYS
        );
        query = query.order(orderKey, { ascending: sortByOrder ?? false });

        if (range) {
            query = query.range(range.start, range.end);
        } else {
            query = query.range(0, limit - 1);
        }

        const { data, error, count } = await query;

        if (error) {
            throw new DatabaseError(`Error fetching admin site comments: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
                resource: { type: "table", name: TABLE_SITE_COMMENTS },
            });
        }

        const rows = (data ?? []) as Array<{
            id: string;
            content: string;
            is_approved: boolean;
            created_at: string;
            updated_at: string | null;
            parent_id: string | null;
            user_id: string;
            site_id: string;
            author?:
                | Array<{ id: string; full_name: string | null; user_profiles?: { avatar_url?: string | null } | null }>
                | { id: string; full_name: string | null; user_profiles?: { avatar_url?: string | null } | null }
                | null;
            site?:
                | Array<{ id: string; title: string; slug: string }>
                | { id: string; title: string; slug: string }
                | null;
        }>;

        const comments: AdminLinkDirectorySiteComment[] = rows.map((row) => {
            const base = this.mapSiteCommentRows([row])[0];
            const rawSite = Array.isArray(row.site) ? row.site[0] ?? null : row.site ?? null;
            return {
                ...base,
                site_id: row.site_id,
                site: rawSite ? { id: rawSite.id, title: rawSite.title, slug: rawSite.slug } : null,
            };
        });

        return { data: comments, count: (count ?? 0) as number };
    }

    async approveSiteComment(commentId: string): Promise<{ id: string; site_id: string }> {
        const { data, error } = await this.supabase
            .from(TABLE_SITE_COMMENTS)
            .update({ is_approved: true, updated_at: new Date().toISOString() })
            .eq("id", commentId)
            .select("id, site_id")
            .single();

        if (error || !data?.id) {
            throw new DatabaseError("Error approving site comment", {
                cause: error as unknown as Error,
                operation: "update",
                resource: { type: "table", name: TABLE_SITE_COMMENTS },
            });
        }
        return { id: data.id as string, site_id: data.site_id as string };
    }

    async deleteSiteComment(commentId: string): Promise<{ site_id: string }> {
        const { data, error } = await this.supabase
            .from(TABLE_SITE_COMMENTS)
            .delete()
            .eq("id", commentId)
            .select("site_id")
            .single();

        if (error || !data?.site_id) {
            throw new DatabaseError("Error deleting site comment", {
                cause: error as unknown as Error,
                operation: "delete",
                resource: { type: "table", name: TABLE_SITE_COMMENTS },
            });
        }
        return { site_id: data.site_id as string };
    }

    private mapSiteCommentRows(rows: unknown[]): LinkDirectorySiteComment[] {
        return rows.map((row) => {
            const r = row as {
                id: string;
                content: string;
                is_approved: boolean;
                created_at: string;
                updated_at: string | null;
                parent_id: string | null;
                user_id: string;
                author?:
                    | Array<{ id: string; full_name: string | null; user_profiles?: { avatar_url?: string | null } | null }>
                    | { id: string; full_name: string | null; user_profiles?: { avatar_url?: string | null } | null }
                    | null;
            };
            const rawAuthor = Array.isArray(r.author) ? r.author[0] ?? null : r.author ?? null;
            const profile = rawAuthor?.user_profiles;
            const avatar_url =
                profile && typeof profile === "object" && "avatar_url" in profile
                    ? profile.avatar_url
                    : null;
            return {
                id: r.id,
                content: r.content,
                is_approved: r.is_approved,
                created_at: r.created_at,
                updated_at: r.updated_at ?? null,
                parent_id: r.parent_id ?? null,
                user_id: r.user_id,
                author: rawAuthor
                    ? { id: rawAuthor.id, full_name: rawAuthor.full_name ?? null, avatar_url: avatar_url ?? null }
                    : null,
            };
        });
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
