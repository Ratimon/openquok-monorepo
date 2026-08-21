function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const DEVTO_MAX_TAGS = 4;
export const DEVTO_TITLE_MIN_LENGTH = 2;
export const DEVTO_MAX_LENGTH = 100_000;

export type DevtoResolvedPublishSettings = {
    title: string;
    tags: string[];
    canonical?: string;
    organizationId?: number;
    mainImagePath?: string;
};

function readTitle(source: Record<string, unknown>): string {
    const title = source.title;
    return typeof title === "string" ? title.trim() : "";
}

function readCanonical(source: Record<string, unknown>): string | undefined {
    const raw = source.canonical ?? source.canonical_url ?? source.canonicalUrl;
    if (typeof raw === "string" && raw.trim()) return raw.trim();
    return undefined;
}

function parsePositiveInt(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        return Math.trunc(value);
    }
    if (typeof value === "string" && /^\d+$/.test(value.trim())) {
        const n = Number.parseInt(value.trim(), 10);
        return n > 0 ? n : undefined;
    }
    return undefined;
}

function readOrganizationId(source: Record<string, unknown>): number | undefined {
    const raw = source.organization ?? source.organization_id ?? source.organizationId;
    const direct = parsePositiveInt(raw);
    if (direct !== undefined) return direct;
    if (isPlainObject(raw)) {
        return parsePositiveInt(raw.id ?? raw.value);
    }
    return undefined;
}

function tagNameFromItem(item: unknown): string {
    if (typeof item === "string") return item.trim();
    if (!isPlainObject(item)) return "";
    const label = typeof item.label === "string" ? item.label.trim() : "";
    if (label) return label;
    if (typeof item.value === "string") return item.value.trim();
    return "";
}

function normalizeTags(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    const out: string[] = [];
    const seen = new Set<string>();
    for (const item of raw) {
        const name = tagNameFromItem(item);
        if (!name) continue;
        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(name);
        if (out.length >= DEVTO_MAX_TAGS) break;
    }
    return out;
}

function readMainImagePath(source: Record<string, unknown>): string | undefined {
    const main = source.main_image ?? source.mainImage;
    if (typeof main === "string" && main.trim()) return main.trim();
    if (isPlainObject(main) && typeof main.path === "string" && main.path.trim()) {
        return main.path.trim();
    }
    return undefined;
}

/**
 * Resolves Dev.to publish settings from scheduled post `PostDetails.settings`.
 *
 * Accepts flat CLI keys on `settings.providerSettings` and nested `settings.providerSettings.devto`
 * (web composer bucket). Legacy flat `settings.devto` is also supported.
 */
export function resolveDevtoSettings(postDetailsSettings: unknown): DevtoResolvedPublishSettings {
    if (!isPlainObject(postDetailsSettings)) {
        return { title: "", tags: [] };
    }

    let source: Record<string, unknown> = { ...postDetailsSettings };

    const providerSettings = postDetailsSettings.providerSettings;
    if (isPlainObject(providerSettings)) {
        const { devto: devtoBucket, ...flatProviderSettings } = providerSettings;
        source = { ...source, ...flatProviderSettings };
        if (isPlainObject(devtoBucket)) {
            source = { ...source, ...devtoBucket };
        }
    } else if (isPlainObject(postDetailsSettings.devto)) {
        source = { ...source, ...postDetailsSettings.devto };
    }

    return {
        title: readTitle(source),
        tags: normalizeTags(source.tags),
        canonical: readCanonical(source),
        organizationId: readOrganizationId(source),
        mainImagePath: readMainImagePath(source),
    };
}

/** JSON Schema for `GET /public/integration-settings/:id` (title required, tags max 4). */
export const DEVTO_SETTINGS_SCHEMA = {
    type: "object",
    required: ["title"],
    properties: {
        title: { type: "string", minLength: DEVTO_TITLE_MIN_LENGTH, description: "Article title" },
        tags: {
            type: "array",
            maxItems: DEVTO_MAX_TAGS,
            items: { type: "string" },
            description: "Up to 4 tag names",
        },
        main_image: {
            type: "object",
            properties: { path: { type: "string" } },
            description: "Cover image object key or public URL",
        },
        canonical: { type: "string", description: "Canonical URL for syndication" },
        organization: {
            description: "Organization id to publish under",
            oneOf: [{ type: "integer" }, { type: "string" }],
        },
    },
} as const;
