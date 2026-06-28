import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    PartialListingCategory,
    FullListingCategory,
    CategoryPaginationOptions,
    ListingCategoryGroup,
} from "../data/types/listingCategoryTypes";
import type {
    ListingCategoryCreateSchemaType,
    ListingCategoryUpdateSchemaType,
} from "../data/schemas/listingCategorySchemas";
import { DatabaseError, ValidationError } from "../errors/InfraError";
import { stringToSlug } from "../utils/blog/slug";

const TABLE_CATEGORIES = "listing_categories";
const TABLE_GROUPS = "listing_category_groups";
const TABLE_GROUP_ASSOC = "listing_category_groups_listing_categories_association";

const PARTIAL_SELECT = `
  id, name, slug, parent_path,
  listing_category_groups:listing_category_groups_listing_categories_association(
    listing_category_groups(id, name)
  )
`;

const FULL_SELECT = `
  id, name, slug, headline, description, image_url_hero, image_url_small,
  href, color, emoji, parent_id, parent_path,
  listing_category_groups:listing_category_groups_listing_categories_association(
    listing_category_groups(id, name)
  )
`;

export class ListingCategoryRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async findActivePartialCategories(
        options: CategoryPaginationOptions = {}
    ): Promise<{ data: PartialListingCategory[] }> {
        const { limit, offset } = options;
        let query = this.supabase.rpc("get_active_listing_categories");

        if (limit !== undefined && offset !== undefined) {
            query = query.range(offset, offset + limit - 1);
        }

        const { data, error } = await query;

        if (error) {
            throw new DatabaseError(`Error fetching active categories: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "rpc",
            });
        }

        return { data: (data ?? []) as unknown as PartialListingCategory[] };
    }

    async findActiveFullCategories(
        options: CategoryPaginationOptions = {}
    ): Promise<{ data: FullListingCategory[] }> {
        const { limit, offset } = options;
        let query = this.supabase.rpc("get_full_active_listing_categories");

        if (limit !== undefined && offset !== undefined) {
            query = query.range(offset, offset + limit - 1);
        }

        const { data, error } = await query;

        if (error) {
            throw new DatabaseError(`Error fetching active full categories: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "rpc",
            });
        }

        return { data: (data ?? []) as unknown as FullListingCategory[] };
    }

    async findAllPartialCategories(): Promise<{ data: PartialListingCategory[] }> {
        const { data, error } = await this.supabase.from(TABLE_CATEGORIES).select(PARTIAL_SELECT);

        if (error) {
            throw new DatabaseError(`Error fetching categories: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: (data ?? []) as unknown as PartialListingCategory[] };
    }

    async findAllFullCategories(): Promise<{ data: FullListingCategory[] }> {
        const { data, error } = await this.supabase.from(TABLE_CATEGORIES).select(FULL_SELECT);

        if (error) {
            throw new DatabaseError(`Error fetching full categories: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: (data ?? []) as unknown as FullListingCategory[] };
    }

    async findCategoryById(categoryId: string): Promise<{ data: FullListingCategory }> {
        const { data, error } = await this.supabase
            .from(TABLE_CATEGORIES)
            .select(FULL_SELECT)
            .eq("id", categoryId)
            .single();

        if (error) {
            throw new DatabaseError(`Error fetching category: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: data as unknown as FullListingCategory };
    }

    async createCategory(
        payload: ListingCategoryCreateSchemaType,
        groupIds: string[]
    ): Promise<string> {
        const { id: _id, ...fields } = payload;
        const { data, error } = await this.supabase
            .from(TABLE_CATEGORIES)
            .insert({
                ...fields,
                slug: fields.slug ?? stringToSlug(payload.name),
            })
            .select("id")
            .single();

        if (error) {
            if (error.message.includes("duplicate key value")) {
                throw new ValidationError("A category with this slug already exists.");
            }
            throw new DatabaseError(`Error creating category: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "insert",
            });
        }

        await this.syncCategoryGroups(data.id as string, groupIds);
        return data.id as string;
    }

    async updateCategory(
        payload: ListingCategoryUpdateSchemaType,
        groupIds: string[]
    ): Promise<string> {
        const { id, ...fields } = payload;
        const { data, error } = await this.supabase
            .from(TABLE_CATEGORIES)
            .update({
                ...fields,
                slug: fields.slug ?? stringToSlug(payload.name),
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select("id")
            .single();

        if (error) {
            throw new DatabaseError(`Error updating category: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "update",
            });
        }

        await this.syncCategoryGroups(id, groupIds);
        return data.id as string;
    }

    async deleteCategory(categoryId: string): Promise<void> {
        const { error } = await this.supabase.from(TABLE_CATEGORIES).delete().eq("id", categoryId);

        if (error) {
            throw new DatabaseError(`Error deleting category: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "delete",
            });
        }
    }

    async findAllCategoryGroups(): Promise<{ data: ListingCategoryGroup[] }> {
        const { data, error } = await this.supabase.from(TABLE_GROUPS).select("id, name");

        if (error) {
            throw new DatabaseError(`Error fetching category groups: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: (data ?? []) as ListingCategoryGroup[] };
    }

    private async syncCategoryGroups(categoryId: string, groupIds: string[]): Promise<void> {
        await this.supabase.from(TABLE_GROUP_ASSOC).delete().eq("listing_category_id", categoryId);

        if (groupIds.length === 0) return;

        const { error } = await this.supabase.from(TABLE_GROUP_ASSOC).insert(
            groupIds.map((groupId) => ({
                listing_category_id: categoryId,
                listing_category_group_id: groupId,
            }))
        );

        if (error) {
            throw new DatabaseError(`Error syncing category groups: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "insert",
            });
        }
    }
}
