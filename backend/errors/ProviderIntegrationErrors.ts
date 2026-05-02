/**
 * Thrown when a provider indicates the channel access token is invalid/expired and a refresh + retry may succeed.
 */
export class ProviderAccessTokenExpiredError extends Error {
    override readonly name = "ProviderAccessTokenExpiredError";

    constructor(message = "Provider rejected access token; refresh and retry") {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
