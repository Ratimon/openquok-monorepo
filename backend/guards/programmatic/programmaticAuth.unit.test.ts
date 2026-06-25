import { faker } from "@faker-js/faker";
import type { NextFunction, Request, Response } from "express";
import { SubscriptionSection } from "openquok-common";

import { SubscriptionError } from "../../errors/SubscriptionError";
import type { OrganizationRepository } from "../../repositories/OrganizationRepository";
import type { OauthAppService } from "../../services/OauthAppService";
import type { SubscriptionGuardService } from "../subscription/SubscriptionGuardService";
import { requireProgrammaticAuth, type ProgrammaticAuthRequest } from "./programmaticAuth";

faker.seed(55_010);

const organizationId = faker.string.uuid();
const oauthAppId = faker.string.uuid();
const tokenId = faker.string.uuid();
const publicUserId = faker.string.uuid();
const programmaticToken = `opo_${faker.string.alphanumeric(32)}`;
const invalidBearer = `not_a_valid_programmatic_token_${faker.string.alphanumeric(16)}`;

const organization = {
    id: organizationId,
    name: faker.company.name(),
    description: null,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.past().toISOString(),
};

function createMocks() {
    const oauthAppService = {
        verifyProgrammaticToken: jest.fn(),
    } as unknown as jest.Mocked<Pick<OauthAppService, "verifyProgrammaticToken">>;

    const organizationRepository = {
        findOrganizationById: jest.fn(),
    } as unknown as jest.Mocked<Pick<OrganizationRepository, "findOrganizationById">>;

    const subscriptionGuard = {
        assert: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<Pick<SubscriptionGuardService, "assert">>;

    return { oauthAppService, organizationRepository, subscriptionGuard };
}

async function runMiddleware(
    req: Partial<Request>,
    middleware: ReturnType<typeof requireProgrammaticAuth>
): Promise<{ statusCode?: number; body?: unknown; next: jest.Mock }> {
    let statusCode: number | undefined;
    let body: unknown;
    const res = {
        status: jest.fn((code: number) => {
            statusCode = code;
            return res;
        }),
        json: jest.fn((payload: unknown) => {
            body = payload;
        }),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    try {
        await middleware(req as Request, res, next);
    } catch (err) {
        throw err;
    }

    return { statusCode, body, next: next as jest.Mock };
}

describe("requireProgrammaticAuth", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when Authorization is missing", async () => {
        const { oauthAppService, organizationRepository, subscriptionGuard } = createMocks();
        const middleware = requireProgrammaticAuth({
            oauthAppService: oauthAppService as unknown as OauthAppService,
            organizationRepository: organizationRepository as unknown as OrganizationRepository,
            subscriptionGuard: subscriptionGuard as unknown as SubscriptionGuardService,
        });

        const { statusCode, body, next } = await runMiddleware({ headers: {} }, middleware);

        expect(statusCode).toBe(401);
        expect(body).toEqual({ msg: "No API key provided" });
        expect(next).not.toHaveBeenCalled();
        expect(oauthAppService.verifyProgrammaticToken).not.toHaveBeenCalled();
    });

    it("returns 401 for invalid bearer without calling subscription guard", async () => {
        const { oauthAppService, organizationRepository, subscriptionGuard } = createMocks();
        oauthAppService.verifyProgrammaticToken.mockResolvedValue(null);

        const middleware = requireProgrammaticAuth({
            oauthAppService: oauthAppService as unknown as OauthAppService,
            organizationRepository: organizationRepository as unknown as OrganizationRepository,
            subscriptionGuard: subscriptionGuard as unknown as SubscriptionGuardService,
        });

        const { statusCode, body, next } = await runMiddleware(
            { headers: { authorization: `Bearer ${invalidBearer}` } },
            middleware
        );

        expect(oauthAppService.verifyProgrammaticToken).toHaveBeenCalledWith(invalidBearer);
        expect(statusCode).toBe(401);
        expect(body).toEqual({ msg: "Invalid API key" });
        expect(subscriptionGuard.assert).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when OAuth token verification fails", async () => {
        const { oauthAppService, organizationRepository, subscriptionGuard } = createMocks();
        oauthAppService.verifyProgrammaticToken.mockResolvedValue(null);

        const middleware = requireProgrammaticAuth({
            oauthAppService: oauthAppService as unknown as OauthAppService,
            organizationRepository: organizationRepository as unknown as OrganizationRepository,
            subscriptionGuard: subscriptionGuard as unknown as SubscriptionGuardService,
        });

        const { statusCode, body, next } = await runMiddleware(
            { headers: { authorization: `Bearer ${programmaticToken}` } },
            middleware
        );

        expect(statusCode).toBe(401);
        expect(body).toEqual({ msg: "Invalid API key" });
        expect(subscriptionGuard.assert).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when the organization no longer exists", async () => {
        const { oauthAppService, organizationRepository, subscriptionGuard } = createMocks();
        oauthAppService.verifyProgrammaticToken.mockResolvedValue({
            organizationId,
            oauthAppId,
            tokenId,
            userId: publicUserId,
        });
        organizationRepository.findOrganizationById.mockResolvedValue({
            organization: null,
            error: null,
        });

        const middleware = requireProgrammaticAuth({
            oauthAppService: oauthAppService as unknown as OauthAppService,
            organizationRepository: organizationRepository as unknown as OrganizationRepository,
            subscriptionGuard: subscriptionGuard as unknown as SubscriptionGuardService,
        });

        const { statusCode, body, next } = await runMiddleware(
            { headers: { authorization: programmaticToken } },
            middleware
        );

        expect(statusCode).toBe(401);
        expect(body).toEqual({ msg: "Invalid API key" });
        expect(subscriptionGuard.assert).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it("enforces PUBLIC_API and attaches organization on valid OAuth token", async () => {
        const { oauthAppService, organizationRepository, subscriptionGuard } = createMocks();
        oauthAppService.verifyProgrammaticToken.mockResolvedValue({
            organizationId,
            oauthAppId,
            tokenId,
            userId: publicUserId,
        });
        organizationRepository.findOrganizationById.mockResolvedValue({
            organization,
            error: null,
        });

        const middleware = requireProgrammaticAuth({
            oauthAppService: oauthAppService as unknown as OauthAppService,
            organizationRepository: organizationRepository as unknown as OrganizationRepository,
            subscriptionGuard: subscriptionGuard as unknown as SubscriptionGuardService,
        });

        const req = { headers: { authorization: `Bearer ${programmaticToken}` } } as ProgrammaticAuthRequest;
        const { next } = await runMiddleware(req, middleware);

        expect(subscriptionGuard.assert).toHaveBeenCalledWith(SubscriptionSection.PUBLIC_API, {
            scope: "workspace",
            organizationId,
            publicUserId,
        });
        expect(req.organization).toEqual(organization);
        expect(req.oauthApp).toEqual({ id: oauthAppId, tokenId });
        expect(next).toHaveBeenCalledWith();
    });

    it("forwards subscription guard errors to next", async () => {
        const { oauthAppService, organizationRepository, subscriptionGuard } = createMocks();
        const subscriptionError = new SubscriptionError(
            "Public API is not available on your plan.",
            SubscriptionSection.PUBLIC_API,
            "https://app.example.com/account/billing"
        );
        oauthAppService.verifyProgrammaticToken.mockResolvedValue({
            organizationId,
            oauthAppId,
            tokenId,
            userId: publicUserId,
        });
        organizationRepository.findOrganizationById.mockResolvedValue({
            organization,
            error: null,
        });
        subscriptionGuard.assert.mockRejectedValue(subscriptionError);

        const middleware = requireProgrammaticAuth({
            oauthAppService: oauthAppService as unknown as OauthAppService,
            organizationRepository: organizationRepository as unknown as OrganizationRepository,
            subscriptionGuard: subscriptionGuard as unknown as SubscriptionGuardService,
        });

        const next = jest.fn() as NextFunction;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as unknown as Response;

        await middleware(
            { headers: { authorization: `Bearer ${programmaticToken}` } } as Request,
            res,
            next
        );

        expect(next).toHaveBeenCalledWith(subscriptionError);
    });
});
