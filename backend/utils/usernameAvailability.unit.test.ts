import {
    evaluateUsernameAvailability,
    validateUsernameFormat,
    isReservedUsername,
} from "../utils/usernameAvailability";

describe("usernameAvailability", () => {
    describe("validateUsernameFormat", () => {
        it("accepts valid slugs", () => {
            expect(validateUsernameFormat("user1")).toEqual({ ok: true });
            expect(validateUsernameFormat("a-b-c")).toEqual({ ok: true });
        });

        it("rejects too short values", () => {
            const result = validateUsernameFormat("ab");
            expect(result.ok).toBe(false);
        });
    });

    describe("isReservedUsername", () => {
        it("reserves catalog publisher slug", () => {
            expect(isReservedUsername("openquok")).toBe(true);
            expect(isReservedUsername("OpenQuok")).toBe(true);
        });
    });

    describe("evaluateUsernameAvailability", () => {
        it("marks reserved names unavailable", () => {
            expect(
                evaluateUsernameAvailability({ username: "openquok", isTaken: false })
            ).toMatchObject({ available: false, reason: "reserved" });
        });

        it("marks taken names unavailable", () => {
            expect(
                evaluateUsernameAvailability({ username: "user1", isTaken: true })
            ).toMatchObject({ available: false, reason: "taken" });
        });

        it("marks free valid names available", () => {
            expect(
                evaluateUsernameAvailability({ username: "user1", isTaken: false })
            ).toEqual({ available: true });
        });
    });
});
