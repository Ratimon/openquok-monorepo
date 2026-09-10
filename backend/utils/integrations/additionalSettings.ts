/** One row from `integrations.additional_settings` (JSON-encoded array of titled fields). */
export type AdditionalSettingRow = Record<string, unknown>;

/**
 * `integrations.additional_settings` is a JSON-encoded array; defensive parse so a malformed
 * value does not 500.
 */
export function parseAdditionalSettings(raw: string | null | undefined): AdditionalSettingRow[] {
    if (!raw) return [];
    try {
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as AdditionalSettingRow[]) : [];
    } catch {
        return [];
    }
}

/**
 * Some providers (e.g. X paid tier) gate higher limits behind a "Verified" toggle stored in
 * `integrations.additional_settings`.
 */
export function isVerifiedFromAdditionalSettings(settings: AdditionalSettingRow[]): boolean {
    const verified = settings.find((s) => s?.title === "Verified")?.value;
    return verified === true;
}
