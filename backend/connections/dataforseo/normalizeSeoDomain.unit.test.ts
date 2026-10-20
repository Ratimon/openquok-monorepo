import { normalizeSeoDomain } from "./normalizeSeoDomain";

describe("normalizeSeoDomain", () => {
    it("strips scheme, www, and path", () => {
        expect(normalizeSeoDomain("https://www.Example.com/path")).toBe("example.com");
    });

    it("accepts bare hostnames", () => {
        expect(normalizeSeoDomain("openquok.com")).toBe("openquok.com");
    });

    it("rejects invalid hosts", () => {
        expect(normalizeSeoDomain("not a domain")).toBeNull();
        expect(normalizeSeoDomain("")).toBeNull();
    });
});
