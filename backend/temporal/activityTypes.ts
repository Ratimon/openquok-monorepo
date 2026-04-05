/** Activity contracts for refresh workflows (types only; safe for workflow bundles). */
export interface RefreshActivities {
    ping(input: { integrationId: string; organizationId: string }): Promise<void>;
}
