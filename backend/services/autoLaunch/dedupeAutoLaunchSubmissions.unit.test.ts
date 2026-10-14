import { faker } from "@faker-js/faker";

import type { AutoLaunchSubmissionRow } from "../../data/types/autoLaunchTypes";
import { dedupeAutoLaunchSubmissionsByDestination } from "./dedupeAutoLaunchSubmissions";

function row(
    overrides: Partial<AutoLaunchSubmissionRow> & Pick<AutoLaunchSubmissionRow, "destination_id" | "status">
): AutoLaunchSubmissionRow {
    return {
        id: faker.string.uuid(),
        organization_id: faker.string.uuid(),
        product_profile_id: faker.string.uuid(),
        destination_id: overrides.destination_id,
        status: overrides.status,
        profile_snapshot: {},
        extension_config_snapshot: {},
        evidence: {},
        listing_url: null,
        intent_created_at: null,
        completed_at: overrides.status === "completed" ? faker.date.recent().toISOString() : null,
        created_by_user_id: null,
        completed_by_user_id: null,
        created_at: faker.date.past().toISOString(),
        updated_at: faker.date.recent().toISOString(),
        ...overrides,
    };
}

describe("dedupeAutoLaunchSubmissionsByDestination", () => {
    it("keeps one completed row per destination and drops stale intents", () => {
        const destA = faker.string.uuid();
        const destB = faker.string.uuid();
        const completed = row({
            destination_id: destA,
            status: "completed",
            created_at: "2026-10-14T10:00:00.000Z",
        });
        const staleIntent = row({
            destination_id: destA,
            status: "intent",
            created_at: "2026-10-14T12:00:00.000Z",
        });
        const paidIntent = row({ destination_id: destB, status: "intent" });

        const result = dedupeAutoLaunchSubmissionsByDestination([
            staleIntent,
            completed,
            paidIntent,
        ]);

        expect(result).toHaveLength(2);
        expect(result.find((r) => r.destination_id === destA)?.status).toBe("completed");
        expect(result.find((r) => r.destination_id === destB)?.status).toBe("intent");
    });
});
