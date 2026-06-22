/**
 * Third-party OAuth2 Authorization Code flow + Openquok public API.
 *
 * Prerequisites:
 *   npm install express @openquok/node-sdk
 *
 * Register an OAuth app (Developers → Apps) with redirect URL matching CALLBACK_PATH.
 * Run: node oauth2-express.mjs
 */
import crypto from "node:crypto";
import express from "express";
import Openquok from "@openquok/node-sdk";

const CLIENT_ID = process.env.OPENQUOK_OAUTH_CLIENT_ID ?? "oqc_your_client_id";
const CLIENT_SECRET = process.env.OPENQUOK_OAUTH_CLIENT_SECRET ?? "oqs_your_client_secret";
const OPENQUOK_URL = process.env.OPENQUOK_FRONTEND_URL ?? "https://www.openquok.com";
const API_URL = process.env.OPENQUOK_API_URL ?? "https://api.openquok.com";
const PORT = Number(process.env.PORT ?? 3000);

/** Must match the Redirect URL on your OAuth app (used by Openquok when redirecting after consent). */
const CALLBACK_PATH = "/callback";

const app = express();
const pendingOAuthState = new Map();

app.get("/connect", (req, res) => {
    const state = crypto.randomBytes(16).toString("hex");
    const sessionKey = req.ip ?? "default";
    pendingOAuthState.set(sessionKey, state);

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        state,
    });

    res.redirect(`${OPENQUOK_URL}/oauth/authorize?${params}`);
});

app.get(CALLBACK_PATH, async (req, res) => {
    const { code, state, error } = req.query;
    const sessionKey = req.ip ?? "default";
    const expectedState = pendingOAuthState.get(sessionKey);

    if (error === "access_denied") {
        return res.status(200).send("User denied access");
    }

    if (!state || state !== expectedState) {
        return res.status(403).send("Invalid state");
    }
    pendingOAuthState.delete(sessionKey);

    if (typeof code !== "string") {
        return res.status(400).send("Missing authorization code");
    }

    const tokenRes = await fetch(`${API_URL}/api/v1/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            grant_type: "authorization_code",
            code,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }),
    });

    if (!tokenRes.ok) {
        const body = await tokenRes.text();
        return res.status(502).send(`Token exchange failed: ${body}`);
    }

    const { organizationId, access_token: accessToken } = await tokenRes.json();

    const openquok = new Openquok(accessToken, { baseUrl: API_URL });
    const integrations = await openquok.integrations();
    const workspace = await openquok.getWorkspace();

    res.json({
        connected: true,
        organizationId,
        workspace,
        integrations,
    });
});

app.listen(PORT, () => {
    console.log(`OAuth demo listening on http://localhost:${PORT}`);
    console.log(`Start flow: http://localhost:${PORT}/connect`);
});
