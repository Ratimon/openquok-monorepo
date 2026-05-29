import { planLimitsForTier } from "openquok-common";
import {
    DEV_SESSION_CHANNELS_PER_WORKSPACE,
    resolveSessionPublicApiKey,
    resolveSessionChannelsPerWorkspace,
    workspaceRoleToUserMeRole,
} from "./UserMeDTO";

describe("UserMeDTO", () => {
    describe("workspaceRoleToUserMeRole", () => {
        it("maps workspace roles to uppercase session roles", () => {
            expect(workspaceRoleToUserMeRole("user")).toBe("USER");
            expect(workspaceRoleToUserMeRole("admin")).toBe("ADMIN");
            expect(workspaceRoleToUserMeRole("owner")).toBe("OWNER");
        });
    });

    describe("resolveSessionChannelsPerWorkspace", () => {
        it("returns generous cap when billing is disabled", () => {
            expect(
                resolveSessionChannelsPerWorkspace(false, "FREE", planLimitsForTier("FREE"), null)
            ).toBe(DEV_SESSION_CHANNELS_PER_WORKSPACE);
        });

        it("uses plan cap when subscription snapshot is zero", () => {
            const solo = planLimitsForTier("SOLO");
            expect(resolveSessionChannelsPerWorkspace(true, "SOLO", solo, null)).toBe(
                solo.channel_per_workspace
            );
        });

        it("prefers max of snapshot and plan cap", () => {
            const solo = planLimitsForTier("SOLO");
            expect(
                resolveSessionChannelsPerWorkspace(true, "SOLO", solo, {
                    channels_per_workspace: 25,
                } as never)
            ).toBe(25);
        });
    });

    describe("resolveSessionPublicApiKey", () => {
        it("always returns empty (tokens are not recoverable from storage)", () => {
            expect(
                resolveSessionPublicApiKey({
                    workspaceRole: "user",
                    planAllowsPublicApi: true,
                    apiKey: "opk_secret",
                })
            ).toBe("");
            expect(
                resolveSessionPublicApiKey({
                    workspaceRole: "admin",
                    planAllowsPublicApi: true,
                    apiKey: "opk_secret",
                })
            ).toBe("");
        });
    });
});
