import { describe, expect, it } from "@jest/globals";
import { SubscriptionSection } from "openquok-common";

import { captureMcpToolHandler } from "./mcpToolTestUtils";
import { registerDirectoryDestinationsListTool } from "./directoryDestinationsList";
import { registerDirectoryProfilesListTool } from "./directoryProfilesList";
import { registerDirectoryProfilesGetTool } from "./directoryProfilesGet";
import { registerDirectoryVariantsEnsureTool } from "./directoryVariantsEnsure";
import { registerDirectoryListingSummaryTool } from "./directoryListingSummary";

function launchDeps(overrides: Record<string, unknown> = {}) {
    return {
        autoLaunchService: {
            listPublishedDestinations: jest.fn().mockResolvedValue([]),
            listProfilesProgrammatic: jest.fn().mockResolvedValue([]),
            getProfileProgrammatic: jest.fn().mockResolvedValue({ id: "p1" }),
            ensureDirectoryVariantProgrammatic: jest.fn().mockResolvedValue({
                profile: { id: "v1" },
                created: true,
            }),
            getProfileListingSummaryForOrganization: jest.fn().mockResolvedValue({ profileId: "p1" }),
            ...overrides,
        },
        subscriptionGuard: {
            assert: jest.fn().mockResolvedValue(undefined),
        },
    };
}

describe("directory launch MCP tools", () => {
    it("directoryDestinationsList asserts plan and lists destinations", async () => {
        const deps = launchDeps();
        const run = captureMcpToolHandler("directoryDestinationsList", registerDirectoryDestinationsListTool, deps);

        const result = await run({});

        expect(deps.subscriptionGuard.assert).toHaveBeenCalledWith(SubscriptionSection.DIRECTORY_LAUNCH_ENABLED, {
            scope: "workspace",
            organizationId: "org-1",
            publicUserId: "user-1",
        });
        expect(deps.autoLaunchService.listPublishedDestinations).toHaveBeenCalled();
        expect(result.structuredContent).toEqual({ success: true, data: [] });
    });

    it("directoryProfilesList filters mainOnly", async () => {
        const deps = launchDeps({
            listProfilesProgrammatic: jest.fn().mockResolvedValue([
                { id: "main", parentProfileId: null },
                { id: "variant", parentProfileId: "main" },
            ]),
        });
        const run = captureMcpToolHandler("directoryProfilesList", registerDirectoryProfilesListTool, deps);

        const result = await run({ mainOnly: true });

        expect(result.structuredContent).toEqual({
            success: true,
            data: [{ id: "main", parentProfileId: null }],
        });
    });

    it("directoryProfilesGet requires a profile", async () => {
        const deps = launchDeps({
            getProfileProgrammatic: jest.fn().mockResolvedValue(null),
        });
        const run = captureMcpToolHandler("directoryProfilesGet", registerDirectoryProfilesGetTool, deps);

        await expect(run({ productProfileId: "missing" })).rejects.toThrow("Product profile not found");
    });

    it("directoryVariantsEnsure is idempotent", async () => {
        const deps = launchDeps();
        const run = captureMcpToolHandler("directoryVariantsEnsure", registerDirectoryVariantsEnsureTool, deps);

        const result = await run({
            mainProductProfileId: "main-1",
            directorySiteKey: "peerpush",
        });

        expect(deps.autoLaunchService.ensureDirectoryVariantProgrammatic).toHaveBeenCalledWith(
            "org-1",
            "user-1",
            "main-1",
            { directorySiteKey: "peerpush", name: undefined }
        );
        expect(result.structuredContent).toMatchObject({
            success: true,
            data: { id: "v1" },
            created: true,
        });
    });

    it("directoryListingSummary loads summary for org", async () => {
        const deps = launchDeps();
        const run = captureMcpToolHandler("directoryListingSummary", registerDirectoryListingSummaryTool, deps);

        await run({ productProfileId: "p-99" });

        expect(deps.autoLaunchService.getProfileListingSummaryForOrganization).toHaveBeenCalledWith(
            "org-1",
            "p-99"
        );
    });
});
