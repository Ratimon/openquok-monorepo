import http from "node:http";
import type { AddressInfo } from "node:net";

import { app, ensureAppInitialized } from "../../../app";

/** Listen on a random local port so the Openquok CLI can hit the same app as supertest. */
export async function startE2eHttpServer(): Promise<{
    baseUrl: string;
    close: () => Promise<void>;
}> {
    await ensureAppInitialized();
    const server = http.createServer({ maxHeaderSize: 64 * 1024 }, app);

    await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", () => resolve());
    });

    const addr = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${addr.port}`;

    return {
        baseUrl,
        close: () =>
            new Promise((resolve, reject) => {
                server.close((err) => (err ? reject(err) : resolve()));
            }),
    };
}
