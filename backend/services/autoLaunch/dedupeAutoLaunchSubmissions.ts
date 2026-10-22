import type { AutoLaunchSubmissionRow } from "../../data/types/autoLaunchTypes";

const OPEN_STATUSES = new Set<AutoLaunchSubmissionRow["status"]>([
    "draft",
    "intent",
    "in_progress",
]);

/** One row per destination: prefer latest completed, else latest open attempt. */
export function dedupeAutoLaunchSubmissionsByDestination(
    rows: AutoLaunchSubmissionRow[]
): AutoLaunchSubmissionRow[] {
    const byDestination = new Map<string, AutoLaunchSubmissionRow[]>();
    for (const row of rows) {
        const group = byDestination.get(row.destination_id) ?? [];
        group.push(row);
        byDestination.set(row.destination_id, group);
    }

    const picked: AutoLaunchSubmissionRow[] = [];
    for (const group of byDestination.values()) {
        const sorted = [...group].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const completed = sorted.find((r) => r.status === "completed");
        if (completed) {
            picked.push(completed);
            continue;
        }
        const open = sorted.find((r) => OPEN_STATUSES.has(r.status));
        picked.push(open ?? sorted[0]);
    }

    return picked.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
}

export const AUTO_LAUNCH_OPEN_SUBMISSION_STATUSES: AutoLaunchSubmissionRow["status"][] = [
    "draft",
    "intent",
    "in_progress",
];
