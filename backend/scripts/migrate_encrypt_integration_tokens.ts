#!/usr/bin/env node
/**
 * One-shot: AES-GCM encrypt legacy plaintext integrations.token / refresh_token rows.
 * Requires INTEGRATIONS_TOKEN_ENCRYPTION_KEY or SECURITY_SECRET (see GlobalConfig).
 *
 * Usage (from repo root):
 *   pnpm --filter ./backend exec tsx scripts/migrate_encrypt_integration_tokens.ts
 */
import { integrationRepository } from "../repositories/index.js";
import { config } from "../config/GlobalConfig.js";
import { logger } from "../utils/Logger.js";

async function main(): Promise<void> {
    const integrations = config.integrations as { tokenEncryptionKey?: string } | undefined;
    const key = String(integrations?.tokenEncryptionKey ?? "").trim();
    if (!key) {
        logger.error({
            msg: "Set INTEGRATIONS_TOKEN_ENCRYPTION_KEY or SECURITY_SECRET before migrating integration tokens",
        });
        process.exitCode = 1;
        return;
    }

    const result = await integrationRepository.migrateEncryptPlaintextTokensAtRest();
    logger.info({
        msg: "Integration token encrypt-at-rest migration finished",
        scanned: result.scanned,
        updated: result.updated,
    });
}

main().catch((err) => {
    logger.error({
        msg: "Integration token encrypt-at-rest migration failed",
        error: err instanceof Error ? err.message : String(err),
    });
    process.exitCode = 1;
});
