import type { IOAuthProvider } from "../types";
import type { OAuthProfile } from "../types";

const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";
const GITHUB_EMAILS_URL = "https://api.github.com/user/emails";

export class GitHubProvider implements IOAuthProvider {
    readonly name = "github" as const;
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
        this.baseRedirectPath = `${backendOrigin}${authRoutePrefix}/oauth/github/callback`;
    }

    getRedirectUrl(state?: string): string {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.baseRedirectPath,
            scope: "user:email read:user",
        });
        if (state) params.set("state", state);
        return `${GITHUB_AUTH_URL}?${params.toString()}`;
    }

    async exchangeCodeForProfile(code: string): Promise<OAuthProfile> {
        const tokenRes = await fetch(GITHUB_TOKEN_URL, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.baseRedirectPath,
            }),
        });
        if (!tokenRes.ok) {
            const text = await tokenRes.text();
            throw new Error(`GitHub token exchange failed: ${text}`);
        }
        const tokenData = (await tokenRes.json()) as { access_token?: string };
        const accessToken = tokenData.access_token;
        if (!accessToken) throw new Error("GitHub did not return an access token");

        const userRes = await fetch(GITHUB_USER_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });
        if (!userRes.ok) {
            const text = await userRes.text();
            throw new Error(`GitHub user fetch failed: ${text}`);
        }
        const user = (await userRes.json()) as {
            id?: number;
            login?: string;
            name?: string | null;
            email?: string | null;
        };
        const id = String(user.id ?? user.login ?? "");
        let email = user.email;
        if (!email) {
            const emailsRes = await fetch(GITHUB_EMAILS_URL, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/vnd.github.v3+json",
                },
            });
            if (emailsRes.ok) {
                const emails = (await emailsRes.json()) as Array<{ email: string; primary?: boolean }>;
                const primary = emails.find((e) => e.primary) ?? emails[0];
                email = primary?.email;
            }
        }
        if (!id || !email) throw new Error("GitHub profile missing id or email");
        return {
            id,
            email,
            fullName: user.name ?? user.login ?? email,
        };
    }
}
