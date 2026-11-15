import { AuthValidationError, UserConflictError } from "../../errors/AuthError";
import { assertNewSignUpUser, throwMappedSupabaseSignUpError } from "./mapSupabaseSignUpError";

describe("throwMappedSupabaseSignUpError", () => {
    it("maps weak password errors", () => {
        expect(() =>
            throwMappedSupabaseSignUpError({
                code: "weak_password",
                message: "Password is known to be weak and easy to guess, please choose a different one.",
            })
        ).toThrow(AuthValidationError);
    });

    it("maps duplicate email errors", () => {
        expect(() =>
            throwMappedSupabaseSignUpError({
                message: "User already registered",
            })
        ).toThrow(UserConflictError);
    });
});

describe("assertNewSignUpUser", () => {
    it("throws when identities is empty (existing email)", () => {
        expect(() => assertNewSignUpUser({ identities: [] })).toThrow(UserConflictError);
    });

    it("allows a user with identities", () => {
        expect(() => assertNewSignUpUser({ identities: [{} as never] })).not.toThrow();
    });
});
