import http from "node:http";
import type { AddressInfo } from "node:net";

export type MockProgrammaticApi = {
  /** Base URL with no trailing slash (matches `OPENQUOK_API_URL`). */
  baseUrl: string;
  /** Last JSON body received on `POST /api/v1/public/posts`. */
  getLastCreatePostBody: () => unknown | null;
  close: () => Promise<void>;
};

/**
 * Minimal local HTTP server that stubs `POST /api/v1/public/posts` so the CLI can run
 * end-to-end without hitting production.
 */
export function startMockProgrammaticApi(): Promise<MockProgrammaticApi> {
  let lastCreateBody: unknown | null = null;

  const server = http.createServer((req, res) => {
    const pathname = (req.url ?? "").split("?")[0] ?? "";

    if (req.method === "POST" && pathname === "/api/v1/public/posts") {
      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => {
        try {
          const raw = Buffer.concat(chunks).toString("utf8");
          lastCreateBody = raw ? (JSON.parse(raw) as unknown) : null;
        } catch {
          lastCreateBody = null;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            success: true,
            data: {
              postGroup: "00000000-0000-4000-8000-0000000000e2e",
              posts: [],
            },
          })
        );
      });
      return;
    }

    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ success: false, message: `unexpected ${req.method} ${pathname}` }));
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as AddressInfo;
      resolve({
        baseUrl: `http://127.0.0.1:${addr.port}`,
        getLastCreatePostBody: () => lastCreateBody,
        close: () =>
          new Promise((res, rej) => {
            server.close((err) => (err ? rej(err) : res()));
          }),
      });
    });
  });
}
