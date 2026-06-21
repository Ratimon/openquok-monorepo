import { ApiResponseError } from "twitter-api-v2";

import { mapXApiError } from "./xErrors.js";
import { ProviderAccessTokenExpiredError } from "../../../errors/ProviderIntegrationErrors.js";

describe("mapXApiError", () => {
    it("maps auth errors to ProviderAccessTokenExpiredError", () => {
        const err = new ApiResponseError("Unauthorized", {
            code: 401,
            data: { detail: "Could not authenticate you" },
        } as any);
        const mapped = mapXApiError(err);
        expect(mapped).toBeInstanceOf(ProviderAccessTokenExpiredError);
    });

    it("maps usage cap messages", () => {
        const mapped = mapXApiError(new Error("Usage cap exceeded"));
        expect(mapped.message).toMatch(/usage limit/i);
    });

    it("maps duplicate content messages", () => {
        const mapped = mapXApiError(new Error("You have already posted this Tweet"));
        expect(mapped.message).toMatch(/duplicate/i);
    });
});
