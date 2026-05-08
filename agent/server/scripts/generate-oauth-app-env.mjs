#!/usr/bin/env node
/**
 * Create (or rotate) an Openquok OAuth app for the CLI auth server and print env vars.
 *
 * Why this exists:
 * - The hosted device-flow server (agent/server) needs an OAuth client ID/secret to exchange codes.
 * - The CLI itself must NOT embed secrets.
 * - The OAuth app secret is only returned once on create/rotate.
 *
 * Auth:
 * - Openquok backend requires `Authorization: Bearer <SUPABASE_ACCESS_TOKEN>` for `/api/v1/oauth-apps/*`.
 * - Provide a token for a workspace admin user (typically you, as project owner).
 */

import process from "node:process";

function readArg(name) {
  const key = `--${name}`;
  const idx = process.argv.indexOf(key);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function required(name, value) {
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required ${name}`);
  }
  return String(value).trim();
}

function stripTrailingSlash(url) {
  return url.replace(/\/+$/, "");
}

async function requestJson({ url, method, token, body }) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg = json?.message ?? json?.error ?? text ?? `HTTP ${res.status}`;
    throw new Error(`Request failed (${res.status}) ${method} ${url}: ${msg}`);
  }
  return json;
}

function printEnv({ clientId, clientSecret }) {
  // env-file friendly output
  process.stdout.write(`OPENQUOK_OAUTH_CLIENT_ID=${clientId}\n`);
  process.stdout.write(`OPENQUOK_OAUTH_CLIENT_SECRET=${clientSecret}\n`);
}

async function main() {
  const apiUrlRaw = readArg("apiUrl") ?? process.env.OPENQUOK_API_URL ?? "https://api.openquok.com";
  const apiUrl = stripTrailingSlash(apiUrlRaw);

  const accessToken = readArg("accessToken") ?? process.env.OPENQUOK_ADMIN_ACCESS_TOKEN ?? process.env.OPENQUOK_ACCESS_TOKEN;
  const orgId = readArg("organizationId") ?? process.env.OPENQUOK_ORGANIZATION_ID;

  const redirectUrl =
    readArg("redirectUrl") ?? process.env.OPENQUOK_OAUTH_REDIRECT_URL ?? "https://cli-auth.openquok.com/device/callback";
  const name = readArg("name") ?? process.env.OPENQUOK_OAUTH_APP_NAME ?? "Openquok CLI Auth Server";

  const rotate = hasFlag("rotate");

  required("accessToken (--accessToken or OPENQUOK_ADMIN_ACCESS_TOKEN)", accessToken);
  required("organizationId (--organizationId or OPENQUOK_ORGANIZATION_ID)", orgId);

  const base = `${apiUrl}/api/v1/oauth-apps`;
  const getUrl = `${base}/app?organizationId=${encodeURIComponent(orgId)}`;

  const existing = await requestJson({ url: getUrl, method: "GET", token: accessToken });
  const existingApp = existing?.data && existing.data !== false ? existing.data : null;

  if (!existingApp) {
    const created = await requestJson({
      url: base,
      method: "POST",
      token: accessToken,
      body: {
        organizationId: orgId,
        name,
        redirectUrl,
        description: "OAuth app used by the hosted CLI auth server (device flow).",
      },
    });
    const clientId = created?.data?.clientId;
    const clientSecret = created?.data?.clientSecret;
    required("clientId (server response)", clientId);
    required("clientSecret (server response)", clientSecret);
    printEnv({ clientId, clientSecret });
    return;
  }

  const clientId = existingApp.client_id ?? existingApp.clientId;
  required("clientId (existing app)", clientId);

  if (!rotate) {
    throw new Error(
      [
        "OAuth app already exists for this organization.",
        "Re-run with --rotate to generate a new client secret (shown once).",
        `Existing client id: ${clientId}`,
      ].join("\n")
    );
  }

  const oauthAppId = existingApp.id;
  required("oauthAppId (existing app id)", oauthAppId);

  const rotated = await requestJson({
    url: `${base}/rotate-secret`,
    method: "POST",
    token: accessToken,
    body: { organizationId: orgId, oauthAppId },
  });

  const newSecret = rotated?.data?.clientSecret;
  required("clientSecret (rotate-secret response)", newSecret);
  printEnv({ clientId, clientSecret: newSecret });
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});

