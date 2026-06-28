import { isValidUUID } from "../validation/uuid";

/**
 * Value object for listing UUID identifiers.
 */
export class ListingId {
    private readonly _value: string;

    private constructor(value: string) {
        const trimmed = value.trim();
        if (!trimmed || !ListingId.isValid(trimmed)) {
            throw new Error(`Invalid listing ID: ${value}`);
        }
        this._value = trimmed;
    }

    get value(): string {
        return this._value;
    }

    static isValid(id: string): boolean {
        return isValidUUID(id);
    }

    static create(id: string): ListingId | null {
        try {
            return new ListingId(id);
        } catch {
            return null;
        }
    }

    toString(): string {
        return this._value;
    }
}
