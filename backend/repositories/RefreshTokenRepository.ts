import type { SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "node:crypto";
import {
    IncorrectUserIDError,
    MissingUserIdError,
} from "../errors/AuthError";
import {
    ValidationError,
    DatabaseError,
    DatabaseEntityNotFoundError,
} from "../errors/InfraError";
import { logger } from "../utils/Logger";

const TABLE_NAME = "refresh_tokens";

export class RefreshTokenRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async createToken({
        userId,
        token = null,
        expiresIn = 60 * 60 * 24 * 7,
        ipAddress = null,
        userAgent = null,
    }: {
        userId: string;
        token?: string | null;
        expiresIn?: number;
        ipAddress?: string | null;
        userAgent?: string | null;
    }) {
        this._validateId(userId, "userId");
        const tokenValue = token ?? this._generateToken();
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

        const tokenData = {
            id: uuidv4(),
            user_id: userId,
            token: tokenValue,
            created_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString(),
            revoked: false,
            ip_address: ipAddress,
            user_agent: userAgent,
        };

        logger.debug({ msg: "Creating refresh token", userId });

        const { data, error } = await this.supabase
            .from(TABLE_NAME)
            .insert(tokenData)
            .select()
            .single();

        if (error) {
            throw new DatabaseError(`Failed to create refresh token: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "createToken",
                resource: { type: "table", name: TABLE_NAME },
            });
        }

        return {
            id: data.id,
            userId: data.user_id,
            token: data.token,
            createdAt: data.created_at,
            expiresAt: data.expires_at,
        };
    }

    async validateToken(token: string) {
        if (!token || typeof token !== "string") {
            throw new ValidationError("Token is required and must be a string");
        }

        logger.debug({ msg: "Validating refresh token" });

        const { data, error } = await this.supabase
            .from(TABLE_NAME)
            .select("*")
            .eq("token", token)
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Failed to validate refresh token: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "validateToken",
                entityType: TABLE_NAME,
            });
        }

        if (!data) {
            throw new DatabaseEntityNotFoundError("refresh_token", { token }, { entityType: TABLE_NAME });
        }

        if (data.revoked) {
            throw new ValidationError("Refresh token has been revoked");
        }

        const expiresAt = new Date(data.expires_at);
        if (expiresAt < new Date()) {
            throw new ValidationError("Refresh token has expired");
        }

        return {
            id: data.id,
            userId: data.user_id,
            token: data.token,
            createdAt: data.created_at,
            expiresAt: data.expires_at,
            ipAddress: data.ip_address,
            userAgent: data.user_agent,
        };
    }

    async revokeToken(token: string, replacedBy: string | null = null) {
        if (!token || typeof token !== "string") {
            throw new ValidationError("Token is required and must be a string");
        }

        const { data: existingToken, error: findError } = await this.supabase
            .from(TABLE_NAME)
            .select("id")
            .eq("token", token)
            .maybeSingle();

        if (findError) {
            throw new DatabaseError(`Failed to find refresh token: ${findError.message}`, {
                cause: findError as unknown as Error,
                operation: "revokeToken",
                entityType: TABLE_NAME,
            });
        }

        if (!existingToken) {
            throw new DatabaseEntityNotFoundError("refresh_token", { token }, { entityType: TABLE_NAME });
        }

        const updateData: { revoked: boolean; revoked_at: string; replaced_by?: string } = {
            revoked: true,
            revoked_at: new Date().toISOString(),
        };
        if (replacedBy) updateData.replaced_by = replacedBy;

        const { data, error } = await this.supabase
            .from(TABLE_NAME)
            .update(updateData)
            .eq("token", token)
            .select("id, user_id, revoked, revoked_at, replaced_by")
            .single();

        if (error) {
            throw new DatabaseError(`Failed to revoke refresh token: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "revokeToken",
                entityType: TABLE_NAME,
            });
        }

        return {
            id: data.id,
            userId: data.user_id,
            revoked: data.revoked,
            revokedAt: data.revoked_at,
            replacedBy: data.replaced_by,
        };
    }

    _generateToken(): string {
        return randomBytes(40).toString("hex");
    }

    _validateId(id: string, paramName = "id"): void {
        if (!id) throw new MissingUserIdError("Missing userId");
        if (typeof id !== "string") {
            throw new IncorrectUserIDError(`${paramName} must be a string`);
        }
    }
}
