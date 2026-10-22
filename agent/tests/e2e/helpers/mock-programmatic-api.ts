import http from "node:http";
import type { AddressInfo } from "node:net";

export type MockProgrammaticApi = {
  /** Base URL with no trailing slash (matches `OPENQUOK_API_URL`). */
  baseUrl: string;
  /** Last JSON body received on `POST /api/v1/public/posts`. */
  getLastCreatePostBody: () => unknown | null;
  /** Last query string on `GET /api/v1/public/directory-launch/profiles`. */
  getLastDirectoryProfilesQuery: () => URLSearchParams | null;
  close: () => Promise<void>;
};

/**
 * Minimal local HTTP server that stubs `POST /api/v1/public/posts` so the CLI can run
 * end-to-end without hitting production.
 */
export function startMockProgrammaticApi(): Promise<MockProgrammaticApi> {
  let lastCreateBody: unknown | null = null;
  let lastDirectoryProfilesQuery: URLSearchParams | null = null;

  const server = http.createServer((req, res) => {
    const rawUrl = req.url ?? "";
    const pathname = rawUrl.split("?")[0] ?? "";

    if (req.method === "GET" && pathname === "/api/v1/public/directory-launch/profiles") {
      const q = rawUrl.includes("?") ? new URL(rawUrl, "http://127.0.0.1").searchParams : new URLSearchParams();
      lastDirectoryProfilesQuery = q;
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          success: true,
          data: [
            { id: "main-1", name: "Main", parentProfileId: null, profileKind: "main" },
            { id: "var-1", name: "Variant", parentProfileId: "main-1", profileKind: "variant" },
          ],
        })
      );
      return;
    }

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
        getLastDirectoryProfilesQuery: () => lastDirectoryProfilesQuery,
        close: () =>
          new Promise((res, rej) => {
            server.close((err) => (err ? rej(err) : res()));
          }),
      });
    });
  });
}
