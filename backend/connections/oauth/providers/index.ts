import type { IOAuthProvider } from "../types";
import type { OAuthProviderName } from "../types";
import { GoogleProvider } from "./GoogleProvider";
import { GitHubProvider } from "./GitHubProvider";
import { GenericOidcProvider } from "./GenericOidcProvider";
import { config } from "../../../config/GlobalConfig";

const serverConfig = config.server as { backendDomainUrl?: string };
const apiConfig = config.api as { prefix?: string };
const authConfig = config.oauth as {
    google?: { clientId?: string; clientSecret?: string };
    github?: { clientId?: string; clientSecret?: string };
    generic?: {
        authUrl?: string;
        tokenUrl?: string;
        userInfoUrl?: string;
        clientId?: string;
        clientSecret?: string;
        scope?: string;
    };
} | undefined;

const backendOrigin = serverConfig?.backendDomainUrl ?? "http://localhost:3000";
const authPrefix = `${apiConfig?.prefix ?? "/api/v1"}/auth`;

function buildGoogle(): IOAuthProvider | null {
    const c = authConfig?.google;
    if (!c?.clientId || !c?.clientSecret) return null;
    return new GoogleProvider(c.clientId, c.clientSecret, backendOrigin, authPrefix);
}

function buildGitHub(): IOAuthProvider | null {
    const c = authConfig?.github;
    if (!c?.clientId || !c?.clientSecret) return null;
    return new GitHubProvider(c.clientId, c.clientSecret, backendOrigin, authPrefix);
}

function buildGeneric(): IOAuthProvider | null {
    const c = authConfig?.generic;
    if (
        !c?.authUrl ||
        !c?.tokenUrl ||
        !c?.userInfoUrl ||
        !c?.clientId ||
        !c?.clientSecret
    )
        return null;
    return new GenericOidcProvider(
        {
            authUrl: c.authUrl,
            tokenUrl: c.tokenUrl,
            userInfoUrl: c.userInfoUrl,
            clientId: c.clientId,
            clientSecret: c.clientSecret,
        },
        backendOrigin,
        authPrefix,
        c.scope ?? "openid profile email"
    );
}

const providerBuilders: Record<OAuthProviderName, () => IOAuthProvider | null> = {
    google: buildGoogle,
    github: buildGitHub,
    generic: buildGeneric,
};

/** Get provider by name. Throws if provider is not configured or unknown. */
export function getOAuthProvider(name: string): IOAuthProvider {
    const normalized = name.toLowerCase() as OAuthProviderName;
    if (!Object.prototype.hasOwnProperty.call(providerBuilders, normalized)) {
        throw new Error(`Unknown OAuth provider: ${name}`);
    }
    const provider = providerBuilders[normalized]();
    if (!provider) {
        throw new Error(`OAuth provider "${name}" is not configured (missing env/config)`);
    }
    return provider;
}

/** List provider names that are configured. */
export function getConfiguredOAuthProviders(): OAuthProviderName[] {
    const list: OAuthProviderName[] = [];
    for (const key of Object.keys(providerBuilders) as OAuthProviderName[]) {
        if (providerBuilders[key]()) list.push(key);
    }
    return list;
}

export { GoogleProvider } from "./GoogleProvider";
export { GitHubProvider } from "./GitHubProvider";
export { GenericOidcProvider } from "./GenericOidcProvider";
