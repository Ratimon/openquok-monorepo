import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  buildPlugUpsertInput,
  parseActivatedFlag,
  parsePlugFieldsJson,
  readPlugUpsertFromJsonFile,
} from "./plugs.logic";

describe("plugs.logic", () => {
  const tempFiles: string[] = [];

  afterEach(() => {
    for (const file of tempFiles.splice(0)) {
      fs.rmSync(file, { force: true });
    }
  });

  it("parsePlugFieldsJson accepts name/value pairs", () => {
    expect(parsePlugFieldsJson([{ name: "likesAmount", value: "100" }])).toEqual([
      { name: "likesAmount", value: "100" },
    ]);
  });

  it("buildPlugUpsertInput requires func without json", () => {
    expect(() => buildPlugUpsertInput({ fields: [] })).toThrow(/func is required/);
  });

  it("buildPlugUpsertInput builds from flags", () => {
    const out = buildPlugUpsertInput({
      func: "autoPlugPost",
      fields: [{ name: "likesAmount", value: "50" }],
      plugId: "4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b",
    });
    expect(out.func).toBe("autoPlugPost");
    expect(out.plugId).toBe("4f7a1b2c-3d4e-5f60-7a8b-9c0d1e2f3a4b");
  });

  it("readPlugUpsertFromJsonFile reads func and fields", () => {
    const file = path.join(os.tmpdir(), `openquok-plug-${Date.now()}.json`);
    tempFiles.push(file);
    fs.writeFileSync(
      file,
      JSON.stringify({
        func: "autoRepostPost",
        fields: [{ name: "likesAmount", value: "25" }],
      })
    );
    expect(readPlugUpsertFromJsonFile(file)).toEqual({
      func: "autoRepostPost",
      fields: [{ name: "likesAmount", value: "25" }],
      plugId: undefined,
    });
  });

  it("parseActivatedFlag coerces booleans", () => {
    expect(parseActivatedFlag(true)).toBe(true);
    expect(parseActivatedFlag("false")).toBe(false);
    expect(() => parseActivatedFlag("maybe")).toThrow(/activated must be true or false/);
  });
});
