import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifySensitiveRpcResponse,
  countForeignSupabaseHosts,
  cronJobPresent,
  extractFirstJsonValue,
  filterHighSeverityRpcLints,
  internalFunctionsExposedToAnon,
  isHighSeverityRpcLint,
  isMaintenanceFreezeResponse,
  parseCliJsonStdout,
  parseLinkedQueryJson,
  publicStorageObjectUrl,
  summarizeCheckResults,
} from "./smokeChecks.mjs";

describe("extractFirstJsonValue", () => {
  it("parses JSON wrapped in CLI table output", () => {
    const stdout = `┌────────┐\n│ smoke  │\n├────────┤\n│ {"users":3} │\n└────────┘\n`;
    assert.deepEqual(extractFirstJsonValue(stdout), { users: 3 });
  });

  it("unwraps supabase db query row envelopes", () => {
    const stdout = `Initialising login role...\n${JSON.stringify({
      boundary: "abc",
      rows: [{ smoke: { users: 65, ext: true } }],
      warning: "untrusted",
    })}`;
    assert.deepEqual(parseLinkedQueryJson(stdout), { users: 65, ext: true });
    assert.equal(parseCliJsonStdout(stdout).rows[0].smoke.users, 65);
  });
});

describe("countForeignSupabaseHosts", () => {
  it("ignores the target host and counts others", () => {
    const html =
      'https://oldrefabcabcabc.supabase.co/storage/v1/object/public/blog_images/a.png ' +
      'https://newrefxyzxyzxyz.supabase.co/storage/v1/object/public/blog_images/b.png';
    assert.equal(countForeignSupabaseHosts(html, "newrefxyzxyzxyz"), 1);
    assert.equal(countForeignSupabaseHosts(html, "oldrefabcabcabc"), 1);
  });
});

describe("publicStorageObjectUrl", () => {
  it("builds a public object URL and strips a bucket prefix", () => {
    assert.equal(
      publicStorageObjectUrl("https://abc.supabase.co", "blog_images", "blog_images/hero.webp"),
      "https://abc.supabase.co/storage/v1/object/public/blog_images/hero.webp"
    );
  });

  it("returns an existing https URL unchanged", () => {
    const url = "https://abc.supabase.co/storage/v1/object/public/listing_images/x.png";
    assert.equal(publicStorageObjectUrl("https://abc.supabase.co", "listing_images", url), url);
  });
});

describe("classifySensitiveRpcResponse", () => {
  it("treats 2xx as a failed exposure", () => {
    assert.deepEqual(classifySensitiveRpcResponse(200, []), { ok: false, reason: "rpc_executed" });
  });

  it("treats missing-function PostgREST errors as denied", () => {
    assert.equal(classifySensitiveRpcResponse(404, { message: "missing" }).ok, true);
    assert.equal(
      classifySensitiveRpcResponse(400, { code: "PGRST202", message: "Could not find the function" }).ok,
      true
    );
  });

  it("treats other 400s as reachable", () => {
    assert.deepEqual(classifySensitiveRpcResponse(400, { code: "22P02" }), {
      ok: false,
      reason: "rpc_reachable",
    });
  });
});

describe("linter and grants", () => {
    it("does not fail WARN lints on non-internal trigger helpers", () => {
      assert.equal(
        isHighSeverityRpcLint({
          name: "anon_security_definer_function_executable",
          level: "WARN",
          metadata: { name: "handle_new_user" },
        }),
        false
      );
      assert.equal(
        isHighSeverityRpcLint({
          name: "0028_anon_security_definer_function_executable",
          level: "WARN",
          metadata: { name: "internal_find_full_user_by_email" },
        }),
        true
      );
      assert.equal(
        filterHighSeverityRpcLints([
          { name: "unindexed_foreign_keys", level: "WARN" },
          {
            name: "0028_anon_security_definer_function_executable",
            level: "ERROR",
            metadata: { name: "internal_x" },
          },
        ]).length,
        1
      );
    });

  it("lists internal functions executable by anon", () => {
    assert.deepEqual(
      internalFunctionsExposedToAnon([
        { name: "internal_a", anon: false },
        { name: "internal_b", anon: true },
      ]).map((row) => row.name),
      ["internal_b"]
    );
  });
});

describe("maintenance and cron", () => {
  it("detects write-freeze 503 bodies", () => {
    assert.equal(
      isMaintenanceFreezeResponse(503, { code: "maintenance_freeze_writes", message: "down" }),
      true
    );
    assert.equal(isMaintenanceFreezeResponse(401, { message: "nope" }), false);
  });

  it("requires the refresh-token cron job name", () => {
    assert.equal(cronJobPresent(["delete-expired-refresh-tokens"]), true);
    assert.equal(cronJobPresent([]), false);
  });
});

describe("summarizeCheckResults", () => {
  it("is ok only when nothing failed", () => {
    assert.equal(
      summarizeCheckResults([
        { status: "pass" },
        { status: "warn" },
        { status: "skip" },
      ]).ok,
      true
    );
    assert.equal(summarizeCheckResults([{ status: "fail" }]).ok, false);
  });
});
