
/**
 * Feedback DTO for API responses.
 */
export interface FeedbackDTO {
    id: string;
    feedbackType: string;
    url: string;
    description: string;
    email: string | null;
    isHandled: boolean;
    createdAt: string;
}

export interface FeedbackLike {
    id: string;
    feedback_type: string;
    url: string;
    description: string;
    email: string | null;
    is_handled: boolean;
    created_at: string;
}

export function toFeedbackDTO(row: FeedbackLike): FeedbackDTO {
    return {
        id: row.id,
        feedbackType: row.feedback_type ?? "",
        url: row.url ?? "",
        description: row.description ?? "",
        email: row.email ?? null,
        isHandled: row.is_handled ?? false,
        createdAt: row.created_at ?? "",
    };
}

export function toFeedbackDTOCollection(rows: FeedbackLike[]): FeedbackDTO[] {
    return (rows ?? []).map(toFeedbackDTO);
}
