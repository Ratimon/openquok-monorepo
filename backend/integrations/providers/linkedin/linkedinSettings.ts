export type LinkedInPublishSettings = {
    post_as_images_carousel?: boolean;
    carousel_name?: string;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readBoolean(source: Record<string, unknown>, key: string): boolean | undefined {
    const value = source[key];
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return undefined;
}

function readString(source: Record<string, unknown>, key: string): string | undefined {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    return undefined;
}

/**
 * Resolves LinkedIn compose settings from flat CLI keys and nested web bucket
 * (`providerSettings.linkedin.postAsImagesCarousel`, etc.).
 */
export function resolveLinkedInSettings(settings: unknown): LinkedInPublishSettings {
    if (!isPlainObject(settings)) return {};

    const out: LinkedInPublishSettings = {};

    const readFrom = (source: Record<string, unknown>) => {
        const carousel =
            readBoolean(source, "post_as_images_carousel") ?? readBoolean(source, "postAsImagesCarousel");
        if (carousel !== undefined) out.post_as_images_carousel = carousel;

        const carouselName = readString(source, "carousel_name") ?? readString(source, "carouselName");
        if (carouselName) out.carousel_name = carouselName;
    };

    readFrom(settings);

    const providerSettings = settings.providerSettings;
    if (isPlainObject(providerSettings)) {
        readFrom(providerSettings);

        const linkedin = providerSettings.linkedin;
        if (isPlainObject(linkedin)) {
            readFrom(linkedin);
        }
    }

    const linkedinRoot = settings.linkedin;
    if (isPlainObject(linkedinRoot)) {
        readFrom(linkedinRoot);
    }

    return out;
}
