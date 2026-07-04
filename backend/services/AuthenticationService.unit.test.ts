import type { Request, Response } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import { AuthenticationService } from "./AuthenticationService";
import type { RefreshTokenRepository } from "../repositories/RefreshTokenRepository";
import type { UserRepository } from "../repositories/UserRepository";
import type { UserService } from "./UserService";
import type { UserLike } from "../utils/dtos/UserDTO";
import {
    InvalidCredentialsError,
    OAuthSignInRequiredError,
} from "../errors/AuthError";

const email = faker.internet.email().toLowerCase();
const password = faker.internet.password();

function createMockUserRepo(): jest.Mocked<UserRepository> {
    return {
        findFullUserByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
}

function createService(userRepo: jest.Mocked<UserRepository>): AuthenticationService {
    const supabaseRLSClient = {
        auth: {
            signInWithPassword: jest.fn(),
        },
    };
    const createRLSClient = jest.fn().mockReturnValue(supabaseRLSClient);
    const service = new AuthenticationService(
        {} as SupabaseClient,
        {} as RefreshTokenRepository,
        userRepo,
        {} as UserService
    );
    service.createRLSClient = createRLSClient;
    return service;
}

describe("AuthenticationService.signIn", () => {
    let userRepo: jest.Mocked<UserRepository>;
    let service: AuthenticationService;
    let signInWithPassword: jest.Mock;

    const context = { req: {} as Request, res: {} as Response };

    beforeEach(() => {
        userRepo = createMockUserRepo();
        service = createService(userRepo);
        const rlsClient = (service as unknown as { createRLSClient: jest.Mock }).createRLSClient();
        signInWithPassword = rlsClient.auth.signInWithPassword as jest.Mock;
    });

    it("throws OAuthSignInRequiredError when password sign-in fails for a Google-linked account", async () => {
        signInWithPassword.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: "Invalid login credentials" },
        });
        const oauthUser: UserLike = {
            id: faker.string.uuid(),
            auth_id: faker.string.uuid(),
            email,
            full_name: faker.person.fullName(),
            username: null,
            is_email_verified: true,
            provider: "google",
            provider_id: faker.string.uuid(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        userRepo.findFullUserByEmail.mockResolvedValue({ userData: oauthUser });

        await expect(service.signIn(email, password, context)).rejects.toThrow(OAuthSignInRequiredError);
        await expect(service.signIn(email, password, context)).rejects.toThrow(
            "This account uses Google sign-in. Please continue with Google."
        );
    });

    it("throws InvalidCredentialsError when password sign-in fails and account is not OAuth-linked", async () => {
        signInWithPassword.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: "Invalid login credentials" },
        });
        userRepo.findFullUserByEmail.mockResolvedValue({ userData: null });

        await expect(service.signIn(email, password, context)).rejects.toThrow(InvalidCredentialsError);
        await expect(service.signIn(email, password, context)).rejects.toThrow("Invalid credentials");
    });

    it("throws InvalidCredentialsError when password sign-in fails for an email/password account", async () => {
        signInWithPassword.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: "Invalid login credentials" },
        });
        const passwordUser: UserLike = {
            id: faker.string.uuid(),
            auth_id: faker.string.uuid(),
            email,
            full_name: faker.person.fullName(),
            username: null,
            is_email_verified: true,
            provider: null,
            provider_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        userRepo.findFullUserByEmail.mockResolvedValue({ userData: passwordUser });

        await expect(service.signIn(email, password, context)).rejects.toThrow(InvalidCredentialsError);
    });
});
