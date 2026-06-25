#!/usr/bin/env node
/**
 * Post-build guard for Railway / local orchestrator images: fail the build when
 * compiled backend social providers are missing expected handlers (e.g. tiktok).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "../..");

const integrationManagerPath = path.join(repoRoot, "backend/dist/integrations/integrationManager.js");
const { IntegrationManager } = await import(integrationManagerPath);

const manager = new IntegrationManager();
const registered = manager.getAllowedSocialsIntegrations();
const required = ["threads", "facebook", "instagram-business", "instagram-standalone", "youtube", "tiktok"];
const missing = required.filter((id) => !registered.includes(id));

if (missing.length > 0) {
    console.error(
        `[verify-worker-social-providers] Missing handlers in backend/dist: ${missing.join(", ")}. Registered: ${registered.join(", ")}`
    );
    process.exit(1);
}

console.log(`[verify-worker-social-providers] OK (${registered.join(", ")})`);
process.exit(0);
