import type { IOAuthProvider } from "../types";
import type { OAuthProfile } from "../types";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

export class GoogleProvider implements IOAuthProvider {
    readonly name = "google" as const;
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly baseRedirectPath: string;

    constructor(
        clientId: string,
        clientSecret: string,
        backendOrigin: string,
        authRoutePrefix: string
    ) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.baseRedirectPath = `${backendOrigin}${authRoutePrefix}/oauth/google/callback`;
    }

    getRedirectUrl(state?: string): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.baseRedirectPath,
            response_type: "code",
            scope: [
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
            ].join(" "),
            access_type: "offline",
            prompt: "consent",
        });
        if (state) params.set("state", state);
        return `${GOOGLE_AUTH_URL}?${params.toString()}`;
    }

    async exchangeCodeForProfile(code: string): Promise<OAuthProfile> {
        const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.baseRedirectPath,
                grant_type: "authorization_code",
            }),
        });
        if (!tokenRes.ok) {
            const text = await tokenRes.text();
            throw new Error(`Google token exchange failed: ${text}`);
        }
        const tokenData = (await tokenRes.json()) as { access_token?: string };
        const accessToken = tokenData.access_token;
        if (!accessToken) throw new Error("Google did not return an access token");

        const userRes = await fetch(GOOGLE_USERINFO_URL, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!userRes.ok) {
            const text = await userRes.text();
            throw new Error(`Google userinfo failed: ${text}`);
        }
        const user = (await userRes.json()) as {
            id?: string;
            email?: string;
            name?: string;
        };
        const id = user.id ?? user.email;
        if (!id || !user.email) throw new Error("Google userinfo missing id or email");
        return {
            id,
            email: user.email,
            fullName: user.name ?? user.email,
        };
    }
}
