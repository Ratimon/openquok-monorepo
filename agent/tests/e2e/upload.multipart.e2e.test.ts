import fs from "node:fs";
import http from "node:http";
import type { AddressInfo } from "node:net";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { MAX_MEDIA_DIRECT_UPLOAD_BYTES } from "../../src/commands/upload.logic";
import { runOpenquokCli } from "./helpers/run-openquok-cli";

type Recorded = { method: string; pathname: string };

function startUploadMock(): Promise<{
  baseUrl: string;
  getRecorded: () => Recorded[];
  close: () => Promise<void>;
}> {
  const recorded: Recorded[] = [];
  let baseUrl = "";

  const server = http.createServer((req, res) => {
    const pathname = (req.url ?? "").split("?")[0] ?? "";
    recorded.push({ method: req.method ?? "", pathname });

    if (req.method === "PUT" && pathname.startsWith("/mock-r2/part/")) {
      res.statusCode = 200;
      res.setHeader("ETag", '"part-etag-1"');
      res.end();
      return;
    }

    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const json = (status: number, body: unknown) => {
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(body));
      };

      if (req.method === "POST" && pathname === "/api/v1/public/upload") {
        json(200, {
          success: true,
          message: "Media uploaded successfully",
          data: {
            id: "00000000-0000-4000-8000-0000000000aa",
            filePath: "direct-upload.png",
            originalName: "small.png",
          },
        });
        return;
      }

      if (req.method === "POST" && pathname === "/api/v1/public/upload/create-multipart") {
        json(200, {
          success: true,
          message: "Multipart upload created",
          data: { uploadId: "up-e2e", key: "e2e-clip.mp4" },
        });
        return;
      }

      if (req.method === "POST" && pathname === "/api/v1/public/upload/sign-parts") {
        json(200, {
          success: true,
          message: "Parts signed",
          data: { urls: { "1": `${baseUrl}/mock-r2/part/1` } },
        });
        return;
      }

      if (req.method === "POST" && pathname === "/api/v1/public/upload/complete-multipart") {
        json(200, {
          success: true,
          message: "Media uploaded successfully",
          data: {
            id: "00000000-0000-4000-8000-0000000000bb",
            filePath: "e2e-clip.mp4",
            originalName: "large.mp4",
          },
        });
        return;
      }

      json(404, { success: false, message: `unexpected ${req.method} ${pathname}` });
    });
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve({
        baseUrl,
        getRecorded: () => recorded.slice(),
        close: () =>
          new Promise((res, rej) => {
            server.close((err) => (err ? rej(err) : res()));
          }),
      });
    });
  });
}

describe("openquok upload", () => {
  let mock: Awaited<ReturnType<typeof startUploadMock>>;
  let isolatedHome: string;
  let workDir: string;

  beforeAll(async () => {
    isolatedHome = fs.mkdtempSync(path.join(os.tmpdir(), "openquok-upload-e2e-"));
    workDir = fs.mkdtempSync(path.join(os.tmpdir(), "openquok-upload-files-"));
    mock = await startUploadMock();
  });

  afterAll(async () => {
    await mock.close();
    fs.rmSync(isolatedHome, { recursive: true, force: true });
    fs.rmSync(workDir, { recursive: true, force: true });
  });

  const envBase = () => ({
    HOME: isolatedHome,
    OPENQUOK_API_URL: mock.baseUrl,
    OPENQUOK_API_KEY: "e2e-test-token",
  });

  it("posts small files through POST /public/upload", async () => {
    const file = path.join(workDir, "small.png");
    fs.writeFileSync(file, Buffer.alloc(1024, 1));

    const { status, stdout, stderr } = await runOpenquokCli(["upload", file], envBase());
    expect(status, stderr || stdout).toBe(0);

    const envelope = JSON.parse(stdout) as { data?: { id?: string; filePath?: string } };
    expect(envelope.data?.id).toBe("00000000-0000-4000-8000-0000000000aa");
    expect(envelope.data?.filePath).toBe("direct-upload.png");

    const paths = mock.getRecorded().map((r) => `${r.method} ${r.pathname}`);
    expect(paths).toContain("POST /api/v1/public/upload");
    expect(paths.some((p) => p.includes("create-multipart"))).toBe(false);
  });

  it("uses direct-to-storage multipart for files above the hosted inbound cap", async () => {
    const file = path.join(workDir, "large.mp4");
    fs.writeFileSync(file, Buffer.alloc(MAX_MEDIA_DIRECT_UPLOAD_BYTES + 1, 2));

    const before = mock.getRecorded().length;
    const { status, stdout, stderr } = await runOpenquokCli(["upload", file], envBase());
    expect(status, stderr || stdout).toBe(0);

    const envelope = JSON.parse(stdout) as { data?: { id?: string; filePath?: string } };
    expect(envelope.data?.id).toBe("00000000-0000-4000-8000-0000000000bb");
    expect(envelope.data?.filePath).toBe("e2e-clip.mp4");

    const paths = mock
      .getRecorded()
      .slice(before)
      .map((r) => `${r.method} ${r.pathname}`);
    expect(paths).toContain("POST /api/v1/public/upload/create-multipart");
    expect(paths).toContain("POST /api/v1/public/upload/sign-parts");
    expect(paths).toContain("PUT /mock-r2/part/1");
    expect(paths).toContain("POST /api/v1/public/upload/complete-multipart");
    expect(paths).not.toContain("POST /api/v1/public/upload");
  });
});
