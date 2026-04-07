export type NotificationEmailType = "success" | "fail" | "info";

export type DigestQueueEntry = {
  subject: string;
  message: string;
  type: NotificationEmailType;
};
