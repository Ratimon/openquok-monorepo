export type RedditManualConnectPayload = {
    label: string;
};

/** Decode dashboard credentials connect `code` (base64 JSON from Add Channel). */
export function decodeRedditManualConnectCode(code: string): RedditManualConnectPayload {
    try {
        const raw = Buffer.from(code.trim(), "base64").toString("utf8");
        const parsed = JSON.parse(raw) as { label?: unknown; channelLabel?: unknown };
        if (!parsed || typeof parsed !== "object") {
            throw new Error("Invalid connect payload");
        }
        const labelRaw =
            typeof parsed.label === "string"
                ? parsed.label
                : typeof parsed.channelLabel === "string"
                  ? parsed.channelLabel
                  : "";
        const label = labelRaw.trim();
        if (label.length > 80) {
            throw new Error("Channel label must be at most 80 characters");
        }
        return { label };
    } catch (e) {
        const message = e instanceof Error ? e.message : "Invalid connect payload";
        throw new Error(message);
    }
}
