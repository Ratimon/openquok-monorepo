const ERROR_MESSAGES: Record<number, string> = {
    40001: "TikTok Business access token expired or is invalid. Reconnect the channel and try again.",
    40002: "TikTok Business request is missing required parameters. Check media URLs and caption length.",
    40105: "TikTok Business access token is missing required scopes. Reconnect and approve all requested permissions.",
};

export function mapTiktokBusinessApiError(code: number, fallbackMessage?: string): string {
    if (code in ERROR_MESSAGES) return ERROR_MESSAGES[code]!;
    if (fallbackMessage?.trim()) return fallbackMessage.trim();
    if (code !== 0) return `TikTok Business API error (code ${code})`;
    return "TikTok Business request failed";
}

export function mapTiktokBusinessPublishFailReason(reason: string | undefined): string {
    const key = (reason ?? "").trim();
    if (!key) return "TikTok Business publish failed";
    return `TikTok Business publish failed: ${key}`;
}
