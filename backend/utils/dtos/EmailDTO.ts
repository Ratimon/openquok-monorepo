/**
 * Shapes for super-admin email APIs backed by Resend (list/get receiving, send).
 * Controllers return JSON matching these envelopes; fields inside `data` follow Resend where applicable.
 */

/** Row from Resend list received emails (subset). */
export interface ResendReceivedEmailSummaryDTO {
    id: string;
    to: string[];
    from: string;
    created_at: string;
    subject: string;
    message_id: string;
}

export interface ListReceivedEmailsDataDTO {
    object: "list";
    has_more: boolean;
    data: ResendReceivedEmailSummaryDTO[];
}

export interface GetReceivedEmailDataDTO extends Record<string, unknown> {
    id: string;
    subject?: string;
    from?: string;
    to?: string[];
    created_at?: string;
    html?: string | null;
    text?: string | null;
    message_id?: string;
}

export interface SendEmailDataDTO {
    id: string;
}
