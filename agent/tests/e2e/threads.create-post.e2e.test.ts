import { faker } from "@faker-js/faker";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { startMockProgrammaticApi } from "./helpers/mock-programmatic-api";
import { runOpenquokCli } from "./helpers/run-openquok-cli";

const integrationId = faker.string.uuid();

describe("threads posts:create (multi-segment)", () => {
  let mock: Awaited<ReturnType<typeof startMockProgrammaticApi>>;
  let isolatedHome: string;

  beforeAll(async () => {
    isolatedHome = fs.mkdtempSync(path.join(os.tmpdir(), "openquok-cli-e2e-"));
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

  it("maps repeated -c/-m into root body, media paths, and default reply delays", async () => {
    const d1 = faker.date.soon({ days: 120 });
    d1.setMilliseconds(0);
    const scheduledAt = d1.toISOString();
    const cap1 = faker.lorem.words({ min: 2, max: 5 });
    const cap2 = faker.lorem.words({ min: 2, max: 5 });
    const cap3 = faker.lorem.words({ min: 2, max: 5 });
    const media1 = `${faker.string.alphanumeric(8)}.jpg`;
    const media2 = `${faker.string.alphanumeric(8)}.jpg`;

    const argv = [
      "posts:create",
      "-c",
      cap1,
      "-m",
      media1,
      "-c",
      cap2,
      "-m",
      media2,
      "-c",
      cap3,
      "-s",
      scheduledAt,
      "-i",
      integrationId,
    ];

    const { status, stdout, stderr } = await runOpenquokCli(argv, envBase());

    expect(status, stderr || stdout).toBe(0);
    if (stderr.trim()) {
      expect(stderr).not.toMatch(/ERR_|Error:|Cannot find module/i);
    }

    const envelope = JSON.parse(stdout) as { success?: boolean; data?: { postGroup?: string } };
    expect(envelope.success).toBe(true);
    expect(envelope.data?.postGroup).toBe("00000000-0000-4000-8000-0000000000e2e");

    const body = mock.getLastCreatePostBody() as Record<string, unknown> | null;
    expect(body).toBeTruthy();
    expect(body!.scheduledAt).toBe(scheduledAt);
    expect(body!.status).toBe("scheduled");
    expect(body!.body).toBe(cap1);
    expect(body!.integrationIds).toEqual([integrationId]);

    const media = body!.media as { id: string; path: string }[];
    expect(media).toHaveLength(2);
    expect(media.map((m) => m.path)).toEqual([media1, media2]);

    const settings = body!.providerSettingsByIntegrationId as Record<string, { replies: unknown }>;
    expect(settings[integrationId]?.replies).toEqual([
      { message: cap2, delaySeconds: 5 },
      { message: cap3, delaySeconds: 10 },
    ]);
  });

  it("maps -d (ms) to delaySeconds between follow-up segments", async () => {
    const d2 = faker.date.soon({ days: 120 });
    d2.setMilliseconds(0);
    const scheduledAt = d2.toISOString();
    const seg1 = faker.lorem.words({ min: 2, max: 4 });
    const seg2 = faker.lorem.words({ min: 2, max: 4 });
    const seg3 = faker.lorem.words({ min: 2, max: 4 });

    const argv = [
      "posts:create",
      "-c",
      seg1,
      "-c",
      seg2,
      "-c",
      seg3,
      "-s",
      scheduledAt,
      "-d",
      "2000",
      "-i",
      integrationId,
    ];

    const { status, stdout, stderr } = await runOpenquokCli(argv, envBase());

    expect(status, stderr).toBe(0);
    const envelope = JSON.parse(stdout) as { success?: boolean };
    expect(envelope.success).toBe(true);

    const body = mock.getLastCreatePostBody() as Record<string, unknown>;
    const settings = body.providerSettingsByIntegrationId as Record<string, { replies: unknown }>;
    expect(settings[integrationId]?.replies).toEqual([
      { message: seg2, delaySeconds: 2 },
      { message: seg3, delaySeconds: 4 },
    ]);
  });
});
