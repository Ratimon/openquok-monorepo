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

function isUniqueViolation(error: unknown): boolean {
    const pgError = error as { code?: string; message?: string };
    return pgError.code === "23505" || pgError.message?.includes("duplicate key") === true;
}

export class RefreshTokenRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    /** Create a new refresh token.
     *  Uses a SECURITY DEFINER RPC function to bypass RLS. */
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
        const id = uuidv4();
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

        logger.debug({ msg: "Creating refresh token", userId });

        const { error } = await this.supabase.rpc("internal_create_refresh_token" as never, {
            p_id: id,
            p_user_id: userId,
            p_token: tokenValue,
            p_expires_at: expiresAt.toISOString(),
            p_ip_address: ipAddress,
            p_user_agent: userAgent,
        } as never);

        if (error) {
            // Concurrent refresh requests can both succeed at Supabase and race to persist the same
            // rotated refresh token. Treat an existing row for the same user as success (idempotent).
            if (isUniqueViolation(error)) {
                const existing = await this._findTokenRow(tokenValue);
                if (existing && existing.user_id === userId) {
                    logger.debug({
                        msg: "Refresh token already stored; treating create as idempotent",
                        userId,
                    });
                    return {
                        id: existing.id,
                        userId: existing.user_id,
                        token: existing.token,
                        createdAt: existing.created_at,
                        expiresAt: existing.expires_at,
                    };
                }
            }

            throw new DatabaseError(`Failed to create refresh token: ${(error as { message?: string }).message ?? error}`, {
                cause: error as unknown as Error,
                operation: "createToken",
                resource: { type: "table", name: TABLE_NAME },
            });
        }

        return {
            id,
            userId,
            token: tokenValue,
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString(),
        };
    }

    /** Atomically revoke the old refresh token and insert the new one.
     *  Uses a SECURITY DEFINER RPC function to bypass RLS. */
    async rotateToken({
        oldToken,
        userId,
        newToken,
        expiresIn = 60 * 60 * 24 * 7,
        ipAddress = null,
        userAgent = null,
    }: {
        oldToken: string;
        userId: string;
        newToken: string;
        expiresIn?: number;
        ipAddress?: string | null;
        userAgent?: string | null;
    }) {
        this._validateId(userId, "userId");
        if (!oldToken || typeof oldToken !== "string") {
            throw new ValidationError("Old token is required and must be a string");
        }
        if (!newToken || typeof newToken !== "string") {
            throw new ValidationError("New token is required and must be a string");
        }

        const id = uuidv4();
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

        logger.debug({ msg: "Rotating refresh token", userId });

        const { data: rowId, error } = await this.supabase.rpc("internal_rotate_refresh_token" as never, {
            p_old_token: oldToken,
            p_new_id: id,
            p_user_id: userId,
            p_new_token: newToken,
            p_expires_at: expiresAt.toISOString(),
            p_ip_address: ipAddress,
            p_user_agent: userAgent,
        } as never);

        if (error) {
            throw new DatabaseError(`Failed to rotate refresh token: ${(error as { message?: string }).message ?? error}`, {
                cause: error as unknown as Error,
                operation: "rotateToken",
                resource: { type: "table", name: TABLE_NAME },
            });
        }

        if (!rowId) {
            throw new DatabaseError("Failed to rotate refresh token: RPC returned no row id", {
                operation: "rotateToken",
                resource: { type: "table", name: TABLE_NAME },
            });
        }

        return {
            id: rowId,
            userId,
            token: newToken,
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString(),
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

    private async _findTokenRow(token: string) {
        const { data, error } = await this.supabase
            .from(TABLE_NAME)
            .select("id, user_id, token, created_at, expires_at")
            .eq("token", token)
            .maybeSingle();

        if (error) {
            throw new DatabaseError(`Failed to load refresh token: ${error.message}`, {
                cause: error as unknown as Error,
                operation: "findTokenRow",
                resource: { type: "table", name: TABLE_NAME },
            });
        }

        return data;
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
