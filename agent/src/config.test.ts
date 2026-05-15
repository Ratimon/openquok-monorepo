import { describe, expect, it } from "vitest";

import { getConfig, mergeConfigWithCredentials, type StoredCredentials } from "./config";

describe("mergeConfigWithCredentials", () => {
  const base = getConfig();

  it("uses stored apiUrl when OPENQUOK_API_URL is unset", () => {
    const creds: StoredCredentials = {
      apiKey: "opo_test",
      apiUrl: "http://localhost:3000",
    };
    const prev = process.env.OPENQUOK_API_URL;
    delete process.env.OPENQUOK_API_URL;

    const merged = mergeConfigWithCredentials(base, creds);

    expect(merged.apiKey).toBe("opo_test");
    expect(merged.apiUrl).toBe("http://localhost:3000");

    if (prev === undefined) delete process.env.OPENQUOK_API_URL;
    else process.env.OPENQUOK_API_URL = prev;
  });

  it("prefers OPENQUOK_API_URL over stored apiUrl", () => {
    const creds: StoredCredentials = {
      apiKey: "opo_test",
      apiUrl: "http://localhost:3000",
    };
    const prev = process.env.OPENQUOK_API_URL;
    process.env.OPENQUOK_API_URL = "https://api.example.test";

    const merged = mergeConfigWithCredentials(base, creds);

    expect(merged.apiUrl).toBe("https://api.example.test");

    if (prev === undefined) delete process.env.OPENQUOK_API_URL;
    else process.env.OPENQUOK_API_URL = prev;
  });
});
