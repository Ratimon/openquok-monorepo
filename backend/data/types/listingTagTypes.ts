export interface ListingTagGroupRef {
    id: string;
    name: string;
}

export interface PartialListingTag {
    id: string;
    name: string;
    slug: string;
    listing_tag_groups?: ListingTagGroupRef[];
}

export interface FullListingTag extends PartialListingTag {
    headline?: string | null;
    description?: string | null;
    image_url_hero?: string | null;
    image_url_small?: string | null;
    href?: string | null;
    color?: string | null;
    emoji?: string | null;
}

export interface ListingTagGroup {
    id: string;
    name: string;
}
