import { config } from "../../config/GlobalConfig";

import {
    buildAutoLaunchProfileMediaPublicUrl,
    extractAutoLaunchProfileMediaStoragePathFromImageSrc,
    parseAutoLaunchProfileMediaUploadPrefix,
    resolveAutoLaunchProfileImageUrl,
    resolveAutoLaunchProfileMediaStorageKey,
} from "./autoLaunchProfileMediaImages";

describe("autoLaunchProfileMediaImages", () => {
    const orgId = "550e8400-e29b-41d4-a716-446655440000";
    const profileId = "660e8400-e29b-41d4-a716-446655440001";
    const key = `${orgId}/${profileId}/0.123.webp`;

    it("extracts storage keys from API download URLs", () => {
        expect(
            extractAutoLaunchProfileMediaStoragePathFromImageSrc(
                `/api/v1/image/download?databaseName=auto_launch_profile_media&imageUrl=${encodeURIComponent(key)}`
            )
        ).toBe(key);
    });

    it("normalizes bucket-prefixed keys", () => {
        expect(resolveAutoLaunchProfileMediaStorageKey(`auto_launch_profile_media/${key}`)).toBe(key);
    });

    it("parses upload prefix from uid", () => {
        expect(parseAutoLaunchProfileMediaUploadPrefix(`${orgId}/${profileId}`)).toEqual({
            organizationId: orgId,
            profileId,
        });
        expect(parseAutoLaunchProfileMediaUploadPrefix("not-a-uuid/foo")).toBeNull();
    });

    it("passes through absolute URLs for resolveAutoLaunchProfileImageUrl", () => {
        expect(resolveAutoLaunchProfileImageUrl("https://cdn.example.com/logo.png")).toBe(
            "https://cdn.example.com/logo.png"
        );
    });

    it("builds API download URL when Supabase public URL is unset", () => {
        const prev = (config.supabase as { supabaseUrl?: string }).supabaseUrl;
        (config.supabase as { supabaseUrl?: string }).supabaseUrl = "";
        expect(buildAutoLaunchProfileMediaPublicUrl(key)).toBe(
            `http://localhost:3000/api/v1/image/download?databaseName=auto_launch_profile_media&imageUrl=${encodeURIComponent(key)}`
        );
        (config.supabase as { supabaseUrl?: string }).supabaseUrl = prev;
    });
});
