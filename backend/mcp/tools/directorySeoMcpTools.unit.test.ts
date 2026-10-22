import { describe, expect, it } from "@jest/globals";
import { SubscriptionSection } from "openquok-common";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerDirectorySeoOverviewTool } from "./directorySeoOverview";
import { registerDirectorySeoHistoryTool } from "./directorySeoHistory";
import { registerDirectorySeoRefreshTool } from "./directorySeoRefresh";
import { registerDirectorySeoCompetitorsAddTool } from "./directorySeoCompetitorsAdd";
import { registerDirectorySeoCompetitorsRemoveTool } from "./directorySeoCompetitorsRemove";

function seoDeps(overrides: Record<string, unknown> = {}) {
    return {
        directorySeoWorkspaceService: {
            getWorkspaceOverview: jest.fn().mockResolvedValue({
                providerConfigured: true,
                manualRefreshAvailableAt: null,
            }),
            getWorkspaceHistory: jest.fn().mockResolvedValue({ product: [], competitors: [] }),
            refreshWorkspace: jest.fn().mockResolvedValue({ providerConfigured: true }),
            addCompetitor: jest.fn().mockResolvedValue({ domain: "rival.com" }),
            deleteCompetitor: jest.fn().mockResolvedValue(undefined),
            ...overrides,
        },
        subscriptionGuard: {
            assert: jest.fn().mockResolvedValue(undefined),
        },
    };
}

describe("directory SEO MCP tools", () => {
    it("directorySeoOverview asserts DIRECTORY_SEO_ENABLED", async () => {
        const deps = seoDeps();
        const run = captureMcpToolHandler("directorySeoOverview", registerDirectorySeoOverviewTool, deps);

        await run({ productProfileId: "prof-1" });

        expect(deps.subscriptionGuard.assert).toHaveBeenCalledWith(SubscriptionSection.DIRECTORY_SEO_ENABLED, {
            scope: "workspace",
            organizationId: "org-1",
            publicUserId: "user-1",
        });
        expect(deps.directorySeoWorkspaceService.getWorkspaceOverview).toHaveBeenCalledWith(
            "user-1",
            "org-1",
            "prof-1"
        );
    });

    it("directorySeoHistory defaults days to 90", async () => {
        const deps = seoDeps();
        const run = captureMcpToolHandler("directorySeoHistory", registerDirectorySeoHistoryTool, deps);

        await run({ productProfileId: "prof-1" });

        expect(deps.directorySeoWorkspaceService.getWorkspaceHistory).toHaveBeenCalledWith(
            "user-1",
            "org-1",
            "prof-1",
            90
        );
    });

    it("directorySeoRefresh passes force flag", async () => {
        const deps = seoDeps();
        const run = captureMcpToolHandler("directorySeoRefresh", registerDirectorySeoRefreshTool, deps);

        await run({ productProfileId: "prof-1", force: true });

        expect(deps.directorySeoWorkspaceService.refreshWorkspace).toHaveBeenCalledWith("user-1", {
            organizationId: "org-1",
            productProfileId: "prof-1",
            force: true,
        });
    });

    it("directorySeoCompetitorsAdd requires domain", async () => {
        const deps = seoDeps();
        const run = captureMcpToolHandler("directorySeoCompetitorsAdd", registerDirectorySeoCompetitorsAddTool, deps);

        await expect(run({ domain: "" })).rejects.toThrow("domain is required");
    });

    it("directorySeoCompetitorsRemove calls service", async () => {
        const deps = seoDeps();
        const run = captureMcpToolHandler(
            "directorySeoCompetitorsRemove",
            registerDirectorySeoCompetitorsRemoveTool,
            deps
        );

        const result = await run({ domain: "rival.com" });

        expect(deps.directorySeoWorkspaceService.deleteCompetitor).toHaveBeenCalledWith("user-1", {
            organizationId: "org-1",
            domain: "rival.com",
        });
        expect(result.structuredContent).toEqual({ success: true, message: "Competitor removed" });
    });
});
