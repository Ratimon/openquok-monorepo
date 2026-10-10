function finisherFromProviderBucket(
    settings: Record<string, unknown> | null,
    bucketKey: "threads" | "x"
): string | null {
    if (!settings) return null;
    const bucket = settings[bucketKey];
    if (!bucket || typeof bucket !== "object" || Array.isArray(bucket)) return null;
    const row = bucket as { enabled?: unknown; message?: unknown };
    if (row.enabled !== true) return null;
    const msg = typeof row.message === "string" ? row.message.trim() : "";
    return msg.length > 0 ? msg : null;
}

export function threadsThreadFinisherMessageFromSettings(settings: Record<string, unknown> | null): string | null {
    return finisherFromProviderBucket(settings, "threads");
}

export function xThreadFinisherMessageFromSettings(settings: Record<string, unknown> | null): string | null {
    return finisherFromProviderBucket(settings, "x");
}
