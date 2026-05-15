import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runOpenquokCli } from "./helpers/run-openquok-cli";

describe("openquok CLI help", () => {
  it("prints top-level help when invoked with no arguments", async () => {
    const { status, stdout } = await runOpenquokCli([], {});

    expect(status).toBe(0);
    expect(stdout).toContain("openquok <command>");
    expect(stdout).toContain("Commands:");
    expect(stdout).not.toContain('"success": false');
  });
});

describe("config:show", () => {
  let isolatedHome: string;

  beforeAll(() => {
    isolatedHome = fs.mkdtempSync(path.join(os.tmpdir(), "openquok-cli-config-e2e-"));
  });

  afterAll(() => {
    fs.rmSync(isolatedHome, { recursive: true, force: true });
  });

  it("prints openquok_cloud when API and auth URLs match hosted defaults", async () => {
    const { status, stdout, stderr } = await runOpenquokCli(["config:show"], {
      HOME: isolatedHome,
      OPENQUOK_API_URL: "https://api.openquok.com",
      OPENQUOK_AUTH_SERVER: "https://cli-auth.openquok.com",
    });

    expect(status).toBe(0);
    expect(stderr).toBe("");
    const body = JSON.parse(stdout) as {
      success: boolean;
      deployment: string;
      api_url: string;
      auth_server_url: string;
    };
    expect(body.success).toBe(true);
    expect(body.deployment).toBe("openquok_cloud");
    expect(body.api_url).toBe("https://api.openquok.com");
    expect(body.auth_server_url).toBe("https://cli-auth.openquok.com");
  });
});
