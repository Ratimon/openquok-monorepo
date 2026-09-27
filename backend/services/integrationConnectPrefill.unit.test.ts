import type { IntegrationManager } from "../integrations/integrationManager";
import type { SocialProvider } from "../integrations/social.integrations.interface";

import { runConnectPrefill } from "./integrationConnectPrefill";

function createMockManager(provider: Partial<SocialProvider> & { identifier: string }): jest.Mocked<
    Pick<IntegrationManager, "getAllowedSocialsIntegrations" | "getSocialIntegration">
> {
    const full = provider as SocialProvider;
    return {
        getAllowedSocialsIntegrations: jest.fn().mockReturnValue([provider.identifier]),
        getSocialIntegration: jest.fn((id: string) => (id === provider.identifier ? full : undefined)),
    };
}

describe("runConnectPrefill", () => {
    it("returns provider hook result for bluesky", async () => {
        const manager = createMockManager({
            identifier: "bluesky",
            connectPrefill: jest.fn().mockResolvedValue({
                updates: { service: "https://pds.example" },
                did: "did:plc:abc",
            }),
        });
        const out = await runConnectPrefill(manager, "bluesky", "identifier", "@alice.bsky.social");
        expect(out).toEqual({
            updates: { service: "https://pds.example" },
            did: "did:plc:abc",
        });
    });

    it("throws 400 when provider has no hook", async () => {
        const manager = createMockManager({ identifier: "threads" });
        await expect(runConnectPrefill(manager, "threads", "identifier", "@user")).rejects.toMatchObject({
            statusCode: 400,
            message: "Connect prefill is not supported for this channel",
        });
    });

    it("throws 400 when provider is not allowed", async () => {
        const manager = createMockManager({ identifier: "bluesky" });
        manager.getAllowedSocialsIntegrations.mockReturnValue(["threads"]);
        await expect(runConnectPrefill(manager, "bluesky", "identifier", "@user")).rejects.toMatchObject({
            statusCode: 400,
            message: "Integration not allowed",
        });
    });
});
