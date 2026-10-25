import {
    metaFacebookGraphRoot,
    metaFacebookOAuthDialogUrl,
    metaGraphApiVersion,
    metaInstagramGraphRoot,
} from "./metaGraphApi.js";

describe("metaGraphApi", () => {
    it("uses the configured default Graph API version", () => {
        expect(metaGraphApiVersion()).toBe("v26.0");
        expect(metaFacebookGraphRoot()).toBe("https://graph.facebook.com/v26.0");
        expect(metaInstagramGraphRoot()).toBe("https://graph.instagram.com/v26.0");
        expect(metaFacebookOAuthDialogUrl()).toBe("https://www.facebook.com/v26.0/dialog/oauth");
    });
});
