import { Client, Connection } from "@temporalio/client";
import { config } from "../config/GlobalConfig";
import { logger } from "../utils/Logger";

let clientPromise: Promise<Client | null> | null = null;

/**
 * Lazy Temporal client (see https://docs.temporal.io/develop/typescript/set-up-your-local-typescript).
 * Docker-backed local or private deploy: `infra/temporal` (TEMPORAL_ADDRESS, e.g. localhost:7233).
 * Returns null when `config.temporal.address` is empty (no Temporal server connection).
 */
export async function getTemporalClient(): Promise<Client | null> {
    const temporal = config.temporal as { address: string; namespace: string };
    const address = temporal.address;
    if (!address) {
        return null;
    }
    if (!clientPromise) {
        clientPromise = (async () => {
            try {
                const connection = await Connection.connect({ address });
                const namespace = temporal.namespace;
                return new Client({ connection, namespace });
            } catch (err) {
                logger.warn({
                    msg: "[Temporal] Connection failed",
                    error: err instanceof Error ? err.message : String(err),
                });
                clientPromise = null;
                return null;
            }
        })();
    }
    return clientPromise;
}
