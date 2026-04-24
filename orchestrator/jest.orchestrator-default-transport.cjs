// After backend/jest.env-setup.cjs loads dotenv, force orchestrator unit tests onto
// orchestratorFlows TypeScript defaults so .env.development.local cannot flip transport to bullmq
// and break in-process Flowcraft suites. BullMQ enqueue tests use jest.bullmq.config.js instead.
delete process.env.ORCHESTRATOR_INTEGRATION_REFRESH_TRANSPORT;
delete process.env.ORCHESTRATOR_NOTIFICATION_EMAIL_TRANSPORT;
delete process.env.ORCHESTRATOR_SCHEDULED_SOCIAL_POST_TRANSPORT;
