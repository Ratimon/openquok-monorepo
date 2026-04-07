/**
 * Sentry init and re-export. Import this before other app code so Sentry is
 * initialized in the same context as the app (captureException/flush work).
 */
import * as Sentry from "@sentry/node";

import { config } from "../../config/GlobalConfig.js";

const sentryConfig = config.sentry as { dsn?: string; enabled?: boolean } | undefined;
const serverConfig = config.server as { nodeEnv?: string } | undefined;

const dsn = (sentryConfig?.dsn ?? "").toString().trim();
const sentryEnabled = sentryConfig?.enabled !== false;

if (dsn && sentryEnabled && !Sentry.isInitialized()) {
    function createLoggingTransport(
        transportOptions: Parameters<typeof Sentry.makeNodeTransport>[0]
    ): ReturnType<typeof Sentry.makeNodeTransport> {
        const base = Sentry.makeNodeTransport(transportOptions);
        return {
            send: async (envelope) => {
                try {
                    const result = await base.send(envelope);
                    console.log("[Sentry] Transport: event sent to Sentry", result?.statusCode ?? result);
                    return result;
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    console.error("[Sentry] Transport: send failed", msg);
                    throw err;
                }
            },
            flush: (timeout?: number) => base.flush(timeout),
        };
    }

    Sentry.init({
        dsn,
        sendDefaultPii: true,
        environment: (serverConfig?.nodeEnv ?? "development").toString(),
        disableInstrumentationWarnings: true,
        debug: false,
        denyUrls: [],
        transport: createLoggingTransport,
        integrations: [Sentry.expressIntegration()],
        beforeSend(event, hint) {
            if (serverConfig?.nodeEnv === "development") {
                const msg =
                    event.message ??
                    (hint.originalException instanceof Error ? hint.originalException.message : "");
                console.log("[Sentry] beforeSend:", msg);
            }
            return event;
        },
    });
    console.log("[Sentry] Initialized in app context (DSN configured, SENTRY_ENABLED=true)");
} else if (dsn && !sentryEnabled) {
    console.log("[Sentry] DSN present but SENTRY_ENABLED=false; events will not be sent.");
}

export { Sentry };
