export const MAINTENANCE_MODES = ["off", "banner", "freeze_writes"] as const;

export type MaintenanceMode = (typeof MAINTENANCE_MODES)[number];

export const MAINTENANCE_BYPASS_HEADER = "x-maintenance-bypass";

export function parseMaintenanceMode(raw: string | undefined | null): MaintenanceMode {
    const normalized = String(raw ?? "").trim().toLowerCase();
    if (normalized === "banner" || normalized === "freeze_writes") {
        return normalized;
    }
    return "off";
}

export function isWriteFreezeMode(mode: string | undefined | null): boolean {
    return parseMaintenanceMode(mode) === "freeze_writes";
}

export function isRecognizedMaintenanceMode(raw: string | undefined | null): boolean {
    const normalized = String(raw ?? "").trim().toLowerCase();
    if (normalized === "") return true;
    return (MAINTENANCE_MODES as readonly string[]).includes(normalized);
}
