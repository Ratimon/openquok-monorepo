function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const SKOOL_MAX_LENGTH = 5000;
export const SKOOL_TITLE_MIN_LENGTH = 1;

export type SkoolResolvedPublishSettings = {
    title: string;
    groupId: string;
    labelId?: string;
};

function readString(source: Record<string, unknown>, ...keys: string[]): string {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) {
            return value.trim();
        }
    }
    return "";
}

function readGroupId(source: Record<string, unknown>): string {
    const direct = readString(source, "group", "group_id", "groupId");
    if (direct) return direct;
    const group = source.group;
    if (isPlainObject(group)) {
        const nested = group.id ?? group.value;
        if (typeof nested === "string" && nested.trim()) return nested.trim();
        if (typeof nested === "number" && Number.isFinite(nested)) {
            return String(nested);
        }
    }
    return "";
}

function readLabelId(source: Record<string, unknown>): string | undefined {
    const direct = readString(source, "label", "label_id", "labelId");
    if (direct) return direct === "none" ? undefined : direct;
    const label = source.label;
    if (isPlainObject(label)) {
        const nested = label.id ?? label.value;
        if (typeof nested === "string" && nested.trim()) {
            const id = nested.trim();
            return id === "none" ? undefined : id;
        }
    }
    return undefined;
}

/**
 * Resolves Skool publish settings from scheduled post `PostDetails.settings`.
 *
 * Accepts flat CLI keys on `settings.providerSettings` and nested `settings.providerSettings.skool`.
 */
export function resolveSkoolSettings(postDetailsSettings: unknown): SkoolResolvedPublishSettings {
    if (!isPlainObject(postDetailsSettings)) {
        return { title: "", groupId: "" };
    }

    let source: Record<string, unknown> = { ...postDetailsSettings };

    const providerSettings = postDetailsSettings.providerSettings;
    if (isPlainObject(providerSettings)) {
        const { skool: skoolBucket, ...flatProviderSettings } = providerSettings;
        source = { ...source, ...flatProviderSettings };
        if (isPlainObject(skoolBucket)) {
            source = { ...source, ...skoolBucket };
        }
    } else if (isPlainObject(postDetailsSettings.skool)) {
        source = { ...source, ...postDetailsSettings.skool };
    }

    const title = readString(source, "title");
    const groupId = readGroupId(source);
    const labelId = readLabelId(source);

    return {
        title,
        groupId,
        ...(labelId ? { labelId } : {}),
    };
}

export const SKOOL_SETTINGS_SCHEMA = {
    type: "object",
    required: ["title", "group"],
    properties: {
        title: { type: "string", minLength: SKOOL_TITLE_MIN_LENGTH, description: "Post title" },
        group: { type: "string", description: "Skool group id to publish in" },
        label: { type: "string", description: "Category (label) id — required for most Skool groups" },
    },
} as const;
