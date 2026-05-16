/**
 * Side-effect import: initialize Sentry before other worker modules load.
 * Must be imported first from `bootstrapOrchestratorWorker.ts` (not from worker entrypoints directly).
 */
import { Sentry } from "backend/connections/sentry/index.js";

export { Sentry };
