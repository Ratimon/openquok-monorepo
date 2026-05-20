import { planLimitsForTier } from "openquok-common";
import {
    DEV_SESSION_TOTAL_CHANNELS,
    resolveSessionPublicApiKey,
    resolveSessionTotalChannels,
    workspaceRoleToUserMeRole,
} from "./UserMeDTO";

describe("UserMeDTO", () => {
    describe("workspaceRoleToUserMeRole", () => {
        it("maps workspace roles to uppercase session roles", () => {
            expect(workspaceRoleToUserMeRole("user")).toBe("USER");
            expect(workspaceRoleToUserMeRole("admin")).toBe("ADMIN");
            expect(workspaceRoleToUserMeRole("superadmin")).toBe("SUPERADMIN");
        });
    });

    describe("resolveSessionTotalChannels", () => {
        it("returns generous cap when billing is disabled", () => {
            expect(
                resolveSessionTotalChannels(false, "FREE", planLimitsForTier("FREE"), null)
            ).toBe(DEV_SESSION_TOTAL_CHANNELS);
        });

        it("uses plan cap when subscription snapshot is zero", () => {
            const solo = planLimitsForTier("SOLO");
            expect(resolveSessionTotalChannels(true, "SOLO", solo, null)).toBe(solo.channel_per_workspace);
        });

        it("prefers max of snapshot and plan cap", () => {
            const solo = planLimitsForTier("SOLO");
            expect(
                resolveSessionTotalChannels(true, "SOLO", solo, {
                    total_channels: 25,
                } as never)
            ).toBe(25);
        });
    });

    describe("resolveSessionPublicApiKey", () => {
        it("returns empty for non-admin members", () => {
            expect(
                resolveSessionPublicApiKey({
                    workspaceRole: "user",
                    planAllowsPublicApi: true,
                    apiKey: "opk_secret",
                })
            ).toBe("");
        });

        it("returns empty when plan disallows public API", () => {
            expect(
                resolveSessionPublicApiKey({
                    workspaceRole: "admin",
                    planAllowsPublicApi: false,
                    apiKey: "opk_secret",
                })
            ).toBe("");
        });

        it("returns key for workspace admins on eligible plans", () => {
            expect(
                resolveSessionPublicApiKey({
                    workspaceRole: "admin",
                    planAllowsPublicApi: true,
                    apiKey: "opk_secret",
                })
            ).toBe("opk_secret");
        });
    });
});
