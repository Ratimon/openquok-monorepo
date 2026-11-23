import {
    normalizeAutoLaunchProfileLogoUrl,
    normalizeBusinessProfileDataGallery,
    normalizeBusinessProfileGalleryUrls,
} from "./normalizeAutoLaunchProfileMediaFields";

describe("normalizeAutoLaunchProfileMediaFields", () => {
    it("stores bare gallery keys and drops blob URLs", () => {
        const key = "11111111-1111-1111-1111-111111111111/22222222-2222-2222-2222-222222222222/0.55.png";
        expect(
            normalizeBusinessProfileGalleryUrls([
                key,
                "blob:http://localhost/abc",
                "   ",
            ])
        ).toEqual([key]);
    });

    it("extracts gallery keys from public object URLs", () => {
        const key = "org/profile/screenshot.webp";
        const publicUrl = `https://example.supabase.co/storage/v1/object/public/auto_launch_profile_media/${encodeURIComponent(key)}`;
        expect(normalizeBusinessProfileGalleryUrls([publicUrl])).toEqual([key]);
    });

    it("normalizes logo storage key like gallery paths", () => {
        const key = "org/profile/logo.webp";
        expect(normalizeAutoLaunchProfileLogoUrl(key)).toBe(key);
        expect(normalizeAutoLaunchProfileLogoUrl("blob:http://localhost/x")).toBeNull();
    });

    it("normalizes gallery inside profile_data", () => {
        const key = "org/profile/1.webp";
        const data = normalizeBusinessProfileDataGallery({
            gallery_urls: [
                `https://example.supabase.co/storage/v1/object/public/auto_launch_profile_media/${key}`,
            ],
        });
        expect(data.gallery_urls).toEqual([key]);
    });
});