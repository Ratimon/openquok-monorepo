import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { IntegrationConnectionService } from "../services/IntegrationConnectionService";
import type { IntegrationManager } from "../integrations/integrationManager";
import type { PostsService } from "../services/PostsService";
import type { ProgrammaticMediaUploadDeps } from "./media/uploadProgrammaticMediaFromUrl";
import { registerGroupListTool } from "./tools/groupList";
import { registerIntegrationListTool } from "./tools/integrationList";
import { registerIntegrationSchemaTool } from "./tools/integrationSchema";
import { registerTriggerTool } from "./tools/triggerTool";
import { registerSchedulePostTool } from "./tools/schedulePostTool";

export type McpServerDeps = {
    integrationConnectionService: IntegrationConnectionService;
    integrationManager: IntegrationManager;
    postsService: PostsService;
    mediaUploadDeps: ProgrammaticMediaUploadDeps;
};

export function createMcpServer(deps: McpServerDeps): McpServer {
    const server = new McpServer(
        { name: "openquok", version: "1.0.0" },
        {
            instructions:
                "OpenQuok MCP tools schedule and manage social posts for the authenticated workspace. " +
                "Call groupList when channels are grouped, integrationList to discover connected channels, " +
                "integrationSchema for platform rules, then schedulePostTool to draft or schedule content.",
        }
    );

    registerGroupListTool(server, deps);
    registerIntegrationListTool(server, deps);
    registerIntegrationSchemaTool(server, deps);
    registerTriggerTool(server, deps);
    registerSchedulePostTool(server, deps);

    return server;
}
