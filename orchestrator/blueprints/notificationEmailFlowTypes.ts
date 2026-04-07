/** Matches `createFlow` id; used as BullMQ `blueprintId`. */
export const NOTIFICATION_SEND_PLAIN_BLUEPRINT_ID = "notification-send-plain";

/** Bump when the send-plain graph or dispatch contract changes. */
export const NOTIFICATION_SEND_PLAIN_BLUEPRINT_VERSION = "1.1.0";

export const NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_ID = "notification-digest-flush";

export const NOTIFICATION_DIGEST_FLUSH_BLUEPRINT_VERSION = "1.0.0";

export type NotificationSendPlainFlowContext = {
    to: string;
    subject: string;
    html: string;
    replyTo?: string;
    blueprintVersion: string;
};

export type NotificationDigestFlushFlowContext = {
    blueprintVersion: string;
};

/** Injected into Flowcraft nodes for the notification-email BullMQ worker. */
export type NotificationEmailWorkflowDependencies = {
    sendPlain: (params: { to: string; subject: string; html: string; replyTo?: string }) => Promise<void>;
    /** Drains digest Redis buffers and sends combined mail per org. */
    flushAllPendingDigestEmails: () => Promise<void>;
    /**
     * Optional cluster-wide spacing before each send-plain (Redis). Wired in the worker from config.
     * Omitted in tests and in-process API sends.
     */
    acquireSendPlainSlot?: () => Promise<void>;
};
