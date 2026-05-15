import { describe, expect, it } from "vitest";

import {
  classifyOpenquokDeployment,
  openquokOrigin,
  resolveApiUrlSource,
  resolveAuthServerSource,
} from "./config.logic";

describe("openquokOrigin", () => {
  it("normalizes hosts to lowercase", () => {
    expect(openquokOrigin("HTTPS://API.OPENQUOK.COM")).toBe("https://api.openquok.com");
  });

  it("preserves non-default ports", () => {
    expect(openquokOrigin("http://localhost:3000")).toBe("http://localhost:3000");
  });
});

describe("classifyOpenquokDeployment", () => {
  it("returns openquok_cloud for default API and default auth server", () => {
    expect(
      classifyOpenquokDeployment("https://api.openquok.com", "https://cli-auth.openquok.com")
    ).toBe("openquok_cloud");
  });

  it("treats trailing slashes on defaults as openquok_cloud", () => {
    expect(
      classifyOpenquokDeployment("https://api.openquok.com/", "https://cli-auth.openquok.com/")
    ).toBe("openquok_cloud");
  });

  it("returns custom when API host differs", () => {
    expect(
      classifyOpenquokDeployment("http://localhost:3000", "https://cli-auth.openquok.com")
    ).toBe("custom");
  });

  it("returns custom when auth server differs", () => {
    expect(
      classifyOpenquokDeployment("https://api.openquok.com", "http://localhost:3111")
    ).toBe("custom");
  });
});

describe("resolveApiUrlSource", () => {
  it("prefers environment over credentials file", () => {
    expect(resolveApiUrlSource("https://a.test", "http://localhost:3000")).toBe("environment");
  });

  it("uses credentials_file when env is unset", () => {
    expect(resolveApiUrlSource(undefined, "http://localhost:3000")).toBe("credentials_file");
  });

  it("falls back to default", () => {
    expect(resolveApiUrlSource(undefined, undefined)).toBe("default");
  });
});

describe("resolveAuthServerSource", () => {
  it("detects environment override", () => {
    expect(resolveAuthServerSource("http://localhost:3111")).toBe("environment");
  });

  it("falls back to default", () => {
    expect(resolveAuthServerSource(undefined)).toBe("default");
  });
});
