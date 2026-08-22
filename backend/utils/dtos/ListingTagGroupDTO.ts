import type { ListingTagGroup } from "../../data/types/listingTagTypes";

export interface ListingTagGroupDTO {
    id: string;
    name: string;
}

export class ListingTagGroupDTOMapper {
    static toDTO(group: ListingTagGroup): ListingTagGroupDTO {
        return {
            id: group.id,
            name: group.name,
        };
    }

    static toDTOCollection(groups: ListingTagGroup[]): ListingTagGroupDTO[] {
        return groups.map((group) => ListingTagGroupDTOMapper.toDTO(group));
    }
}
