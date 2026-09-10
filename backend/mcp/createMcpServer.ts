import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AnalyticsService } from "../services/AnalyticsService";
import type { IntegrationConnectionService } from "../services/IntegrationConnectionService";
import type { IntegrationManager } from "../integrations/integrationManager";
import type { PostsService } from "../services/PostsService";
import type { ProgrammaticMediaUploadDeps } from "./media/uploadProgrammaticMediaFromUrl";
import { registerAnalyticsPlatformTool } from "./tools/analyticsPlatform";
import { registerAnalyticsPostTool } from "./tools/analyticsPost";
import { registerGroupListTool } from "./tools/groupList";
import { registerIntegrationListTool } from "./tools/integrationList";
import { registerIntegrationSchemaTool } from "./tools/integrationSchema";
import { registerPlugsActivateTool } from "./tools/plugsActivate";
import { registerPlugsCatalogTool } from "./tools/plugsCatalog";
import { registerPlugsDeleteTool } from "./tools/plugsDelete";
import { registerPlugsListTool } from "./tools/plugsList";
import { registerPlugsUpsertTool } from "./tools/plugsUpsert";
import { registerPostsConnectTool } from "./tools/postsConnect";
import { registerPostsDeleteTool } from "./tools/postsDelete";
import { registerPostsFindSlotTool } from "./tools/postsFindSlot";
import { registerPostsListTool } from "./tools/postsList";
import { registerPostsMissingTool } from "./tools/postsMissing";
import { registerPostsReviewTodoTool } from "./tools/postsReviewTodo";
import { registerPostsStatusTool } from "./tools/postsStatus";
import { registerSchedulePostTool } from "./tools/schedulePostTool";
import { registerTriggerTool } from "./tools/triggerTool";
import { registerUploadFromUrlTool } from "./tools/uploadFromUrl";

export type McpServerDeps = {
    integrationConnectionService: IntegrationConnectionService;
    integrationManager: IntegrationManager;
    postsService: PostsService;
    analyticsService: AnalyticsService;
    mediaUploadDeps: ProgrammaticMediaUploadDeps;
};

export function createMcpServer(deps: McpServerDeps): McpServer {
    const server = new McpServer(
        { name: "openquok", version: "1.0.0" },
        {
            instructions:
                "OpenQuok MCP tools schedule and manage social posts for the authenticated workspace. " +
                "Call groupList when channels are grouped, integrationList to discover connected channels, " +
                "integrationSchema for platform rules, then schedulePostTool to draft or schedule content. " +
                "Use postsList, postsStatus, and related tools to manage posts; analyticsPlatform and analyticsPost " +
                "for metrics; plugsCatalog through plugsDelete for global plug rules; uploadFromUrl for remote media.",
        }
    );

    registerGroupListTool(server, deps);
    registerIntegrationListTool(server, deps);
    registerIntegrationSchemaTool(server, deps);
    registerTriggerTool(server, deps);
    registerSchedulePostTool(server, deps);
    registerUploadFromUrlTool(server, deps);
    registerPostsListTool(server, deps);
    registerPostsFindSlotTool(server, deps);
    registerPostsStatusTool(server, deps);
    registerPostsReviewTodoTool(server, deps);
    registerPostsDeleteTool(server, deps);
    registerPostsMissingTool(server, deps);
    registerPostsConnectTool(server, deps);
    registerAnalyticsPlatformTool(server, deps);
    registerAnalyticsPostTool(server, deps);
    registerPlugsCatalogTool(server, deps);
    registerPlugsListTool(server, deps);
    registerPlugsUpsertTool(server, deps);
    registerPlugsActivateTool(server, deps);
    registerPlugsDeleteTool(server, deps);

    return server;
}
