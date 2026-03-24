/**
 * Sentry init and re-export. Import this before other app code so Sentry is
 * initialized in the same context as the app (captureException/flush work).
 */
import * as Sentry from "@sentry/node";
import { config } from "../../config/GlobalConfig.js";

const dsn = (config.sentry?.dsn ?? "").toString().trim();
const sentryEnabled = config.sentry?.enabled !== false;

if (dsn && sentryEnabled && !Sentry.isInitialized()) {
    function createLoggingTransport(transportOptions) {
        const base = Sentry.makeNodeTransport(transportOptions);
        return {
            send: async (envelope) => {
                try {
                    const result = await base.send(envelope);
                    console.log("[Sentry] Transport: event sent to Sentry", result?.statusCode ?? result);
                    return result;
                } catch (err) {
                    console.error("[Sentry] Transport: send failed", err?.message ?? err);
                    throw err;
                }
            },
            flush: (timeout) => base.flush(timeout),
        };
    }

    Sentry.init({
        dsn,
        sendDefaultPii: true,
        enableLogs: true,
        environment: (config.server?.nodeEnv ?? "development").toString(),
        disableInstrumentationWarnings: true,
        debug: false,
        denyUrls: [],
        transport: createLoggingTransport,
        integrations: [Sentry.expressIntegration()],
        beforeSend(event, hint) {
            if (config.server?.nodeEnv === "development") {
                console.log("[Sentry] beforeSend:", event.message || hint.originalException?.message);
            }
            return event;
        },
    });
    console.log("[Sentry] Initialized in app context (DSN configured, SENTRY_ENABLED=true)");
} else if (dsn && !sentryEnabled) {
    console.log("[Sentry] DSN present but SENTRY_ENABLED=false; events will not be sent.");
}

export { Sentry };
