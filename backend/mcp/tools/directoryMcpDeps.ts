import type { AutoLaunchService } from "../../services/AutoLaunchService";
import type { DirectorySeoWorkspaceService } from "../../services/DirectorySeoWorkspaceService";
import type { SubscriptionGuardService } from "../../guards/subscription/SubscriptionGuardService";

export type DirectoryLaunchMcpDeps = {
    autoLaunchService: AutoLaunchService;
    subscriptionGuard: SubscriptionGuardService;
};

export type DirectorySeoMcpDeps = {
    directorySeoWorkspaceService: DirectorySeoWorkspaceService;
    subscriptionGuard: SubscriptionGuardService;
};
