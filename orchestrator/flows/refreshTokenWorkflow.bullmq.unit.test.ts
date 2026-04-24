/// <reference types="jest" />
/**
 * `runRefreshTokenOrchestration` when `config.bullmq.integrationRefresh.transport` is `bullmq`.
 * Run via `pnpm test:unit:refresh-token-workflow:bullmq` (uses `jest.bullmq.config.js` so env is not cleared).
 * Default orchestrator Jest omits `*.bullmq.unit.test.*` and resets `ORCHESTRATOR_*_TRANSPORT` after dotenv.
 */
import { faker } from "@faker-js/faker";
import { config } from "backend/config/GlobalConfig.js";
import { enqueueRefreshTokenDistributedRun } from "../adapters/flowcraft-bullmq/integration-refresh/enqueueRefreshTokenDistributedRun.js";
import { runRefreshTokenOrchestration } from "./refreshTokenWorkflow.js";

jest.mock("../adapters/flowcraft-bullmq/integration-refresh/enqueueRefreshTokenDistributedRun", () => ({
    enqueueRefreshTokenDistributedRun: jest.fn(),
}));

const mockedEnqueue = jest.mocked(enqueueRefreshTokenDistributedRun);

const orgId = faker.string.uuid();
const integrationId = faker.string.uuid();

describe("runRefreshTokenOrchestration (bullmq transport)", () => {
    const getById = jest.fn();
    const runRefresh = jest.fn();
    const queueName = (config.bullmq as { queueName: string }).queueName;

    beforeAll(() => {
        expect((config.bullmq as { integrationRefresh?: { transport?: string } }).integrationRefresh?.transport).toBe(
            "bullmq"
        );
    });

    beforeEach(() => {
        getById.mockReset();
        runRefresh.mockReset();
        mockedEnqueue.mockReset();
        mockedEnqueue.mockResolvedValue({ runId: faker.string.uuid(), enqueued: true });
    });

    it("enqueues distributed run and does not run in-process loop", async () => {
        const ok = await runRefreshTokenOrchestration(
            { integrationId, organizationId: orgId },
            { integrationRepository: { getById }, runRefresh }
        );
        expect(ok).toBe(true);
        expect(mockedEnqueue).toHaveBeenCalledWith({ integrationId, organizationId: orgId }, { queueName });
        expect(getById).not.toHaveBeenCalled();
        expect(runRefresh).not.toHaveBeenCalled();
    });

    it("returns false when enqueue fails", async () => {
        mockedEnqueue.mockRejectedValue(new Error("redis down"));
        const ok = await runRefreshTokenOrchestration(
            { integrationId, organizationId: orgId },
            { integrationRepository: { getById }, runRefresh }
        );
        expect(ok).toBe(false);
        expect(getById).not.toHaveBeenCalled();
    });
});
