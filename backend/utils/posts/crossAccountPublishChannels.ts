const CROSS_ACCOUNT_PLUG_BUCKETS = ["threads", "x", "linkedin"] as const;

/** Integration ids listed on enabled cross-account plugs (acting channels, not publishers). */
export function collectCrossAccountActingIntegrationIds(
    providerSettingsByIntegrationId: Record<string, Record<string, unknown>> | null | undefined
): Set<string> {
    const acting = new Set<string>();
    if (!providerSettingsByIntegrationId) return acting;

    for (const [publisherId, settings] of Object.entries(providerSettingsByIntegrationId)) {
        if (!settings || typeof settings !== "object") continue;
        for (const bucket of CROSS_ACCOUNT_PLUG_BUCKETS) {
            const bucketSettings = settings[bucket];
            if (!bucketSettings || typeof bucketSettings !== "object") continue;
            const plugs = (bucketSettings as { crossAccountPlugs?: unknown }).crossAccountPlugs;
            if (!Array.isArray(plugs)) continue;
            for (const plug of plugs) {
                if (!plug || typeof plug !== "object") continue;
                const row = plug as { enabled?: boolean; integrationIds?: unknown };
                if (row.enabled !== true || !Array.isArray(row.integrationIds)) continue;
                for (const id of row.integrationIds) {
                    if (typeof id === "string" && id.trim() && id !== publisherId) {
                        acting.add(id);
                    }
                }
            }
        }
    }
    return acting;
}

export type ResolvePublishIntegrationIdsInput = {
    integrationIds: string[];
    providerSettingsByIntegrationId?: Record<string, Record<string, unknown>> | null;
    publishMessageForIntegration: (integrationId: string) => string;
    mediaCountForIntegration: (integrationId: string) => number;
};

/**
 * Drop selected channels that have no caption/media but only appear as cross-account plug actors.
 * Prevents empty root publish rows while keeping intentional multi-channel posts with content.
 */
export function resolvePublishIntegrationIds(input: ResolvePublishIntegrationIdsInput): string[] {
    const uniqueIds = [...new Set(input.integrationIds)];
    const actingIds = collectCrossAccountActingIntegrationIds(input.providerSettingsByIntegrationId);

    return uniqueIds.filter((integrationId) => {
        const hasContent =
            input.publishMessageForIntegration(integrationId).trim().length > 0 ||
            input.mediaCountForIntegration(integrationId) > 0;
        if (hasContent) return true;
        if (actingIds.has(integrationId)) return false;
        return true;
    });
}
