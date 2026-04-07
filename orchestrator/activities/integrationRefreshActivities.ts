import type { AuthTokenDetails } from "backend/integrations/social.integrations.interface.js";
import type { IntegrationRepository, IntegrationRow } from "backend/repositories/IntegrationRepository.js";
import { logger } from "backend/utils/Logger.js";
import { sleepChunked } from "../sleepChunked";

/**
 * Mirrors typical durable-activity limits: bounded execution time per attempt,
 * limited retries with fixed backoff multiplier (coefficient 1 → same delay each retry).
 */
export const integrationRefreshActivityPolicy = {
    startToCloseTimeoutMs: 10 * 60 * 1000,
    maxAttempts: 3,
    initialRetryIntervalMs: 2 * 60 * 1000,
    retryBackoffCoefficient: 1,
} as const;

function withTimeout<T>(promise: Promise<T>, ms: number, signal?: AbortSignal): Promise<T> {
    if (ms <= 0) {
        return promise;
    }
    return new Promise<T>((resolve, reject) => {
        const onAbort = () => {
            clearTimeout(timer);
            reject(signal?.reason ?? new Error("Aborted"));
        };
        const timer = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            reject(new Error(`Activity timed out after ${ms}ms`));
        }, ms);
        signal?.addEventListener("abort", onAbort, { once: true });
        promise.then(
            (value) => {
                clearTimeout(timer);
                signal?.removeEventListener("abort", onAbort);
                resolve(value);
            },
            (err: unknown) => {
                clearTimeout(timer);
                signal?.removeEventListener("abort", onAbort);
                reject(err);
            }
        );
    });
}

async function runWithRetries<T>(
    label: string,
    runAttempt: () => Promise<T>,
    logContext: Record<string, unknown>,
    signal: AbortSignal | undefined
): Promise<T> {
    const p = integrationRefreshActivityPolicy;
    let lastError: unknown;
    for (let attempt = 1; attempt <= p.maxAttempts; attempt++) {
        try {
            return await withTimeout(runAttempt(), p.startToCloseTimeoutMs, signal);
        } catch (err) {
            lastError = err;
            if (attempt >= p.maxAttempts) {
                logger.warn({
                    msg: `[Orchestrator] ${label} failed after all attempts`,
                    ...logContext,
                    attempts: p.maxAttempts,
                    error: err instanceof Error ? err.message : String(err),
                });
                throw err;
            }
            const delayMs = Math.round(
                p.initialRetryIntervalMs * Math.pow(p.retryBackoffCoefficient, attempt - 1)
            );
            logger.info({
                msg: `[Orchestrator] ${label} will retry`,
                ...logContext,
                attempt,
                nextRetryInMs: delayMs,
            });
            await sleepChunked(delayMs, signal);
        }
    }
    throw lastError;
}

/** Activity-shaped load: repository read with per-attempt timeout and retries on throw. */
export async function getIntegrationByIdActivity(
    repository: Pick<IntegrationRepository, "getById">,
    organizationId: string,
    integrationId: string,
    signal: AbortSignal | undefined
): Promise<IntegrationRow | null> {
    return runWithRetries(
        "getIntegrationById",
        () => repository.getById(organizationId, integrationId),
        { organizationId, integrationId },
        signal
    );
}

/**
 * Activity-shaped refresh: same timeout/retry on thrown errors only.
 * A resolved `false` from the service is a normal outcome (no retry).
 */
export async function refreshIntegrationTokenActivity(
    runRefresh: (row: IntegrationRow) => Promise<false | AuthTokenDetails>,
    row: IntegrationRow,
    signal: AbortSignal | undefined
): Promise<false | AuthTokenDetails> {
    return runWithRetries(
        "refreshToken",
        () => runRefresh(row),
        { organizationId: row.organization_id, integrationId: row.id },
        signal
    );
}
