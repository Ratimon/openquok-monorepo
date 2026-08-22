import type { FullListingTag, ListingTagGroupRef, PartialListingTag } from "../../data/types/listingTagTypes";
import { ListingTagGroupDTOMapper, type ListingTagGroupDTO } from "./ListingTagGroupDTO";

export interface ListingTagDTO {
    id: string;
    name: string;
    slug: string;
    headline?: string | null;
    description?: string | null;
    image_url_hero?: string | null;
    image_url_small?: string | null;
    href?: string | null;
    color?: string | null;
    emoji?: string | null;
    listing_tag_groups: ListingTagGroupDTO[];
}

function asTagGroupRef(value: unknown): ListingTagGroupRef | null {
    if (!value || typeof value !== "object") return null;
    const record = value as Record<string, unknown>;
    const nested = record.listing_tag_groups;
    const candidate = (Array.isArray(nested) ? nested[0] : nested) ?? record;
    if (!candidate || typeof candidate !== "object") return null;
    const id = (candidate as { id?: unknown }).id;
    const name = (candidate as { name?: unknown }).name;
    if (typeof id !== "string" || typeof name !== "string") return null;
    return { id, name };
}

function unwrapTagGroups(raw: unknown): ListingTagGroupDTO[] {
    if (!Array.isArray(raw)) return [];

    const groups: ListingTagGroupDTO[] = [];
    const seen = new Set<string>();

    for (const entry of raw) {
        const group = asTagGroupRef(entry);
        if (!group || seen.has(group.id)) continue;
        seen.add(group.id);
        groups.push(ListingTagGroupDTOMapper.toDTO(group));
    }

    return groups;
}

export class ListingTagDTOMapper {
    static toDTO(tag: PartialListingTag | FullListingTag): ListingTagDTO {
        const dto: ListingTagDTO = {
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            listing_tag_groups: unwrapTagGroups(tag.listing_tag_groups),
        };

        if ("headline" in tag) {
            dto.headline = tag.headline ?? null;
            dto.description = tag.description ?? null;
            dto.image_url_hero = tag.image_url_hero ?? null;
            dto.image_url_small = tag.image_url_small ?? null;
            dto.href = tag.href ?? null;
            dto.color = tag.color ?? null;
            dto.emoji = tag.emoji ?? null;
        }

        return dto;
    }

    static toDTOCollection(tags: Array<PartialListingTag | FullListingTag>): ListingTagDTO[] {
        return tags.map((tag) => ListingTagDTOMapper.toDTO(tag));
    }
}
