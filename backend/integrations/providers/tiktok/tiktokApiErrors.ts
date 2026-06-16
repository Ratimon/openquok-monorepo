const ERROR_MESSAGES: Record<string, string> = {
    invalid_param: "TikTok rejected the post parameters. Check privacy level, media URLs, and caption length.",
    app_version_check_failed:
        "TikTok inbox upload requires a newer TikTok app version on the creator device (at least 31.8).",
    spam_risk_too_many_posts: "This TikTok account has reached the daily API post limit. Try again tomorrow or post from the TikTok app.",
    spam_risk_user_banned_from_posting: "This TikTok account is banned from posting.",
    spam_risk_too_many_pending_share:
        "This TikTok account has too many pending inbox uploads. Complete or clear drafts in TikTok before scheduling more.",
    reached_active_user_cap: "Your TikTok app has reached its daily active publishing user quota.",
    unaudited_client_can_only_post_to_private_accounts:
        "Your TikTok developer app is unaudited — posts are limited to private (SELF_ONLY) until TikTok approves Content Posting API access.",
    url_ownership_unverified:
        "TikTok cannot pull media from this URL. Verify your media domain in the TikTok developer portal (URL properties) and ensure STORAGE_R2_PUBLIC_BASE_URL or /uploads origin matches.",
    privacy_level_option_mismatch:
        "The selected privacy level is not allowed for this TikTok account. Reconnect and choose a privacy option returned by TikTok.",
    access_token_invalid: "TikTok access token expired or is invalid. Reconnect the channel and try again.",
    scope_not_authorized:
        "TikTok access token is missing required scopes (video.publish or video.upload). Reconnect and approve all requested permissions.",
    rate_limit_exceeded: "TikTok API rate limit exceeded. Wait a minute and try again.",
    internal_error: "TikTok server error. Try again later.",
    token_not_authorized_for_specified_publish_id: "TikTok could not verify this publish request for the connected account.",
    invalid_publish_id: "TikTok publish id was not found. The upload may have expired.",
};

const FAIL_REASON_MESSAGES: Record<string, string> = {
    file_format_check_failed: "TikTok does not support this media format. Use MP4 for video or JPEG/WEBP for photos.",
    duration_check_failed: "Video duration does not meet TikTok requirements.",
    frame_rate_check_failed: "Video frame rate is not supported by TikTok.",
    picture_size_check_failed: "Image dimensions or size are not supported by TikTok.",
    internal: "TikTok processing failed. Try again later.",
    video_pull_failed:
        "TikTok could not download the video URL. Ensure the file is publicly reachable over HTTPS and the domain is verified.",
    photo_pull_failed:
        "TikTok could not download the image URL. Ensure files are publicly reachable over HTTPS and the domain is verified.",
    publish_cancelled: "TikTok publish was cancelled.",
    auth_removed: "The TikTok creator removed app access during publishing. Reconnect the channel.",
    spam_risk_too_many_posts: "This TikTok account has posted too many times via the API in the last 24 hours.",
    spam_risk_user_banned_from_posting: "This TikTok account is banned from posting.",
    spam_risk_text: "TikTok flagged the caption text as risky or spammy.",
    spam_risk: "TikTok flagged this publish request as risky.",
};

export function mapTiktokApiErrorCode(code: string | undefined, fallbackMessage?: string): string {
    const key = (code ?? "").trim();
    if (key && ERROR_MESSAGES[key]) return ERROR_MESSAGES[key]!;
    if (fallbackMessage?.trim()) return fallbackMessage.trim();
    if (key && key !== "ok") return `TikTok API error: ${key}`;
    return "TikTok request failed";
}

export function mapTiktokFailReason(failReason: string | undefined): string {
    const key = (failReason ?? "").trim();
    if (key && FAIL_REASON_MESSAGES[key]) return FAIL_REASON_MESSAGES[key]!;
    if (key) return `TikTok publish failed: ${key}`;
    return "TikTok publish failed";
}

export function parseTiktokApiEnvelope(body: unknown): {
    ok: boolean;
    data: Record<string, unknown>;
    errorCode: string;
    errorMessage: string;
} {
    const root = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const data = root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : {};
    const error =
        root.error && typeof root.error === "object" ? (root.error as Record<string, unknown>) : {};
    const errorCode = typeof error.code === "string" ? error.code : "";
    const errorMessage = typeof error.message === "string" ? error.message : "";
    const ok = errorCode === "" || errorCode === "ok";
    return { ok, data, errorCode, errorMessage };
}
