import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { assertMcpDirectoryLaunchEnabled } from "../assertMcpPlanCapability";
import { toAutoLaunchDestinationDtoCollection } from "../../utils/dtos/AutoLaunchDTO";
import { mcpJsonResult } from "./mcpJsonResult";
import type { DirectoryLaunchMcpDeps } from "./directoryMcpDeps";

export function registerDirectoryDestinationsListTool(
    server: McpServer,
    deps: DirectoryLaunchMcpDeps
): void {
    server.registerTool(
        "directoryDestinationsList",
        {
            description:
                "List published directory launch destinations (read-only catalog). Returns provider slugs, directory site keys (e.g. peerpush, uneed), and start URLs. Does not post or submit on directory sites.",
            inputSchema: {},
        },
        async () => {
            await assertMcpDirectoryLaunchEnabled(deps.subscriptionGuard);
            const rows = await deps.autoLaunchService.listPublishedDestinations();
            return mcpJsonResult({
                success: true,
                data: toAutoLaunchDestinationDtoCollection(rows),
            });
        }
    );
}
