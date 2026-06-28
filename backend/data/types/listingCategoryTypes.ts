export interface ListingCategoryGroupRef {
    id: string;
    name: string;
}

export interface PartialListingCategory {
    id: string;
    name: string;
    slug: string;
    parent_path?: string;
    listing_category_groups?: ListingCategoryGroupRef[];
}

export interface FullListingCategory extends PartialListingCategory {
    headline?: string | null;
    description?: string | null;
    image_url_hero?: string | null;
    image_url_small?: string | null;
    href?: string | null;
    color?: string | null;
    emoji?: string | null;
}

export interface ListingCategoryGroup {
    id: string;
    name: string;
}

export interface CategoryPaginationOptions {
    limit?: number;
    offset?: number;
}
