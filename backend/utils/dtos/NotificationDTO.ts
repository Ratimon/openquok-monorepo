/** Row shape from `notifications` table. */
export type NotificationLike = {
    id: string;
    organization_id: string;
    content: string;
    link: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};
