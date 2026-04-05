import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { NativeConnection, Worker, Runtime, bundleWorkflowCode } from "@temporalio/worker";
import { config } from "../config/GlobalConfig";
import { logger } from "../utils/Logger";
import * as refreshActivities from "./activities/refreshActivities";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Avoid default SIGTERM/SIGINT handling conflicting with process managers (e.g. Railway). */
Runtime.install({ shutdownSignals: [] });

async function main() {
    const temporal = config.temporal as { address: string; namespace: string };
    if (!temporal.address) {
        logger.error({ msg: "[Temporal] TEMPORAL_ADDRESS is not set; worker exiting." });
        process.exit(1);
    }

    const workflowsTs = path.join(__dirname, "workflows", "index.ts");
    const workflowsJs = path.join(__dirname, "workflows", "index.js");
    const workflowsPath = existsSync(workflowsTs) ? workflowsTs : workflowsJs;

    const workflowBundle = await bundleWorkflowCode({ workflowsPath });

    let connection;
    try {
        connection = await NativeConnection.connect({ address: temporal.address });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const refused = /Connection refused|ECONNREFUSED|tcp connect error/i.test(message);
        if (refused) {
            logger.error({
                msg: "[Temporal] Cannot connect to Temporal server (connection refused)",
                address: temporal.address,
                hint: "Start Temporal first (from the repository root: pnpm infra:temporal:up, or pnpm infra:dev:up for Temporal + Redis), or set TEMPORAL_ADDRESS to a reachable host:port.",
            });
        } else {
            logger.error({
                msg: "[Temporal] NativeConnection.connect failed",
                address: temporal.address,
                error: message,
            });
        }
        process.exit(1);
    }

    const worker = await Worker.create({
        connection,
        namespace: temporal.namespace,
        taskQueue: "main",
        workflowBundle,
        activities: refreshActivities,
    });

    logger.info({
        msg: "[Temporal] Worker started",
        address: temporal.address,
        namespace: temporal.namespace,
        taskQueue: "main",
    });

    await worker.run();
}

main().catch((err) => {
    logger.error({
        msg: "[Temporal] Worker failed",
        error: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
});
