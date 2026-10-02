import type { SupabaseClient } from "@supabase/supabase-js";
import type { LinkDirectoryTagGroupRow, LinkDirectoryTagRow } from "../data/types/linkDirectoryTypes";
import type {
    LinkDirectoryTagCreateSchemaType,
    LinkDirectoryTagGroupCreateSchemaType,
    LinkDirectoryTagUpdateSchemaType,
} from "../data/schemas/linkDirectorySchemas";
import { DatabaseError, ValidationError } from "../errors/InfraError";
import { stringToSlug } from "../utils/blog/slug";

const TABLE_TAGS = "link_directory_tags";
const TABLE_GROUPS = "link_directory_tag_groups";
const TABLE_GROUP_ASSOC = "link_directory_tag_groups_tags_association";

const TAG_SELECT = `
  id, name, slug, headline, description,
  link_directory_tag_groups:link_directory_tag_groups_tags_association(
    link_directory_tag_groups(id, name, sort_order)
  )
`;

export class LinkDirectoryTagRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async findActiveTags(): Promise<{ data: LinkDirectoryTagRow[] }> {
        const { data, error } = await this.supabase
            .from(TABLE_TAGS)
            .select(TAG_SELECT)
            .order("name", { ascending: true });

        if (error) {
            throw new DatabaseError(`Error fetching link directory tags: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: (data ?? []) as unknown as LinkDirectoryTagRow[] };
    }

    async findAllTags(): Promise<{ data: LinkDirectoryTagRow[] }> {
        return this.findActiveTags();
    }

    async findAllTagGroups(): Promise<{ data: LinkDirectoryTagGroupRow[] }> {
        const { data, error } = await this.supabase
            .from(TABLE_GROUPS)
            .select("id, name, sort_order")
            .order("sort_order", { ascending: true });

        if (error) {
            throw new DatabaseError(`Error fetching link directory tag groups: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: (data ?? []) as LinkDirectoryTagGroupRow[] };
    }

    async createTagGroup(payload: LinkDirectoryTagGroupCreateSchemaType): Promise<string> {
        const { data, error } = await this.supabase
            .from(TABLE_GROUPS)
            .insert(payload)
            .select("id")
            .single();

        if (error) {
            throw new DatabaseError(`Error creating link directory tag group: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "insert",
            });
        }

        return data.id as string;
    }

    async updateTagGroup(tagGroupId: string, payload: LinkDirectoryTagGroupCreateSchemaType): Promise<string> {
        const { data, error } = await this.supabase
            .from(TABLE_GROUPS)
            .update(payload)
            .eq("id", tagGroupId)
            .select("id")
            .single();

        if (error) {
            throw new DatabaseError(`Error updating link directory tag group: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "update",
            });
        }

        return data.id as string;
    }

    async deleteTagGroup(tagGroupId: string): Promise<void> {
        const { error } = await this.supabase.from(TABLE_GROUPS).delete().eq("id", tagGroupId);

        if (error) {
            throw new DatabaseError(`Error deleting link directory tag group: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "delete",
            });
        }
    }

    async createTag(payload: LinkDirectoryTagCreateSchemaType, groupIds: string[]): Promise<string> {
        const { data, error } = await this.supabase
            .from(TABLE_TAGS)
            .insert({
                ...payload,
                slug: payload.slug ?? stringToSlug(payload.name),
            })
            .select("id")
            .single();

        if (error) {
            if (error.message.includes("duplicate key value")) {
                throw new ValidationError("A tag with this slug already exists.");
            }
            throw new DatabaseError(`Error creating link directory tag: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "insert",
            });
        }

        await this.syncTagGroups(data.id as string, groupIds);
        return data.id as string;
    }

    async updateTag(payload: LinkDirectoryTagUpdateSchemaType, groupIds: string[]): Promise<string> {
        const { id, ...fields } = payload;
        const { data, error } = await this.supabase
            .from(TABLE_TAGS)
            .update({
                ...fields,
                slug: fields.slug ?? stringToSlug(payload.name),
            })
            .eq("id", id)
            .select("id")
            .single();

        if (error) {
            if (error.message.includes("duplicate key value")) {
                throw new ValidationError("A tag with this slug already exists.");
            }
            throw new DatabaseError(`Error updating link directory tag: ${error.message}`, {
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
            throw new DatabaseError(`Error deleting link directory tag: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "delete",
            });
        }
    }

    private async syncTagGroups(tagId: string, groupIds: string[]): Promise<void> {
        const { error: deleteError } = await this.supabase
            .from(TABLE_GROUP_ASSOC)
            .delete()
            .eq("link_directory_tag_id", tagId);

        if (deleteError) {
            throw new DatabaseError(`Error clearing tag groups: ${deleteError.message}`, {
                cause: deleteError as unknown as Error,
                operation: "delete",
            });
        }

        if (groupIds.length === 0) return;

        const { error: insertError } = await this.supabase.from(TABLE_GROUP_ASSOC).insert(
            groupIds.map((groupId) => ({
                link_directory_tag_id: tagId,
                link_directory_tag_group_id: groupId,
            }))
        );

        if (insertError) {
            throw new DatabaseError(`Error syncing tag groups: ${insertError.message}`, {
                cause: insertError as unknown as Error,
                operation: "insert",
            });
        }
    }
}
