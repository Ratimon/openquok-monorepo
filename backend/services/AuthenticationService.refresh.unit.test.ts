import type { SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import { AuthenticationService } from "./AuthenticationService";
import type { RefreshTokenRepository } from "../repositories/RefreshTokenRepository";
import type { UserRepository } from "../repositories/UserRepository";
import type { UserService } from "./UserService";
import type { EmailService } from "./EmailService";
import { AuthError } from "../errors/AuthError";

const mockRefreshSession = jest.fn();
const mockClearServiceSession = jest.fn(async () => undefined);

jest.mock("../connections/supabase", () => ({
    createSupabaseEphemeralAuthClient: jest.fn(() => ({
        auth: { refreshSession: mockRefreshSession },
    })),
    clearSupabaseServiceClientUserSession: (...args: unknown[]) => mockClearServiceSession(...args),
    createSupabaseRLSClient: jest.fn(),
}));

describe("AuthenticationService.refreshToken", () => {
    const refreshTokenRepository = {
        validateToken: jest.fn().mockResolvedValue({ userId: faker.string.uuid() }),
        revokeToken: jest.fn(),
        rotateToken: jest.fn(),
        createToken: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenRepository>;

    const supabaseServiceClient = {
        auth: { getSession: jest.fn(), signOut: jest.fn() },
    } as unknown as SupabaseClient;

    let service: AuthenticationService;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRefreshSession.mockResolvedValue({
            data: {
                session: {
                    access_token: "access",
                    refresh_token: "refresh-new",
                },
                user: { id: faker.string.uuid() },
            },
            error: null,
        });
        service = new AuthenticationService(
            supabaseServiceClient,
            refreshTokenRepository,
            {} as UserRepository,
            {} as UserService,
            { isEnabled: true } as EmailService
        );
    });

    it("refreshes via an ephemeral auth client, not the shared service client", async () => {
        const token = faker.string.alphanumeric(32);
        const result = await service.refreshToken(token);

        expect(mockRefreshSession).toHaveBeenCalledWith({ refresh_token: token });
        expect(result.session.refresh_token).toBe("refresh-new");
    });

    it("clears any polluted user session on the shared service client after refresh", async () => {
        await service.refreshToken(faker.string.alphanumeric(32));
        expect(mockClearServiceSession).toHaveBeenCalledWith(supabaseServiceClient);
    });

    it("throws AuthError 401 when Supabase rejects the refresh token", async () => {
        mockRefreshSession.mockResolvedValue({
            data: { session: null, user: null },
            error: { message: "Invalid Refresh Token: Already Used" },
        });

        await expect(service.refreshToken(faker.string.alphanumeric(32))).rejects.toThrow(AuthError);
    });
});
