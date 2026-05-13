import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  buildMediaFromArgs,
  mergeProviderSettingsForIntegrations,
  readCreatePayloadFromJsonFile,
  resolveCreateStatus,
  toStringList,
} from "./posts.logic";

describe("toStringList", () => {
  it("returns empty for undefined", () => {
    expect(toStringList(undefined)).toEqual([]);
  });

  it("trims a single string", () => {
    expect(toStringList("  a  ")).toEqual(["a"]);
  });

  it("flattens string arrays", () => {
    expect(toStringList(["x", "", "  y  "])).toEqual(["x", "y"]);
  });
});

describe("resolveCreateStatus", () => {
  it("maps schedule synonyms to scheduled", () => {
    expect(resolveCreateStatus({ type: "schedule" })).toBe("scheduled");
    expect(resolveCreateStatus({ type: "scheduled" })).toBe("scheduled");
    expect(resolveCreateStatus({ status: "scheduled" })).toBe("scheduled");
  });

  it("maps draft", () => {
    expect(resolveCreateStatus({ type: "draft" })).toBe("draft");
    expect(resolveCreateStatus({ status: "draft" })).toBe("draft");
  });

  it("defaults to scheduled", () => {
    expect(resolveCreateStatus({})).toBe("scheduled");
  });
});

describe("buildMediaFromArgs", () => {
  const id = () => "fixed-id";

  it("splits comma-separated paths and uses id factory", () => {
    expect(buildMediaFromArgs("a.jpg, b.jpg", id)).toEqual([
      { id: "fixed-id", path: "a.jpg" },
      { id: "fixed-id", path: "b.jpg" },
    ]);
  });

  it("parses JSON array of id/path objects", () => {
    const json = '[{"id":"u1","path":"p1"},{"id":"u2","path":"p2"}]';
    expect(buildMediaFromArgs(json, id)).toEqual([
      { id: "u1", path: "p1" },
      { id: "u2", path: "p2" },
    ]);
  });

  it("merges multiple -m rows", () => {
    expect(buildMediaFromArgs(["a.jpg", "b.jpg"], id)).toEqual([
      { id: "fixed-id", path: "a.jpg" },
      { id: "fixed-id", path: "b.jpg" },
    ]);
  });

  it("throws on invalid JSON array string", () => {
    expect(() => buildMediaFromArgs("[not-json]", id)).toThrow(/invalid JSON/);
  });
});

describe("mergeProviderSettingsForIntegrations", () => {
  const intId = "4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b";

  it("returns undefined when nothing applies", () => {
    expect(
      mergeProviderSettingsForIntegrations({
        integrationIds: [intId],
        contentSegments: ["only root"],
        delayMs: 5000,
      })
    ).toBeUndefined();
  });

  it("adds replies for multiple segments with delay in ms", () => {
    const out = mergeProviderSettingsForIntegrations({
      integrationIds: [intId],
      contentSegments: ["root", "second", "third"],
      delayMs: 2000,
    });
    expect(out).toBeDefined();
    expect(out![intId]!.replies).toEqual([
      { message: "second", delaySeconds: 2 },
      { message: "third", delaySeconds: 4 },
    ]);
  });

  it("merges explicit per-integration settings", () => {
    const explicit = { [intId]: { foo: 1 } };
    const out = mergeProviderSettingsForIntegrations({
      integrationIds: [intId],
      contentSegments: ["a"],
      delayMs: 0,
      explicitByIntegration: explicit,
    });
    expect(out![intId]).toMatchObject({ foo: 1 });
  });

  it("merges global settings into each integration", () => {
    const out = mergeProviderSettingsForIntegrations({
      integrationIds: [intId],
      contentSegments: ["x"],
      delayMs: 0,
      settingsJson: { bar: true },
    });
    expect(out![intId]).toEqual({ bar: true });
  });

  it("merges --settings on top of explicit providerSettings (same key: settings wins)", () => {
    const out = mergeProviderSettingsForIntegrations({
      integrationIds: [intId],
      contentSegments: ["x"],
      delayMs: 0,
      explicitByIntegration: { [intId]: { bar: 1, keep: true } },
      settingsJson: { bar: 2 },
    });
    expect(out![intId]).toEqual({ bar: 2, keep: true });
  });
});

describe("readCreatePayloadFromJsonFile", () => {
  it("strips organizationId and returns body", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "openquok-agent-test-"));
    const file = path.join(dir, "post.json");
    fs.writeFileSync(
      file,
      JSON.stringify({
        organizationId: "should-be-removed",
        scheduledAt: "2026-01-01T00:00:00Z",
        status: "draft",
        body: "hi",
      }),
      "utf8"
    );
    try {
      const payload = readCreatePayloadFromJsonFile(file);
      expect(payload.organizationId).toBeUndefined();
      expect(payload.scheduledAt).toBe("2026-01-01T00:00:00Z");
      expect(payload.status).toBe("draft");
      expect(payload.body).toBe("hi");
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("throws when file missing", () => {
    expect(() => readCreatePayloadFromJsonFile(path.join(os.tmpdir(), "missing-openquok-xyz.json"))).toThrow(
      /json file not found/
    );
  });
});
