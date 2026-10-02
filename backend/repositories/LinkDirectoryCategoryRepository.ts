import type { SupabaseClient } from "@supabase/supabase-js";
import type { LinkDirectoryCategoryRow } from "../data/types/linkDirectoryTypes";
import type {
    LinkDirectoryCategoryCreateSchemaType,
    LinkDirectoryCategoryUpdateSchemaType,
} from "../data/schemas/linkDirectorySchemas";
import { DatabaseError, ValidationError } from "../errors/InfraError";
import { stringToSlug } from "../utils/blog/slug";

const TABLE = "link_directory_categories";

const SELECT = `
  id, name, slug, headline, description, sort_order, openquok_channels_hub_path, created_at, updated_at
`;

export class LinkDirectoryCategoryRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async findActiveCategories(): Promise<{ data: LinkDirectoryCategoryRow[] }> {
        const { data, error } = await this.supabase
            .from(TABLE)
            .select(SELECT)
            .order("sort_order", { ascending: true });

        if (error) {
            throw new DatabaseError(`Error fetching link directory categories: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: (data ?? []) as LinkDirectoryCategoryRow[] };
    }

    async findAllCategories(): Promise<{ data: LinkDirectoryCategoryRow[] }> {
        return this.findActiveCategories();
    }

    async findCategoryById(categoryId: string): Promise<{ data: LinkDirectoryCategoryRow }> {
        const { data, error } = await this.supabase
            .from(TABLE)
            .select(SELECT)
            .eq("id", categoryId)
            .single();

        if (error) {
            throw new DatabaseError(`Error fetching link directory category: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "select",
            });
        }

        return { data: data as LinkDirectoryCategoryRow };
    }

    async createCategory(payload: LinkDirectoryCategoryCreateSchemaType): Promise<string> {
        const { data, error } = await this.supabase
            .from(TABLE)
            .insert({
                ...payload,
                slug: payload.slug ?? stringToSlug(payload.name),
            })
            .select("id")
            .single();

        if (error) {
            if (error.message.includes("duplicate key value")) {
                throw new ValidationError("A category with this slug already exists.");
            }
            throw new DatabaseError(`Error creating link directory category: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "insert",
            });
        }

        return data.id as string;
    }

    async updateCategory(payload: LinkDirectoryCategoryUpdateSchemaType): Promise<string> {
        const { id, ...fields } = payload;
        const { data, error } = await this.supabase
            .from(TABLE)
            .update({
                ...fields,
                slug: fields.slug ?? stringToSlug(payload.name),
            })
            .eq("id", id)
            .select("id")
            .single();

        if (error) {
            if (error.message.includes("duplicate key value")) {
                throw new ValidationError("A category with this slug already exists.");
            }
            throw new DatabaseError(`Error updating link directory category: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "update",
            });
        }

        return data.id as string;
    }

    async deleteCategory(categoryId: string): Promise<void> {
        const { error } = await this.supabase.from(TABLE).delete().eq("id", categoryId);

        if (error) {
            throw new DatabaseError(`Error deleting link directory category: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "delete",
            });
        }
    }
}
