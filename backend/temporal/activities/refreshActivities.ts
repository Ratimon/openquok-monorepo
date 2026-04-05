import { logger } from "../../utils/Logger";

/** Smoke-test activity; replace with real refresh + persistence when ready. */
export async function ping(input: { integrationId: string; organizationId: string }): Promise<void> {
    logger.info({
        msg: "[Temporal] refreshToken workflow ping",
        integrationId: input.integrationId,
        organizationId: input.organizationId,
    });
}
