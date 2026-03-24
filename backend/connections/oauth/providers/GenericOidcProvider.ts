import type { IOAuthProvider } from "../types";
import type { OAuthProfile } from "../types";

/** Generic OIDC/OAuth2 provider (e.g. Keycloak, Auth0, custom IdP). */
export class GenericOidcProvider implements IOAuthProvider {
    readonly name = "generic" as const;
    private readonly authUrl: string;
    private readonly tokenUrl: string;
    private readonly userInfoUrl: string;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly baseRedirectPath: string;
    /** Scopes to request (default openid profile email). */
    private readonly scope: string;

    constructor(
        env: {
            authUrl: string;
            tokenUrl: string;
            userInfoUrl: string;
            clientId: string;
            clientSecret: string;
        },
        backendOrigin: string,
        authRoutePrefix: string,
        scope = "openid profile email"
    ) {
        this.authUrl = env.authUrl;
        this.tokenUrl = env.tokenUrl;
        this.userInfoUrl = env.userInfoUrl;
        this.clientId = env.clientId;
        this.clientSecret = env.clientSecret;
        this.scope = scope;
        this.baseRedirectPath = `${backendOrigin}${authRoutePrefix}/oauth/generic/callback`;
    }

    getRedirectUrl(state?: string): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.baseRedirectPath,
            response_type: "code",
            scope: this.scope,
        });
        if (state) params.set("state", state);
        return `${this.authUrl}?${params.toString()}`;
    }

    async exchangeCodeForProfile(code: string): Promise<OAuthProfile> {
        const tokenRes = await fetch(this.tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code,
                redirect_uri: this.baseRedirectPath,
            }),
        });
        if (!tokenRes.ok) {
            const text = await tokenRes.text();
            throw new Error(`OIDC token exchange failed: ${text}`);
        }
        const tokenData = (await tokenRes.json()) as { access_token?: string };
        const accessToken = tokenData.access_token;
        if (!accessToken) throw new Error("OIDC did not return an access token");

        const userRes = await fetch(this.userInfoUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
        });
        if (!userRes.ok) {
            const text = await userRes.text();
            throw new Error(`OIDC userinfo failed: ${text}`);
        }
        const user = (await userRes.json()) as Record<string, unknown>;
        const id = (user.sub as string) ?? (user.id as string);
        const email = (user.email as string) ?? (user.preferred_username as string);
        const fullName = (user.name as string) ?? (user.preferred_username as string);
        if (!id || !email) throw new Error("OIDC userinfo missing sub/id or email");
        return {
            id,
            email,
            fullName: fullName || email,
        };
    }
}
