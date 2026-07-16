import type { Request, Response } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import { AuthenticationService } from "./AuthenticationService";
import type { RefreshTokenRepository } from "../repositories/RefreshTokenRepository";
import type { UserRepository } from "../repositories/UserRepository";
import type { UserService } from "./UserService";
import type { EmailService } from "./EmailService";
import type { UserLike } from "../utils/dtos/UserDTO";
import {
    InvalidCredentialsError,
    NotVerifiedUserError,
    OAuthSignInRequiredError,
} from "../errors/AuthError";

const email = faker.internet.email().toLowerCase();
const password = faker.internet.password();

function createMockUserRepo(): jest.Mocked<UserRepository> {
    return {
        findFullUserByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
}

function createMockEmailService(options?: { isEnabled?: boolean }): jest.Mocked<Pick<EmailService, "isEnabled">> {
    return {
        isEnabled: options?.isEnabled ?? true,
    } as unknown as jest.Mocked<Pick<EmailService, "isEnabled">>;
}

function createService(
    userRepo: jest.Mocked<UserRepository>,
    emailService: jest.Mocked<Pick<EmailService, "isEnabled">> = createMockEmailService()
): AuthenticationService {
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
        {} as UserService,
        emailService as unknown as EmailService
    );
    service.createRLSClient = createRLSClient;
    return service;
}

function baseUser(overrides?: Partial<UserLike>): UserLike {
    return {
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
        ...overrides,
    };
}

describe("AuthenticationService.signIn", () => {
    let userRepo: jest.Mocked<UserRepository>;
    let service: AuthenticationService;
    let signInWithPassword: jest.Mock;
    let emailService: jest.Mocked<Pick<EmailService, "isEnabled">>;

    const context = { req: {} as Request, res: {} as Response };

    beforeEach(() => {
        userRepo = createMockUserRepo();
        emailService = createMockEmailService({ isEnabled: true });
        service = createService(userRepo, emailService);
        const rlsClient = (service as unknown as { createRLSClient: jest.Mock }).createRLSClient();
        signInWithPassword = rlsClient.auth.signInWithPassword as jest.Mock;
    });

    it("throws OAuthSignInRequiredError when password sign-in fails for a Google-linked account", async () => {
        signInWithPassword.mockResolvedValue({
            data: { user: null, session: null },
            error: { message: "Invalid login credentials" },
        });
        userRepo.findFullUserByEmail.mockResolvedValue({
            userData: baseUser({ provider: "google", provider_id: faker.string.uuid() }),
        });

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
        userRepo.findFullUserByEmail.mockResolvedValue({ userData: baseUser() });

        await expect(service.signIn(email, password, context)).rejects.toThrow(InvalidCredentialsError);
    });

    it("throws NotVerifiedUserError when email is enabled and the user is not verified", async () => {
        const userId = faker.string.uuid();
        signInWithPassword.mockResolvedValue({
            data: {
                user: { id: userId, email },
                session: { access_token: "access", refresh_token: "refresh" },
            },
            error: null,
        });
        userRepo.findFullUserByEmail.mockResolvedValue({
            userData: baseUser({ id: userId, is_email_verified: false }),
        });

        await expect(service.signIn(email, password, context)).rejects.toThrow(NotVerifiedUserError);
        await expect(service.signIn(email, password, context)).rejects.toThrow("User is not verified");
    });

    it("allows sign-in when email is disabled even if the user is not verified", async () => {
        emailService = createMockEmailService({ isEnabled: false });
        service = createService(userRepo, emailService);
        const rlsClient = (service as unknown as { createRLSClient: jest.Mock }).createRLSClient();
        signInWithPassword = rlsClient.auth.signInWithPassword as jest.Mock;

        const userId = faker.string.uuid();
        signInWithPassword.mockResolvedValue({
            data: {
                user: { id: userId, email },
                session: { access_token: "access", refresh_token: "refresh" },
            },
            error: null,
        });
        const unverified = baseUser({ id: userId, is_email_verified: false });
        userRepo.findFullUserByEmail.mockResolvedValue({ userData: unverified });

        const result = await service.signIn(email, password, context);
        expect(result.signedInUser.id).toBe(userId);
        expect(result.userDBdata).toEqual(unverified);
        expect(result.session).toEqual({ access_token: "access", refresh_token: "refresh" });
    });
});
