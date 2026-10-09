import { config } from "../config/GlobalConfig";
import { signExtensionRefreshToken } from "../utils/auth/extensionRefreshToken";
import {
    activeMembershipRow,
    createIntegrationConnectionHarness,
    createMockManager,
    createMockProvider,
    defaultOAuthUser,
    mockFindMembershipResult,
    mockFindUserIdByAuthIdResult,
    orgId,
    sampleRow,
    authUserId,
    userId,
} from "./integrationConnectionService.unit.harness";

describe("IntegrationConnectionService.extensionRefresh", () => {
    const extensionSecret = "unit-test-extension-refresh";
    let harness = createIntegrationConnectionHarness();

    beforeEach(() => {
        harness = createIntegrationConnectionHarness();
        (config.auth as { inviteTokenSecret: string }).inviteTokenSecret = extensionSecret;
    });

    it("updates the integration token when cookies match the connected account", async () => {
        const row = sampleRow({
            provider_identifier: "skool",
            internal_id: "skool-user",
        });
        harness.integrations.getById.mockResolvedValue(row);
        const provider = createMockProvider({
            identifier: "skool",
            isChromeExtension: true,
            authenticate: jest.fn().mockResolvedValue({
                ...defaultOAuthUser,
                id: "skool-user",
                accessToken: JSON.stringify({ auth_token: "new", client_id: "cid" }),
            }),
        });
        harness.manager = createMockManager(provider);

        const token = signExtensionRefreshToken(
            {
                integrationId: row.id,
                organizationId: orgId,
                internalId: "skool-user",
                provider: "skool",
            },
            extensionSecret
        );

        const out = await harness.service().extensionRefresh("Y29kZQ==", token);
        expect(out).toEqual({ ok: true });
        expect(harness.integrations.upsertIntegration).toHaveBeenCalled();
        expect(harness.integrations.setRefreshNeeded).not.toHaveBeenCalled();
    });

    it("sets refresh_needed when Skool account id changes", async () => {
        const row = sampleRow({
            provider_identifier: "skool",
            internal_id: "skool-user",
        });
        harness.integrations.getById.mockResolvedValue(row);
        const provider = createMockProvider({
            identifier: "skool",
            isChromeExtension: true,
            authenticate: jest.fn().mockResolvedValue({
                ...defaultOAuthUser,
                id: "other-user",
                accessToken: JSON.stringify({ auth_token: "new", client_id: "cid" }),
            }),
        });
        harness.manager = createMockManager(provider);

        const token = signExtensionRefreshToken(
            {
                integrationId: row.id,
                organizationId: orgId,
                internalId: "skool-user",
                provider: "skool",
            },
            extensionSecret
        );

        await expect(harness.service().extensionRefresh("Y29kZQ==", token)).rejects.toMatchObject({
            statusCode: 400,
            metadata: { refresh_needed: true },
        });
        expect(harness.integrations.setRefreshNeeded).toHaveBeenCalledWith(orgId, row.id, true);
    });
});

describe("IntegrationConnectionService.connectSocialMedia (chrome extension)", () => {
    let harness = createIntegrationConnectionHarness();

    beforeEach(() => {
        harness = createIntegrationConnectionHarness();
    });

    it("skips OAuth login verifier for chrome-extension providers and returns extensionToken", async () => {
        const authConfig = config.auth as { inviteTokenSecret: string };
        const previousSecret = authConfig.inviteTokenSecret;
        authConfig.inviteTokenSecret = "unit-test-extension-secret";

        harness.orgRepo.findUserIdByAuthId.mockResolvedValue(mockFindUserIdByAuthIdResult(userId));
        harness.orgRepo.findMembership.mockResolvedValue(mockFindMembershipResult(activeMembershipRow()));

        const authenticate = jest.fn().mockResolvedValue({
            ...defaultOAuthUser,
            id: "skool-user",
            accessToken: JSON.stringify({ auth_token: "a", client_id: "b" }),
        });
        const provider = createMockProvider({
            identifier: "skool",
            isChromeExtension: true,
            authenticate,
        });
        harness.manager = createMockManager(provider);
        harness.cache.get.mockImplementation(async (key: string) => {
            if (key === "login:st") return null;
            if (key === "organization:st") return orgId;
            return null;
        });
        harness.integrations.upsertIntegration.mockResolvedValue(
            sampleRow({ id: "new-id", provider_identifier: "skool", internal_id: "skool-user" })
        );

        const out = await harness.service().connectSocialMedia(authUserId, "skool", {
            state: "st",
            code: "Y29kZQ==",
            timezone: "0",
        });

        expect(harness.cache.get).not.toHaveBeenCalledWith("login:st");
        expect(authenticate).toHaveBeenCalledWith(expect.objectContaining({ codeVerifier: "none" }), undefined);
        expect(out.extensionToken).toEqual(expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/));

        authConfig.inviteTokenSecret = previousSecret;
    });
});
