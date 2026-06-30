export type ListingKind = "extension" | "stack";
export type ExtensionType = "skills" | "mcp" | "both";
export type StackMemberRole = "skills" | "mcp";
export type ListingActivityType = "view" | "like" | "bookmark" | "rating" | "comment" | "click";

export interface StackMemberRef {
    member_listing_id: string;
    member_role: StackMemberRole;
    sort_order: number;
}

export interface StackMemberListingSummary {
    id: string;
    title: string;
    slug: string;
    extension_type: string | null;
    excerpt: string | null;
    logo_image_url: string | null;
    is_official: boolean | null;
    install_command_skills: string | null;
    install_command_mcp: string | null;
}

export interface ListingStackMember {
    id: string;
    stack_listing_id: string;
    member_listing_id: string;
    member_role: StackMemberRole;
    sort_order: number;
    member: StackMemberListingSummary | null;
}

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

/** Author shape for a listing comment (from users join). */
export interface ListingCommentAuthor {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
}

/** Comment row as returned from repository (approved only, with author). */
export interface ListingComment {
    id: string;
    content: string;
    is_approved: boolean;
    created_at: string;
    updated_at: string | null;
    parent_id: string | null;
    user_id: string;
    author: ListingCommentAuthor | null;
}

/** Listing ref for admin comment/activity joins. */
export interface ListingActivityListingRef {
    id: string;
    title: string;
    slug: string;
}

/** Comment row for admin list (includes listing_id and optional joined listing ref). */
export interface AdminListingComment extends ListingComment {
    listing_id: string;
    listing: ListingActivityListingRef | null;
}

/** Filter options for admin listing comments list (all comments, no approved filter). */
export interface AdminListingCommentsFilterOptions {
    limit?: number;
    searchTerm?: string | null;
    sortByKey?: string | null;
    sortByOrder?: boolean | null;
    range?: { start: number; end: number } | null;
}

/** Filter options for admin listing activities list. */
export interface AdminListingActivitiesFilterOptions {
    limit?: number;
    sortByKey?: string | null;
    sortByOrder?: boolean | null;
    range?: { start: number; end: number } | null;
    listing_id?: string | null;
    activity_type?: ListingActivityType | null;
}

/** Author shape for a listing activity (from users join). */
export interface ListingActivityAuthor {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
}

/** Activity row for admin list. */
export interface AdminListingActivity {
    id: string;
    activity_type: ListingActivityType;
    created_at: string;
    user_id: string | null;
    listing_id: string;
    author: ListingActivityAuthor | null;
    listing: ListingActivityListingRef | null;
}
