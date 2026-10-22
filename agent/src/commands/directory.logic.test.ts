import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  buildCreateDirectoryProfileBody,
  buildEnsureVariantBody,
  buildUpdateDirectoryProfileBody,
  filterDirectoryProfilesListResponse,
  isMainProfileRow,
  parseDirectorySeoHistoryDays,
} from "./directory.logic";

describe("directory.logic", () => {
  const tempFiles: string[] = [];

  afterEach(() => {
    for (const file of tempFiles.splice(0)) {
      fs.rmSync(file, { force: true });
    }
  });

  it("parseDirectorySeoHistoryDays accepts 1–366", () => {
    expect(parseDirectorySeoHistoryDays(90)).toBe(90);
    expect(parseDirectorySeoHistoryDays(1)).toBe(1);
    expect(parseDirectorySeoHistoryDays(366)).toBe(366);
    expect(() => parseDirectorySeoHistoryDays(0)).toThrow(/1 to 366/);
    expect(() => parseDirectorySeoHistoryDays(400)).toThrow(/1 to 366/);
  });

  it("isMainProfileRow treats null parent as main", () => {
    expect(isMainProfileRow({ parentProfileId: null })).toBe(true);
    expect(isMainProfileRow({})).toBe(true);
    expect(isMainProfileRow({ parentProfileId: "child" })).toBe(false);
  });

  it("filterDirectoryProfilesListResponse keeps envelope shape", () => {
    const response = {
      success: true,
      data: [
        { id: "1", parentProfileId: null },
        { id: "2", parentProfileId: "1" },
      ],
    };
    const filtered = filterDirectoryProfilesListResponse(response, true) as {
      data: { id: string }[];
    };
    expect(filtered.data.map((r) => r.id)).toEqual(["1"]);
  });

  it("buildCreateDirectoryProfileBody requires name", () => {
    expect(() => buildCreateDirectoryProfileBody({})).toThrow(/name is required/);
    expect(buildCreateDirectoryProfileBody({ name: "Acme" }).name).toBe("Acme");
  });

  it("buildCreateDirectoryProfileBody merges json file and strips organizationId", () => {
    const file = path.join(os.tmpdir(), `openquok-dir-${Date.now()}.json`);
    tempFiles.push(file);
    fs.writeFileSync(
      file,
      JSON.stringify({ name: "From file", organizationId: "drop-me", tagline: "Hi" })
    );
    const body = buildCreateDirectoryProfileBody({
      json: file,
      websiteUrl: "https://example.com",
    });
    expect(body.name).toBe("From file");
    expect(body.tagline).toBe("Hi");
    expect(body.websiteUrl).toBe("https://example.com");
    expect(body.organizationId).toBeUndefined();
  });

  it("buildUpdateDirectoryProfileBody requires at least one field", () => {
    expect(() => buildUpdateDirectoryProfileBody({})).toThrow(/at least one field/);
    expect(buildUpdateDirectoryProfileBody({ name: "New" })).toEqual({ name: "New" });
  });

  it("buildEnsureVariantBody requires site-key", () => {
    expect(() => buildEnsureVariantBody({})).toThrow(/site-key/);
    expect(buildEnsureVariantBody({ siteKey: "peerpush", name: "Peer" })).toEqual({
      directorySiteKey: "peerpush",
      name: "Peer",
    });
  });
});
