import type { SupabaseClient } from "@supabase/supabase-js";

import { RefreshTokenRepository } from "./RefreshTokenRepository";

describe("RefreshTokenRepository.createToken", () => {
    const userId = "user-1";
    const token = "dtpaykibgsew";

    it("returns the existing row when the same Supabase refresh token is inserted twice", async () => {
        const existingRow = {
            id: "token-row-1",
            user_id: userId,
            token,
            created_at: "2026-09-10T00:00:00.000Z",
            expires_at: "2026-09-17T00:00:00.000Z",
        };

        const rpc = jest.fn().mockResolvedValue({
            error: {
                code: "23505",
                message: 'duplicate key value violates unique constraint "refresh_tokens_token_key"',
            },
        });

        const maybeSingle = jest.fn().mockResolvedValue({ data: existingRow, error: null });
        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));
        const from = jest.fn(() => ({ select }));

        const supabase = {
            rpc,
            from,
        } as unknown as SupabaseClient;

        const repo = new RefreshTokenRepository(supabase);
        const result = await repo.createToken({ userId, token });

        expect(result).toEqual({
            id: existingRow.id,
            userId,
            token,
            createdAt: existingRow.created_at,
            expiresAt: existingRow.expires_at,
        });
        expect(rpc).toHaveBeenCalledTimes(1);
        expect(from).toHaveBeenCalledWith("refresh_tokens");
    });

    it("treats duplicate-key errors without a PG code as idempotent when the row belongs to the same user", async () => {
        const existingRow = {
            id: "token-row-1",
            user_id: userId,
            token,
            created_at: "2026-09-10T00:00:00.000Z",
            expires_at: "2026-09-17T00:00:00.000Z",
        };

        const rpc = jest.fn().mockResolvedValue({
            error: {
                message: 'duplicate key value violates unique constraint "refresh_tokens_token_key"',
            },
        });

        const maybeSingle = jest.fn().mockResolvedValue({ data: existingRow, error: null });
        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));
        const from = jest.fn(() => ({ select }));

        const supabase = { rpc, from } as unknown as SupabaseClient;
        const repo = new RefreshTokenRepository(supabase);

        await expect(repo.createToken({ userId, token })).resolves.toEqual({
            id: existingRow.id,
            userId,
            token,
            createdAt: existingRow.created_at,
            expiresAt: existingRow.expires_at,
        });
    });

    it("still throws when the duplicate token belongs to a different user", async () => {
        const rpc = jest.fn().mockResolvedValue({
            error: {
                code: "23505",
                message: 'duplicate key value violates unique constraint "refresh_tokens_token_key"',
            },
        });

        const maybeSingle = jest.fn().mockResolvedValue({
            data: {
                id: "token-row-2",
                user_id: "other-user",
                token,
                created_at: "2026-09-10T00:00:00.000Z",
                expires_at: "2026-09-17T00:00:00.000Z",
            },
            error: null,
        });
        const eq = jest.fn(() => ({ maybeSingle }));
        const select = jest.fn(() => ({ eq }));
        const from = jest.fn(() => ({ select }));

        const supabase = {
            rpc,
            from,
        } as unknown as SupabaseClient;

        const repo = new RefreshTokenRepository(supabase);

        await expect(repo.createToken({ userId, token })).rejects.toMatchObject({
            name: "DatabaseError",
            metadata: { operation: "createToken" },
        });
    });
});

describe("RefreshTokenRepository.rotateToken", () => {
    const userId = "user-1";
    const oldToken = "old-refresh-token";
    const newToken = "dtpaykibgsew";
    const returnedId = "token-row-rotated";

    it("returns the new token row id from the rotate RPC on the happy path", async () => {
        const rpc = jest.fn().mockResolvedValue({
            data: returnedId,
            error: null,
        });

        const supabase = { rpc } as unknown as SupabaseClient;
        const repo = new RefreshTokenRepository(supabase);

        const result = await repo.rotateToken({
            oldToken,
            userId,
            newToken,
            ipAddress: "127.0.0.1",
            userAgent: "jest",
        });

        expect(result).toEqual({
            id: returnedId,
            userId,
            token: newToken,
            createdAt: expect.any(String),
            expiresAt: expect.any(String),
        });
        expect(rpc).toHaveBeenCalledWith(
            "internal_rotate_refresh_token",
            expect.objectContaining({
                p_old_token: oldToken,
                p_user_id: userId,
                p_new_token: newToken,
                p_new_id: expect.any(String),
                p_expires_at: expect.any(String),
                p_ip_address: "127.0.0.1",
                p_user_agent: "jest",
            }),
        );
    });

    it("throws DatabaseError when the rotate RPC fails", async () => {
        const rpc = jest.fn().mockResolvedValue({
            data: null,
            error: { message: "unexpected state" },
        });

        const supabase = { rpc } as unknown as SupabaseClient;
        const repo = new RefreshTokenRepository(supabase);

        await expect(repo.rotateToken({ oldToken, userId, newToken })).rejects.toMatchObject({
            name: "DatabaseError",
            metadata: { operation: "rotateToken" },
        });
    });
});
