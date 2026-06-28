export type ListingKind = "extension" | "stack";
export type ExtensionType = "skills" | "mcp" | "both";
export type ListingActivityType = "view" | "like" | "bookmark" | "rating" | "comment" | "click";

export interface PublishedListingsFilterOptions {
    limit?: number;
    skipId?: string | null;
    skip?: number;
    searchTerm?: string | null;
    tagSlugs?: string[] | null;
    categorySlug?: string | null;
    extensionType?: ExtensionType | null;
    listingKind?: ListingKind;
    sortByKey?: string | null;
    sortByOrder?: boolean | null;
    range?: { start: number; end: number } | null;
    ownerId?: string | null;
}

export interface AdminListingsFilterOptions {
    limit?: number;
    searchTerm?: string | null;
    listingKind?: ListingKind | null;
    sortByKey?: string | null;
    sortByOrder?: boolean | null;
    range?: { start: number; end: number } | null;
}

export interface ListingCreator {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    tag_line: string | null;
    extension_count: number;
    stack_count: number;
    total_likes: number;
    total_bookmarks: number;
}

export interface ListingTagRef {
    id: string;
    slug: string;
    name?: string;
}

export interface ListingCategoryRef {
    id: string;
    slug: string;
    name?: string;
    parent_path?: string;
}
