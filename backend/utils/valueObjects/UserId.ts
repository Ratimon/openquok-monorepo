/**
 * Value object for user identifier (Supabase auth user id / UUID).
 */
export class UserId {
    private readonly value: string;

    private static readonly UUID_REGEX =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    constructor(id: string) {
        const trimmed = id?.trim();
        if (!trimmed || !UserId.UUID_REGEX.test(trimmed)) {
            throw new TypeError("UserId must be a valid UUID string");
        }
        this.value = trimmed;
    }

    toString(): string {
        return this.value;
    }

    equals(other: UserId | string): boolean {
        const str = typeof other === "string" ? other : other?.value;
        return this.value === str;
    }
}
