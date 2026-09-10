import type { SocialProvider } from "../../integrations/social.integrations.interface.js";
import {
    collectCaptionTextsFromProviderSettings,
    measureProviderCaptionLength,
    resolveProviderMaxLength,
    validateProviderCaptionLength,
    validateScheduledCaptionsForIntegration,
} from "./validateProviderCaptionLength.js";

function mockProvider(
    overrides: Partial<Pick<SocialProvider, "identifier" | "name" | "editor" | "maxLength">> = {}
): Pick<SocialProvider, "identifier" | "name" | "editor" | "maxLength"> {
    return {
        identifier: "threads",
        name: "Threads",
        editor: "normal",
        maxLength: () => 500,
        ...overrides,
    };
}

describe("measureProviderCaptionLength", () => {
    it("returns plain length for non-X providers", () => {
        expect(measureProviderCaptionLength("threads", "hello")).toBe(5);
        expect(measureProviderCaptionLength("linkedin", "a".repeat(12))).toBe(12);
    });

    it("returns twitter-text weighted length for X", () => {
        expect(measureProviderCaptionLength("x", "a".repeat(280))).toBe(280);
        const longUrl = `https://example.com/${"a".repeat(200)}`;
        const weighted = measureProviderCaptionLength("x", longUrl);
        expect(weighted).toBeLessThan(longUrl.length);
        expect(weighted).toBeLessThanOrEqual(23);
    });
});

describe("resolveProviderMaxLength", () => {
    it("passes Verified from additional_settings into provider.maxLength", () => {
        const maxLength = jest.fn((verified?: unknown) => (verified === true ? 4000 : 280));
        const provider = mockProvider({ identifier: "x", name: "X", maxLength });

        expect(resolveProviderMaxLength(provider, null)).toBe(280);
        expect(maxLength).toHaveBeenCalledWith(false);

        expect(
            resolveProviderMaxLength(provider, JSON.stringify([{ title: "Verified", value: true }]))
        ).toBe(4000);
        expect(maxLength).toHaveBeenCalledWith(true);
    });
});

describe("validateProviderCaptionLength", () => {
    const threads = mockProvider();

    it("returns null for empty or whitespace-only messages", () => {
        expect(
            validateProviderCaptionLength({
                providerIdentifier: "threads",
                provider: threads,
                message: "",
            })
        ).toBeNull();
        expect(
            validateProviderCaptionLength({
                providerIdentifier: "threads",
                provider: threads,
                message: "   ",
            })
        ).toBeNull();
        expect(
            validateProviderCaptionLength({
                providerIdentifier: "threads",
                provider: threads,
                message: "<p></p>",
            })
        ).toBeNull();
    });

    it("allows a Threads caption at the 500-character limit", () => {
        expect(
            validateProviderCaptionLength({
                providerIdentifier: "threads",
                provider: threads,
                message: "a".repeat(500),
            })
        ).toBeNull();
    });

    it("returns a human message when a Threads caption exceeds 500", () => {
        expect(
            validateProviderCaptionLength({
                providerIdentifier: "threads",
                provider: threads,
                message: "a".repeat(523),
            })
        ).toBe("Threads caption exceeds 500 characters (523/500).");
    });

    it("strips HTML before measuring plain providers", () => {
        expect(
            validateProviderCaptionLength({
                providerIdentifier: "threads",
                provider: threads,
                message: `<p>${"a".repeat(501)}</p>`,
            })
        ).toBe("Threads caption exceeds 500 characters (501/500).");
    });

    it("uses the custom label when provided", () => {
        expect(
            validateProviderCaptionLength({
                providerIdentifier: "threads",
                provider: threads,
                message: "a".repeat(501),
                label: "Threads follow-up reply",
            })
        ).toBe("Threads follow-up reply exceeds 500 characters (501/500).");
    });

    it("enforces X weighted 280 unless Verified additional_settings raise the cap to 4000", () => {
        const x = mockProvider({
            identifier: "x",
            name: "X",
            maxLength: (verified?: unknown) => (verified === true ? 4000 : 280),
        });
        const overStandard = "a".repeat(281);
        expect(
            validateProviderCaptionLength({
                providerIdentifier: "x",
                provider: x,
                message: overStandard,
            })
        ).toBe("X caption exceeds 280 characters (281/280).");
        expect(
            validateProviderCaptionLength({
                providerIdentifier: "x",
                provider: x,
                additionalSettings: JSON.stringify([{ title: "Verified", value: true }]),
                message: overStandard,
            })
        ).toBeNull();
        expect(
            validateProviderCaptionLength({
                providerIdentifier: "x",
                provider: x,
                additionalSettings: JSON.stringify([{ title: "Verified", value: true }]),
                message: "a".repeat(4001),
            })
        ).toBe("X caption exceeds 4000 characters (4001/4000).");
    });
});

