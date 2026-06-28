import type { SupabaseClient } from "@supabase/supabase-js";
import type {
    PartialListingTag,
    FullListingTag,
    ListingTagGroup,
} from "../data/types/listingTagTypes";
import type {
    ListingTagCreateSchemaType,
    ListingTagUpdateSchemaType,
} from "../data/schemas/listingTagSchemas";
import { DatabaseError, ValidationError } from "../errors/InfraError";
import { stringToSlug } from "../utils/blog/slug";

const TABLE_TAGS = "listing_tags";
const TABLE_GROUPS = "listing_tag_groups";
const TABLE_GROUP_ASSOC = "listing_tag_groups_listing_tags_association";

const FULL_SELECT = `
  id, name, slug, headline, description, image_url_hero, image_url_small,
  href, color, emoji,
  listing_tag_groups:listing_tag_groups_listing_tags_association(
    listing_tag_groups(id, name)
  )
`;

export class ListingTagRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async findActivePartialTags(): Promise<{ data: PartialListingTag[] }> {
        const { data, error } = await this.supabase.rpc("get_active_listing_tags");

        if (error) {
            throw new DatabaseError(`Error fetching active tags: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "rpc",
            });
        }

        return { data: (data ?? []) as PartialListingTag[] };
    }

    async findActiveFullTags(): Promise<{ data: FullListingTag[] }> {
        const { data, error } = await this.supabase.rpc("get_full_active_listing_tags");

        if (error) {
            throw new DatabaseError(`Error fetching active full tags: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "rpc",
            });
        }

        return { data: (data ?? []) as unknown as FullListingTag[] };
    }

    async findAllFullTags(): Promise<{ data: FullListingTag[] }> {
        const { data, error } = await this.supabase.from(TABLE_TAGS).select(FULL_SELECT);

        if (error) {
            throw new DatabaseError(`Error fetching tags: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: (data ?? []) as unknown as FullListingTag[] };
    }

    async findTagById(tagId: string): Promise<{ data: FullListingTag }> {
        const { data, error } = await this.supabase
            .from(TABLE_TAGS)
            .select(FULL_SELECT)
            .eq("id", tagId)
            .single();

        if (error) {
            throw new DatabaseError(`Error fetching tag: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: data as unknown as FullListingTag };
    }

    async createTag(payload: ListingTagCreateSchemaType, groupIds: string[]): Promise<string> {
        const { id: _id, ...fields } = payload;
        const { data, error } = await this.supabase
            .from(TABLE_TAGS)
            .insert({
                ...fields,
                slug: fields.slug ?? stringToSlug(payload.name),
            })
            .select("id")
            .single();

        if (error) {
            if (error.message.includes("duplicate key value")) {
                throw new ValidationError("A tag with this slug already exists.");
            }
            throw new DatabaseError(`Error creating tag: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "insert",
            });
        }

        await this.syncTagGroups(data.id as string, groupIds);
        return data.id as string;
    }

    async updateTag(payload: ListingTagUpdateSchemaType, groupIds: string[]): Promise<string> {
        const { id, ...fields } = payload;
        const { data, error } = await this.supabase
            .from(TABLE_TAGS)
            .update({
                ...fields,
                slug: fields.slug ?? stringToSlug(payload.name),
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select("id")
            .single();

        if (error) {
            throw new DatabaseError(`Error updating tag: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "update",
            });
        }

        await this.syncTagGroups(id, groupIds);
        return data.id as string;
    }

    async deleteTag(tagId: string): Promise<void> {
        const { error } = await this.supabase.from(TABLE_TAGS).delete().eq("id", tagId);

        if (error) {
            throw new DatabaseError(`Error deleting tag: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "delete",
            });
        }
    }

    async findAllTagGroups(): Promise<{ data: ListingTagGroup[] }> {
        const { data, error } = await this.supabase.from(TABLE_GROUPS).select("id, name");

        if (error) {
            throw new DatabaseError(`Error fetching tag groups: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: (data ?? []) as ListingTagGroup[] };
    }

    private async syncTagGroups(tagId: string, groupIds: string[]): Promise<void> {
        await this.supabase.from(TABLE_GROUP_ASSOC).delete().eq("listing_tag_id", tagId);

        if (groupIds.length === 0) return;

        const { error } = await this.supabase.from(TABLE_GROUP_ASSOC).insert(
            groupIds.map((groupId) => ({
                listing_tag_id: tagId,
                listing_tag_group_id: groupId,
            }))
        );

        if (error) {
            throw new DatabaseError(`Error syncing tag groups: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "insert",
            });
        }
    }
}
