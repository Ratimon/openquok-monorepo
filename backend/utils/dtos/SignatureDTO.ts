export interface SignatureDTO {
    id: string;
    title: string;
    content: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

/** DB-aligned row shape for public.signatures. */
export type SignatureLike = {
    id: string;
    organization_id: string;
    title: string;
    content: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
};

export function toSignatureDTO(row: SignatureLike): SignatureDTO {
    return {
        id: row.id,
        title: row.title ?? "",
        content: row.content ?? "",
        isDefault: row.is_default === true,
        createdAt: row.created_at ?? "",
        updatedAt: row.updated_at ?? "",
    };
}

export function toSignatureDTOCollection(rows: SignatureLike[]): SignatureDTO[] {
    return (rows ?? []).map(toSignatureDTO);
}