describe("collectCaptionTextsFromProviderSettings", () => {
    it("collects follow-up replies, Threads finisher, delayed engagement, and plug comments", () => {
        const texts = collectCaptionTextsFromProviderSettings("threads", {
            threads: {
                enabled: true,
                message: "That's a wrap!",
                replies: [{ id: "r1", message: "first reply", delaySeconds: 0 }],
                internalEngagementPlug: { enabled: true, message: "Thanks for reading" },
                crossAccountPlugs: [
                    {
                        enabled: true,
                        plugName: "threads-cross-account-comment",
                        fields: { comment: "More on our site" },
                    },
                ],
            },
        });
        expect(texts).toEqual([
            { text: "first reply", label: "Threads follow-up reply" },
            { text: "That's a wrap!", label: "Threads thread finisher" },
            { text: "Thanks for reading", label: "Threads delayed engagement" },
            { text: "More on our site", label: "Threads cross-account plug comment" },
        ]);
    });

    it("skips disabled Threads finisher and empty comments", () => {
        expect(
            collectCaptionTextsFromProviderSettings("threads", {
                threads: {
                    enabled: false,
                    message: "unused",
                    internalEngagementPlug: { enabled: false, message: "nope" },
                    crossAccountPlugs: [{ fields: { comment: "  " } }],
                },
            })
        ).toEqual([]);
    });

    it("returns an empty list when settings are missing", () => {
        expect(collectCaptionTextsFromProviderSettings("threads", null)).toEqual([]);
        expect(collectCaptionTextsFromProviderSettings("x", undefined)).toEqual([]);
    });
});

describe("validateScheduledCaptionsForIntegration", () => {
    const threads = mockProvider();

    it("rejects an over-limit main caption first", () => {
        expect(
            validateScheduledCaptionsForIntegration({
                providerIdentifier: "threads",
                provider: threads,
                mainMessage: "a".repeat(501),
                providerSettings: {
                    threads: { replies: [{ id: "r1", message: "ok", delaySeconds: 0 }] },
                },
            })
        ).toBe("Threads caption exceeds 500 characters (501/500).");
    });

    it("rejects an over-limit follow-up when the main caption is within the cap", () => {
        expect(
            validateScheduledCaptionsForIntegration({
                providerIdentifier: "threads",
                provider: threads,
                mainMessage: "hello",
                providerSettings: {
                    threads: {
                        replies: [{ id: "r1", message: "a".repeat(501), delaySeconds: 0 }],
                    },
                },
            })
        ).toBe("Threads follow-up reply exceeds 500 characters (501/500).");
    });

    it("returns null when every caption is within the cap", () => {
        expect(
            validateScheduledCaptionsForIntegration({
                providerIdentifier: "threads",
                provider: threads,
                mainMessage: "hello",
                providerSettings: {
                    threads: {
                        enabled: true,
                        message: "wrap",
                        replies: [{ id: "r1", message: "next", delaySeconds: 0 }],
                    },
                },
            })
        ).toBeNull();
    });
});
