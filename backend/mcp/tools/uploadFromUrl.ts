import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ProgrammaticMediaUploadDeps } from "../media/uploadProgrammaticMediaFromUrl";
import { uploadProgrammaticMediaFromUrl } from "../media/uploadProgrammaticMediaFromUrl";
import { getMcpContext } from "../context";
import { mcpJsonResult } from "./mcpJsonResult";

export function registerUploadFromUrlTool(
    server: McpServer,
    deps: { mediaUploadDeps: ProgrammaticMediaUploadDeps }
): void {
    server.registerTool(
        "uploadFromUrl",
        {
            description:
                "Fetch a public HTTPS image or video URL into workspace media and return id and path for schedulePostTool.",
            inputSchema: {
                url: z.string().describe("Public http(s) URL to fetch and store as workspace media"),
            },
        },
        async ({ url }) => {
            const trimmed = url?.trim();
            if (!trimmed) {
                throw new Error("url is required");
            }

            const { organizationId } = getMcpContext();
            const saved = await uploadProgrammaticMediaFromUrl(organizationId, trimmed, deps.mediaUploadDeps);
            return mcpJsonResult(saved);
        }
    );
}
