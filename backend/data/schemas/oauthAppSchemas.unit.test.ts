import { createOauthAppBodySchema } from "./oauthAppSchemas";

describe("createOauthAppBodySchema", () => {
    const orgId = "c1d8a3f4-1234-4abc-bf12-1234567890ab";

    it("accepts omitted pictureId (default OpenQuok icon)", () => {
        const result = createOauthAppBodySchema.safeParse({
            organizationId: orgId,
            name: "My App",
            redirectUrl: "https://www.openquok.com/cli/device/callback",
        });
        expect(result.success).toBe(true);
    });

    it("accepts explicit null pictureId", () => {
        const result = createOauthAppBodySchema.safeParse({
            organizationId: orgId,
            name: "My App",
            redirectUrl: "https://www.openquok.com/cli/device/callback",
            pictureId: null,
        });
        expect(result.success).toBe(true);
    });
});
