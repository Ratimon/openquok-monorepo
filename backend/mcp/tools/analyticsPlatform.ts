import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AnalyticsService } from "../../services/AnalyticsService";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

const daysSchema = z.union([z.literal(7), z.literal(30), z.literal(90)]);

export function registerAnalyticsPlatformTool(
    server: McpServer,
    deps: { analyticsService: AnalyticsService }
): void {
    server.registerTool(
        "analyticsPlatform",
        {
            description:
                "Platform-level metrics for a connected channel. days must be 7, 30, or 90.",
            inputSchema: {
                integrationId: z.string().describe("Connected channel id from integrationList"),
                days: daysSchema.describe("Lookback window in days: 7, 30, or 90"),
            },
        },
        async ({ integrationId, days }) => {
            const channelId = integrationId?.trim();
            if (!channelId) {
                throw new Error("integrationId is required");
            }

            const { organizationId } = getMcpContext();
            const data = await deps.analyticsService.getIntegrationAnalyticsProgrammatic({
                organizationId,
                integrationId: channelId,
                date: days,
            });
            return mcpJsonResult({ success: true, data });
        }
    );
}
