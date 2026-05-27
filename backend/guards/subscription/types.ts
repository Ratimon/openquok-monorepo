import type { SubscriptionSection } from "openquok-common";

export type WorkspaceMembershipRole = "user" | "admin" | "owner";

type WorkspaceGuardBase = {
    organizationId: string;
    authUserId?: string;
    workspaceRole?: WorkspaceMembershipRole;
};

export type SubscriptionGuardAccountContext = {
    scope: "account";
    authUserId: string;
};

export type SubscriptionGuardWorkspaceContext = WorkspaceGuardBase & {
    scope: "workspace";
    /** Additional scheduled post rows about to be inserted or flipped to `QUEUE`. */
    delta?: number;
    /** Extra bytes for media upload checks (`usage_bytes`). */
    additionalBytes?: number;
};

export type SubscriptionGuardWorkspaceWithDeltaContext = WorkspaceGuardBase & {
    scope: "workspaceWithDelta";
    delta: number;
};

export type SubscriptionGuardWorkspaceWithReconnectContext = WorkspaceGuardBase & {
    scope: "workspaceWithReconnect";
    reconnectInternalId: string;
};

export type SubscriptionGuardContext =
    | SubscriptionGuardAccountContext
    | SubscriptionGuardWorkspaceContext
    | SubscriptionGuardWorkspaceWithDeltaContext
    | SubscriptionGuardWorkspaceWithReconnectContext;

export type SubscriptionGuardSection = SubscriptionSection;
