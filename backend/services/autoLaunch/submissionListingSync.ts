import { computeListingProfileFingerprint } from "openquok-common";

import type {
    AutoLaunchExtensionConfig,
    AutoLaunchProfileSnapshot,
    AutoLaunchSubmissionRow,
} from "../../data/types/autoLaunchTypes";

export function computeListingFingerprintForSubmission(
    profileSnapshot: AutoLaunchProfileSnapshot,
    extensionConfig: AutoLaunchExtensionConfig | null | undefined
): string {
    return computeListingProfileFingerprint(profileSnapshot, extensionConfig);
}

/** Whether a completed row's live profile diverges from the stored listing baseline. */
export function isCompletedSubmissionListingStale(
    submission: AutoLaunchSubmissionRow,
    liveProfileSnapshot: AutoLaunchProfileSnapshot
): boolean {
    if (submission.status !== "completed") {
        return false;
    }
    const liveFingerprint = computeListingFingerprintForSubmission(
        liveProfileSnapshot,
        submission.extension_config_snapshot
    );
    if (!submission.listing_profile_fingerprint) {
        return true;
    }
    return liveFingerprint !== submission.listing_profile_fingerprint;
}

export type AutoLaunchSubmissionSyncStatus = "pending" | "synced" | "stale";

export function resolveSubmissionSyncStatus(
    submission: AutoLaunchSubmissionRow,
    liveProfileSnapshot: AutoLaunchProfileSnapshot | null
): AutoLaunchSubmissionSyncStatus {
    if (submission.status !== "completed") {
        return "pending";
    }
    if (!liveProfileSnapshot) {
        return "stale";
    }
    return isCompletedSubmissionListingStale(submission, liveProfileSnapshot) ? "stale" : "synced";
}
