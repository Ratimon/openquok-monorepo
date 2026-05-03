export interface SetDTO {
    id: string;
    organizationId: string;
    name: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

/** DB-aligned row shape for public.sets. */
export type SetLike = {
    id: string;
    organization_id: string;
    name: string;
    content: string;
    created_at: string;
    updated_at: string;
};

export function toSetDTO(row: SetLike): SetDTO {
    return {
        id: row.id,
        organizationId: row.organization_id ?? "",
        name: row.name ?? "",
        content: row.content ?? "",
        createdAt: row.created_at ?? "",
        updatedAt: row.updated_at ?? "",
    };
}

export function toSetDTOCollection(rows: SetLike[]): SetDTO[] {
    return (rows ?? []).map(toSetDTO);
}
