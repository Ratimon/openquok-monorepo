import { SubscriptionSection } from "openquok-common";

export type GuardKind =
    | "boolean"
    | "account_boolean"
    | "quota"
    | "account_quota"
    | "usage_bytes"
    | "role"
    | "share_post_preview"
    | "team_seat_invite"
    | "team_seat_member";

export interface GuardRegistryEntry {
    kind: GuardKind;
    deniedMessage: string;
}

export const GUARD_REGISTRY: Record<SubscriptionSection, GuardRegistryEntry> = {
    [SubscriptionSection.PUBLIC_API]: {
        kind: "boolean",
        deniedMessage: "Public API access is not included on your current plan.",
    },
    [SubscriptionSection.COMMUNITY_FEATURES]: {
        kind: "account_boolean",
        deniedMessage: "Community features are not included on your current plan.",
    },
    [SubscriptionSection.SHARE_POST_PREVIEW]: {
        kind: "share_post_preview",
        deniedMessage: "Shareable post previews are not included on your current plan.",
    },
    [SubscriptionSection.ADMIN]: {
        kind: "role",
        deniedMessage: "Workspace admin access is required.",
    },
    [SubscriptionSection.TEAM_MEMBERS_PER_WORKSPACE]: {
        kind: "boolean",
        deniedMessage: "Team members are not included on your current plan.",
    },
    [SubscriptionSection.MEDIA_STORAGE_BYTES_PER_WORKSPACE]: {
        kind: "usage_bytes",
        deniedMessage: "Workspace media storage limit reached. Upgrade your plan or delete files.",
    },
    [SubscriptionSection.CHANNEL_PER_WORKSPACE]: {
        kind: "quota",
        deniedMessage: "Social channels are not included on your current plan.",
    },
    [SubscriptionSection.POSTS_PER_MONTH]: {
        kind: "quota",
        deniedMessage: "Scheduled posts are not included on your current plan.",
    },
    [SubscriptionSection.WORKSPACES]: {
        kind: "account_quota",
        deniedMessage: "Your plan does not allow more workspaces. Upgrade to add more.",
    },
};

export const TEAM_INVITE_DENIED_MESSAGE =
    "Your plan does not include additional workspace seats. Upgrade to invite team members.";

export const TEAM_MEMBER_CAP_DENIED_MESSAGE =
    "This workspace has reached its team member limit for your current plan.";
