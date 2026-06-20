import { resolveLinkedInSettings } from "./linkedinSettings";

describe("resolveLinkedInSettings", () => {
    it("reads flat CLI keys", () => {
        expect(
            resolveLinkedInSettings({
                post_as_images_carousel: true,
                carousel_name: "Q1 deck",
            })
        ).toEqual({
            post_as_images_carousel: true,
            carousel_name: "Q1 deck",
        });
    });

    it("reads nested web bucket providerSettings.linkedin", () => {
        expect(
            resolveLinkedInSettings({
                providerSettings: {
                    linkedin: {
                        postAsImagesCarousel: true,
                        carouselName: "Slides",
                    },
                },
            })
        ).toEqual({
            post_as_images_carousel: true,
            carousel_name: "Slides",
        });
    });

    it("prefers nested linkedin bucket over flat providerSettings", () => {
        expect(
            resolveLinkedInSettings({
                providerSettings: {
                    post_as_images_carousel: false,
                    linkedin: { postAsImagesCarousel: true },
                },
            })
        ).toEqual({ post_as_images_carousel: true });
    });
});
