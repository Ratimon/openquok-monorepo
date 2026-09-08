import { describe, expect, it } from "@jest/globals";
import {
    collectCrossAccountActingIntegrationIds,
    resolvePublishIntegrationIds,
} from "./crossAccountPublishChannels";

describe("crossAccountPublishChannels", () => {
    it("collects acting integration ids from enabled cross-account plugs", () => {
        const acting = collectCrossAccountActingIntegrationIds({
            "pub-id": {
                threads: {
                    crossAccountPlugs: [
                        {
                            enabled: true,
                            integrationIds: ["act-id", "pub-id"],
                        },
                    ],
                },
            },
        });
        expect([...acting]).toEqual(["act-id"]);
    });

    it("omits empty acting channels from publish integration ids", () => {
        const ids = resolvePublishIntegrationIds({
            integrationIds: ["pub-id", "act-id"],
            providerSettingsByIntegrationId: {
                "pub-id": {
                    threads: {
                        crossAccountPlugs: [
                            {
                                enabled: true,
                                integrationIds: ["act-id"],
                            },
                        ],
                    },
                },
            },
            publishMessageForIntegration: (id) => (id === "pub-id" ? "Main thread" : ""),
            mediaCountForIntegration: () => 0,
        });
        expect(ids).toEqual(["pub-id"]);
    });

    it("keeps two publishers when both have captions", () => {
        const ids = resolvePublishIntegrationIds({
            integrationIds: ["pub-a", "pub-b"],
            providerSettingsByIntegrationId: {
                "pub-a": {
                    threads: {
                        crossAccountPlugs: [{ enabled: true, integrationIds: ["pub-b"] }],
                    },
                },
            },
            publishMessageForIntegration: () => "Same caption",
            mediaCountForIntegration: () => 0,
        });
        expect(ids).toEqual(["pub-a", "pub-b"]);
    });

    it("keeps empty channel when it is not a cross-account actor", () => {
        const ids = resolvePublishIntegrationIds({
            integrationIds: ["pub-id", "other-id"],
            providerSettingsByIntegrationId: {},
            publishMessageForIntegration: (id) => (id === "pub-id" ? "Main" : ""),
            mediaCountForIntegration: () => 0,
        });
        expect(ids).toEqual(["pub-id", "other-id"]);
    });
});
