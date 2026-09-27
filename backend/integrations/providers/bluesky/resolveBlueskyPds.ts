import type { BlueskyStoredCredentials } from "./blueskyCredentials";

import { assertPublicHttpsBlueskyService, normalizeBlueskyServiceUrl } from "./blueskyCredentials";
import { logger } from "../../../utils/Logger";

const BSKY_PUBLIC_API = "https://public.api.bsky.app";
const PLC_DIRECTORY = "https://plc.directory";

const RESOLVE_FETCH_TIMEOUT_MS = 15_000;

type DidService = {
    id?: string;
    type?: string;
    serviceEndpoint?: string | string[];
};

type DidDocument = {
    id?: string;
    service?: DidService[];
};

export type BlueskyResolvedPds = {
    serviceUrl: string;
    did: string;
};

/** Login identifiers with `@` not at the start are treated as email (no PDS resolve). */
export function isBlueskyEmailLoginIdentifier(identifier: string): boolean {
    const trimmed = identifier.trim();
    if (!trimmed || trimmed.startsWith("did:")) return false;
    const at = trimmed.indexOf("@");
    return at > 0;
}

export function normalizeBlueskyHandleForResolve(identifier: string): string {
    let trimmed = identifier.trim();
    if (trimmed.startsWith("@")) trimmed = trimmed.slice(1);
    return trimmed;
}

function readAtprotoPdsEndpoint(doc: DidDocument): string | null {
    for (const svc of doc.service ?? []) {
        const id = typeof svc.id === "string" ? svc.id : "";
        const type = typeof svc.type === "string" ? svc.type : "";
        if (!id.endsWith("#atproto_pds") && type !== "AtprotoPersonalDataServer") continue;
        const endpoint = svc.serviceEndpoint;
        if (typeof endpoint === "string" && endpoint.trim()) return endpoint.trim();
        if (Array.isArray(endpoint)) {
            const first = endpoint.find((v) => typeof v === "string" && v.trim());
            if (typeof first === "string") return first.trim();
        }
    }
    return null;
}

function didWebDocumentUrl(did: string): string {
    if (!did.startsWith("did:web:")) {
        throw new Error("Invalid did:web identifier");
    }
    const rest = did.slice("did:web:".length);
    const segments = rest.split(":").map((part) => decodeURIComponent(part));
    const host = segments[0];
    if (!host) {
        throw new Error("Invalid did:web identifier");
    }
    const pathParts = segments.slice(1);
    const path =
        pathParts.length > 0 ? `/${pathParts.join("/")}/did.json` : "/.well-known/did.json";
    return `https://${host}${path}`;
}

async function fetchJsonDocument(url: string): Promise<unknown> {
    await assertPublicHttpsBlueskyService(url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), RESOLVE_FETCH_TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            headers: { accept: "application/json" },
            redirect: "error",
            signal: controller.signal,
        });
        if (!res.ok) {
            throw new Error(`Bluesky identity lookup failed (HTTP ${res.status})`);
        }
        return (await res.json()) as unknown;
    } finally {
        clearTimeout(timeout);
    }
}

async function resolveHandleToDid(handle: string): Promise<string> {
    const url = `${BSKY_PUBLIC_API}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`;
    const body = await fetchJsonDocument(url);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new Error("Could not resolve Bluesky handle");
    }
    const did = (body as { did?: unknown }).did;
    if (typeof did !== "string" || !did.startsWith("did:")) {
        throw new Error("Could not resolve Bluesky handle");
    }
    return did;
}

async function fetchDidDocument(did: string): Promise<DidDocument> {
    let docUrl: string;
    if (did.startsWith("did:plc:")) {
        docUrl = `${PLC_DIRECTORY}/${encodeURIComponent(did)}`;
    } else if (did.startsWith("did:web:")) {
        docUrl = didWebDocumentUrl(did);
    } else {
        throw new Error("Unsupported Bluesky account id");
    }
    const body = await fetchJsonDocument(docUrl);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new Error("Could not load Bluesky account document");
    }
    return body as DidDocument;
}

async function resolvePdsUrlFromDid(did: string): Promise<string> {
    const doc = await fetchDidDocument(did);
    const endpoint = readAtprotoPdsEndpoint(doc);
    if (!endpoint) {
        throw new Error("Could not find Bluesky PDS for this account");
    }
    let normalized: string;
    try {
        normalized = normalizeBlueskyServiceUrl(endpoint);
    } catch {
        throw new Error("Bluesky PDS URL is invalid");
    }
    if (!normalized.startsWith("https://")) {
        throw new Error("Bluesky PDS URL must use HTTPS");
    }
    await assertPublicHttpsBlueskyService(normalized);
    return normalized;
}

/**
 * Resolves the account PDS from a handle or DID. Returns null for email logins (use submitted service).
 */
export async function resolveBlueskyPdsFromIdentifier(
    identifier: string
): Promise<BlueskyResolvedPds | null> {
    const trimmed = identifier.trim();
    if (!trimmed) {
        throw new Error("Bluesky handle is required");
    }
    if (isBlueskyEmailLoginIdentifier(trimmed)) {
        return null;
    }
    const did = trimmed.startsWith("did:")
        ? trimmed
        : await resolveHandleToDid(normalizeBlueskyHandleForResolve(trimmed));
    const serviceUrl = await resolvePdsUrlFromDid(did);
    return { serviceUrl, did };
}

/** Prefer resolved PDS for handle/DID logins; keep submitted service for email. */
export async function applyBlueskyResolvedPdsToCredentials(
    credentials: BlueskyStoredCredentials
): Promise<BlueskyStoredCredentials> {
    const resolved = await resolveBlueskyPdsFromIdentifier(credentials.identifier);
    if (!resolved) {
        return credentials;
    }
    const submitted = normalizeBlueskyServiceUrl(credentials.service);
    if (submitted !== resolved.serviceUrl) {
        logger.warn({
            msg: "Bluesky service URL overridden by resolved PDS",
            submitted,
            resolved: resolved.serviceUrl,
        });
    }
    return { ...credentials, service: resolved.serviceUrl };
}
