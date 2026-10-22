import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { startMockProgrammaticApi } from "./helpers/mock-programmatic-api";
import { runOpenquokCli } from "./helpers/run-openquok-cli";

describe("directory:profiles:list", () => {
  let mock: Awaited<ReturnType<typeof startMockProgrammaticApi>>;
  let isolatedHome: string;

  beforeAll(async () => {
    isolatedHome = fs.mkdtempSync(path.join(os.tmpdir(), "openquok-cli-dir-e2e-"));
    mock = await startMockProgrammaticApi();
  });

  afterAll(async () => {
    await mock.close();
    fs.rmSync(isolatedHome, { recursive: true, force: true });
  });

  const envBase = () => ({
    HOME: isolatedHome,
    OPENQUOK_API_URL: mock.baseUrl,
    OPENQUOK_API_KEY: "e2e-test-token",
  });

  it("passes integrationCustomerId query and filters --main-only on stdout", async () => {
    const customerGroupId = "00000000-0000-4000-8000-0000000000c1";

    const { status, stdout, stderr } = await runOpenquokCli(
      [
        "directory:profiles:list",
        "--customer-group-id",
        customerGroupId,
        "--main-only",
      ],
      envBase()
    );

    expect(status, stderr || stdout).toBe(0);

    const envelope = JSON.parse(stdout) as {
      success: boolean;
      data: { id: string; parentProfileId: string | null }[];
    };
    expect(envelope.success).toBe(true);
    expect(envelope.data).toHaveLength(1);
    expect(envelope.data[0].id).toBe("main-1");

    const qs = mock.getLastDirectoryProfilesQuery();
    expect(qs?.get("integrationCustomerId")).toBe(customerGroupId);
  });
});
