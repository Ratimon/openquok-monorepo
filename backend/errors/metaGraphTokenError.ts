import { ProviderAccessTokenExpiredError } from "./ProviderIntegrationErrors";

type MetaGraphErrorBody = {
    error?: { code?: number; error_subcode?: number; message?: string };
};

/**
 * Meta Graph often returns `error.code` 190 / 102 or `error_subcode` 463 when the user token must be refreshed.
 */
export function throwIfMetaGraphInvalidAccessToken(json: MetaGraphErrorBody): void {
    const e = json.error;
    if (!e) return;
    const code = e.code;
    const sub = e.error_subcode;
    if (code === 190 || code === 102 || sub === 463) {
        throw new ProviderAccessTokenExpiredError(e.message);
    }
}
