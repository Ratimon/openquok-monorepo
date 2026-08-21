import { resolveDevtoSettings } from "./resolveDevtoSettings.js";

describe("resolveDevtoSettings", () => {
    it("reads flat providerSettings keys (CLI/API)", () => {
        expect(
            resolveDevtoSettings({
                providerSettings: {
                    title: "CLI title",
                    tags: ["javascript", "webdev"],
                    canonical: "https://example.com/post",
                    organization: 42,
                    main_image: { path: "composer-media/cover.jpg" },
                    series: "Shipping notes",
                },
            })
        ).toEqual({
            title: "CLI title",
            tags: ["javascript", "webdev"],
            canonical: "https://example.com/post",
            organizationId: 42,
            mainImagePath: "composer-media/cover.jpg",
            series: "Shipping notes",
        });
    });

    it("reads nested devto bucket from providerSettings (web composer)", () => {
        expect(
            resolveDevtoSettings({
                providerSettings: {
                    devto: {
                        title: "Web title",
                        tags: [{ value: 6, label: "javascript" }, { value: "ruby", label: "ruby" }],
                        canonical: "https://blog.example/canonical",
                        organization: { id: 99, name: "Acme", username: "acme" },
                        mainImage: { path: "composer-media/hero.png" },
                        series: "Web series",
                    },
                },
            })
        ).toEqual({
            title: "Web title",
            tags: ["javascript", "ruby"],
            canonical: "https://blog.example/canonical",
            organizationId: 99,
            mainImagePath: "composer-media/hero.png",
            series: "Web series",
        });
    });

    it("merges flat keys then applies nested devto bucket overrides", () => {
        expect(
            resolveDevtoSettings({
                providerSettings: {
                    title: "Flat title",
                    tags: ["one"],
                    series: "Flat series",
                    devto: {
                        title: "Nested title",
                        tags: ["two", "three"],
                        series: "Nested series",
                    },
                },
            })
        ).toMatchObject({
            title: "Nested title",
            tags: ["two", "three"],
            series: "Nested series",
        });
    });

    it("caps tags at 4 and accepts string tag names", () => {
        expect(
            resolveDevtoSettings({
                providerSettings: {
                    title: "Tagged",
                    tags: ["a", "b", "c", "d", "e"],
                },
            }).tags
        ).toEqual(["a", "b", "c", "d"]);
    });

    it("reads main_image as a URL string and organization as a numeric string", () => {
        expect(
            resolveDevtoSettings({
                providerSettings: {
                    title: "Cover",
                    main_image: "https://cdn.example.com/cover.jpg",
                    organization: "7",
                },
            })
        ).toMatchObject({
            mainImagePath: "https://cdn.example.com/cover.jpg",
            organizationId: 7,
        });
    });

    it("returns defaults when settings are empty", () => {
        expect(resolveDevtoSettings(null)).toEqual({ title: "", tags: [] });
    });

    it("omits series when blank or whitespace-only", () => {
        expect(
            resolveDevtoSettings({
                providerSettings: {
                    title: "No series",
                    series: "   ",
                },
            }).series
        ).toBeUndefined();
        expect(
            resolveDevtoSettings({
                providerSettings: {
                    title: "No series",
                    series: "",
                },
            }).series
        ).toBeUndefined();
        expect(
            resolveDevtoSettings({
                providerSettings: {
                    title: "No series",
                    devto: { series: "  " },
                },
            }).series
        ).toBeUndefined();
    });
});
