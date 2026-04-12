import { config } from "../../config/GlobalConfig";

/** HTTPS origin used in OAuth redirect URIs (Meta requires HTTPS; dev may use a relay). */
export function oauthFrontendOrigin(): string {
    const url = (config.server as { frontendDomainUrl?: string })?.frontendDomainUrl ?? "http://localhost:5173";
    return url.indexOf("https") === -1 ? `https://redirectmeto.com/${url}` : url;
}
