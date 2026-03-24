import { ValidationError } from "../../errors/InfraError";
import { isValidUUID } from "../helper";

/**
 * Value object for blog post identifier (UUID).
 */
export class BlogPostId {
    private readonly _value: string;

    constructor(value: string) {
        const trimmed = value?.trim();
        if (!trimmed || !BlogPostId.isValid(trimmed)) {
            throw new ValidationError(`Invalid blog post ID: ${value ?? ""}`);
        }
        this._value = trimmed;
        Object.freeze(this);
    }

    get value(): string {
        return this._value;
    }

    static isValid(id: string): boolean {
        return typeof id === "string" && isValidUUID(id.trim());
    }

    /**
     * Create a BlogPostId or return null if invalid (Listing-style factory).
     */
    static create(id: string): BlogPostId | null {
        try {
            return new BlogPostId(id);
        } catch {
            return null;
        }
    }

    toString(): string {
        return this._value;
    }
}
