/** Row shape from `media` table. */
export type MediaLike = {
    id: string;
    name: string;
    original_name: string | null;
    path: string;
    virtual_path: string;
    organization_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    file_size: number;
    type: string;
    thumbnail: string | null;
    alt: string | null;
    thumbnail_timestamp: number | null;
};
