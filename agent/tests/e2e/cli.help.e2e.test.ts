import { describe, expect, it } from "vitest";

import { runOpenquokCli } from "./helpers/run-openquok-cli";

describe("openquok CLI help", () => {
  it("prints top-level help when invoked with no arguments", async () => {
    const { status, stdout, stderr } = await runOpenquokCli([], {});

    expect(status).toBe(0);
    expect(stdout).toContain("openquok <command>");
    expect(stdout).toContain("Commands:");
    expect(stdout).not.toContain('"success": false');
  });
});
