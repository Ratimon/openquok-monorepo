// After backend/jest.env-setup.cjs loads dotenv, clear optional `ORCHESTRATOR_*_TRANSPORT` overrides from
// the developer’s env files, then set all three to `in_process` for in-memory Flowcraft unit tests.
//
// **Why delete then set?** In production, `orchestratorFlows` defaults every flow to `transport: "bullmq"`
// (see `backend/config/orchestratorFlows.ts`). `GlobalConfig.orchestrationTransportFromEnv` uses the env var
// when set, otherwise that same `bullmq` default. If we only deleted these keys, an empty var would
// still resolve to **bullmq**—matching production, but wrong for the default Jest suite (e.g. refresh would
// enqueue to Redis). Setting `in_process` explicitly is required.
//
// BullMQ transport coverage (e.g. `pnpm test:unit:refresh-token-workflow:bullmq`) uses
// `jest.bullmq.config.js`, which omits this file so `ORCHESTRATOR_*_TRANSPORT` and dotenv can
// still resolve to `bullmq` like production.
delete process.env.ORCHESTRATOR_INTEGRATION_REFRESH_TRANSPORT;
delete process.env.ORCHESTRATOR_NOTIFICATION_EMAIL_TRANSPORT;
delete process.env.ORCHESTRATOR_SCHEDULED_SOCIAL_POST_TRANSPORT;
process.env.ORCHESTRATOR_INTEGRATION_REFRESH_TRANSPORT = "in_process";
process.env.ORCHESTRATOR_NOTIFICATION_EMAIL_TRANSPORT = "in_process";
process.env.ORCHESTRATOR_SCHEDULED_SOCIAL_POST_TRANSPORT = "in_process";
