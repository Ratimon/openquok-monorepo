import {
    BUSINESS_PROFILE_MAX_GALLERY_URLS,
    type BusinessProfileData,
} from "openquok-common";

import {
    resolveAutoLaunchProfileMediaStorageKey,
} from "./autoLaunchProfileMediaImages";

/** Normalize `profile_data.gallery_urls` to bare storage object keys. */
export function normalizeBusinessProfileGalleryUrls(
    gallery: string[] | null | undefined
): string[] | undefined {
    if (gallery === undefined) return undefined;
    if (!Array.isArray(gallery) || gallery.length === 0) return [];

    const keys = gallery
        .map((entry) => {
            const trimmed = String(entry ?? "").trim();
            if (!trimmed || trimmed.startsWith("blob:")) return "";
            return resolveAutoLaunchProfileMediaStorageKey(trimmed) ?? trimmed;
        })
        .filter((entry) => entry.length > 0)
        .slice(0, BUSINESS_PROFILE_MAX_GALLERY_URLS);

    return keys;
}

export function normalizeBusinessProfileDataGallery(
    profileData: BusinessProfileData
): BusinessProfileData {
    if (!Array.isArray(profileData.gallery_urls)) return profileData;
    return {
        ...profileData,
        gallery_urls: normalizeBusinessProfileGalleryUrls(profileData.gallery_urls) ?? [],
    };
}

/** Normalize product `logo_url` to a bare storage object key (or null). */
export function normalizeAutoLaunchProfileLogoUrl(
    raw: string | null | undefined
): string | null | undefined {
    if (raw === undefined) return undefined;
    if (raw === null) return null;
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("blob:")) return null;
    return resolveAutoLaunchProfileMediaStorageKey(trimmed) ?? trimmed;
}