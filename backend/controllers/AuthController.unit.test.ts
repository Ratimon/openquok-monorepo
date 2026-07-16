import type { Request, Response, NextFunction } from "express";
import { faker } from "@faker-js/faker";

import { AuthController } from "./AuthController";
import type { AuthenticationService } from "../services/AuthenticationService";
import type { UserRepository } from "../repositories/UserRepository";
import type { EmailService } from "../services/EmailService";
import type { OrganizationService } from "../services/OrganizationService";
import type { UserService } from "../services/UserService";
import type { RbacService } from "../guards/rbac/RbacService";
import type { UserLike } from "../utils/dtos/UserDTO";

function createMockResponse(): jest.Mocked<Response> {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
    } as unknown as jest.Mocked<Response>;
}

function userLike(overrides: Partial<UserLike> & { id: string; email: string }): UserLike {
    return {
        auth_id: overrides.id,
        username: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        full_name: null,
        is_email_verified: true,
        provider: null,
        provider_id: null,
        ...overrides,
    };
}

describe("AuthController.signUp", () => {
    let authenticationService: jest.Mocked<Pick<AuthenticationService, "signUp" | "generateRefreshToken">>;
    let userRepository: jest.Mocked<
        Pick<
            UserRepository,
            | "checkIfEmailVerified"
            | "upsertUserFromAuth"
            | "updateEmailVerification"
            | "updateVerificationToken"
            | "findFullUserByEmail"
        >
    >;
    let emailService: jest.Mocked<
        Pick<EmailService, "isEnabled" | "generateVerificationToken" | "hashToken" | "send">
    >;
    let organizationService: jest.Mocked<Pick<OrganizationService, "createDefaultOrganizationForNewUser">>;
    let controller: AuthController;

    const next = jest.fn() as NextFunction;
    const password = faker.internet.password();
    const fullName = faker.person.fullName();

    beforeEach(() => {
        authenticationService = {
            signUp: jest.fn(),
            generateRefreshToken: jest.fn(),
        };
        userRepository = {
            checkIfEmailVerified: jest.fn().mockResolvedValue(false),
            upsertUserFromAuth: jest.fn().mockResolvedValue({ error: null }),
            updateEmailVerification: jest.fn().mockResolvedValue({ updateError: null }),
            updateVerificationToken: jest.fn().mockResolvedValue({ updateError: null, rowsAffected: 1 }),
            findFullUserByEmail: jest.fn().mockResolvedValue({
                userData: userLike({ id: "user-1", email: "test@example.com", full_name: fullName }),
            }),
        };
        emailService = {
            isEnabled: true,
            generateVerificationToken: jest.fn().mockReturnValue("plain-token"),
            hashToken: jest.fn().mockReturnValue("hashed-token"),
            send: jest.fn().mockResolvedValue(undefined),
        };
        organizationService = {
            createDefaultOrganizationForNewUser: jest.fn().mockResolvedValue({ id: "org-1" }),
        };

        controller = new AuthController(
            authenticationService as unknown as AuthenticationService,
            userRepository as unknown as UserRepository,
            {} as UserService,
            emailService as unknown as EmailService,
            organizationService as unknown as OrganizationService,
            {} as RbacService
        );
    });

    it("auto-verifies the user and skips verification token/email when email is disabled", async () => {
        Object.defineProperty(emailService, "isEnabled", { value: false, configurable: true });
        const userId = faker.string.uuid();
        const email = faker.internet.email().toLowerCase();
        authenticationService.signUp.mockResolvedValue({
            newUser: { id: userId, email },
            session: null,
        });
        userRepository.findFullUserByEmail.mockResolvedValue({
            userData: userLike({ id: userId, email, full_name: fullName, is_email_verified: true }),
        });

        const req = { body: { email, password, fullName }, cookies: {} } as unknown as Request;
        const res = createMockResponse();

        await controller.signUp(req, res, next);

        expect(userRepository.updateEmailVerification).toHaveBeenCalledWith(userId, true);
        expect(userRepository.updateVerificationToken).not.toHaveBeenCalled();
        expect(emailService.generateVerificationToken).not.toHaveBeenCalled();
        expect(emailService.send).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it("persists a verification token and sends email when email is enabled", async () => {
        const userId = faker.string.uuid();
        const email = faker.internet.email().toLowerCase();
        authenticationService.signUp.mockResolvedValue({
            newUser: { id: userId, email },
            session: null,
        });
        userRepository.findFullUserByEmail.mockResolvedValue({
            userData: userLike({ id: userId, email, full_name: fullName, is_email_verified: false }),
        });

        const req = { body: { email, password, fullName }, cookies: {} } as unknown as Request;
        const res = createMockResponse();

        await controller.signUp(req, res, next);

        expect(userRepository.updateEmailVerification).not.toHaveBeenCalled();
        expect(userRepository.updateVerificationToken).toHaveBeenCalledWith(
            userId,
            "hashed-token",
            expect.any(Date)
        );
        expect(emailService.send).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });
});
