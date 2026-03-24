import { OrganizationService } from "./OrganizationService";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { UserRepository } from "../repositories/UserRepository";
import { signInviteToken, verifyInviteToken } from "../utils/inviteToken";
import { faker } from "@faker-js/faker";

jest.mock("../config/GlobalConfig", () => ({
    config: {
        auth: { inviteTokenSecret: "test-invite-secret" },
        server: { frontendDomainUrl: "https://app.example.com" },
    },
}));

faker.seed(12345);
const authUserId = faker.string.uuid();
const userId = faker.string.uuid();
const orgId = faker.string.uuid();
const orgName = faker.company.name();
const orgDescription = faker.lorem.sentence();
const orgCreatedAt = faker.date.past().toISOString();
const orgUpdatedAt = faker.date.past().toISOString();
const membershipId = faker.string.uuid();
const otherUserId = faker.string.uuid();
const secondMembershipId = faker.string.uuid();
const inviteId = faker.string.uuid();
const inviteId2 = faker.string.uuid();
const orgId2 = faker.string.uuid();
const otherOrgName = faker.company.name();
const expiresAt = faker.date.future().toISOString();
const futureExpiry = faker.date.future().toISOString();
const invitedByUserId = faker.string.uuid();
const userEmail = faker.internet.email();
const inviteeEmail = faker.internet.email();
const joinerEmail = faker.internet.email();
const existingMemberEmail = faker.internet.email();
const invitedEmail = faker.internet.email();
const otherEmail = faker.internet.email();
const validateTokenEmail = faker.internet.email();
const newMemberEmail = faker.internet.email();
const newMemberName = faker.person.fullName();
const pastExpiry = faker.date.past().toISOString();
const apiKeyRotated = faker.string.alphanumeric(12);
const acceptInviteId = faker.string.uuid();

const orgRow = {
    id: orgId,
    name: orgName,
    description: orgDescription,
    api_key: null,
    created_at: orgCreatedAt,
    updated_at: orgUpdatedAt,
};
const membershipRow = {
    id: membershipId,
    user_id: userId,
    organization_id: orgId,
    role: "admin",
    disabled: false,
    created_at: orgCreatedAt,
    updated_at: orgUpdatedAt,
};

function createMockOrgRepo(): jest.Mocked<OrganizationRepository> {
    return {
        findUserIdByAuthId: jest.fn(),
        findOrganizationsByUserId: jest.fn(),
        getMemberCounts: jest.fn(),
        findOrganizationById: jest.fn(),
        findMembership: jest.fn(),
        createOrganization: jest.fn(),
        addMember: jest.fn(),
        updateOrganization: jest.fn(),
        getTeam: jest.fn(),
        removeMember: jest.fn(),
        deleteOrganization: jest.fn(),
        rotateApiKey: jest.fn(),
        insertInvite: jest.fn(),
        findPendingInvitesByEmail: jest.fn(),
        findInviteById: jest.fn(),
        deleteInvite: jest.fn(),
        deleteInvitesByEmailAndOrganization: jest.fn(),
    } as unknown as jest.Mocked<OrganizationRepository>;
}

function createMockUserRepo(): jest.Mocked<UserRepository> {
    return {
        findFullUserByUserId: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
}

describe("OrganizationService", () => {
    let orgRepo: jest.Mocked<OrganizationRepository>;
    let userRepo: jest.Mocked<UserRepository>;

    beforeEach(() => {
        orgRepo = createMockOrgRepo();
        userRepo = createMockUserRepo();
        (orgRepo.findUserIdByAuthId as jest.Mock).mockResolvedValue({ userId, error: null });
    });

    describe("listMyOrganizations", () => {
        it("returns organizations with role for the user when no cache", async () => {
            (orgRepo.findOrganizationsByUserId as jest.Mock).mockResolvedValue({
                organizations: [orgRow],
                memberships: [{ organizationId: orgId, role: "admin", disabled: false }],
                error: null,
            });
            (orgRepo.getMemberCounts as jest.Mock).mockResolvedValue({ [orgId]: 1 });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.listMyOrganizations(authUserId);
            expect(result.organizations).toHaveLength(1);
            expect(result.organizations[0]).toMatchObject(orgRow);
            expect(result.memberships[0]).toMatchObject({
                organizationId: orgId,
                role: "admin",
                disabled: false,
            });
            expect(result.memberCounts[orgId]).toBe(1);
        });

        it("uses cache when provided", async () => {
            const cached = {
                organizations: [orgRow],
                memberships: [{ organizationId: orgId, role: "admin", disabled: false }],
                memberCounts: { [orgId]: 1 },
            };
            const getOrSet = jest.fn().mockResolvedValue(cached);
            const service = new OrganizationService(orgRepo, userRepo, undefined, { getOrSet } as never);
            const result = await service.listMyOrganizations(authUserId);
            expect(result).toEqual(cached);
            expect(getOrSet).toHaveBeenCalledWith(
                `org:list:byUserId:${authUserId}`,
                expect.any(Function),
                300
            );
            expect(orgRepo.findOrganizationsByUserId).not.toHaveBeenCalled();
        });

        it("calls repository when cache misses", async () => {
            (orgRepo.findOrganizationsByUserId as jest.Mock).mockResolvedValue({
                organizations: [orgRow],
                memberships: [{ organizationId: orgId, role: "admin", disabled: false }],
                error: null,
            });
            (orgRepo.getMemberCounts as jest.Mock).mockResolvedValue({ [orgId]: 1 });
            const getOrSet = jest.fn().mockImplementation(async (_key: string, factory: () => Promise<unknown>) => factory());
            const service = new OrganizationService(orgRepo, userRepo, undefined, { getOrSet } as never);
            const result = await service.listMyOrganizations(authUserId);
            expect(result.organizations).toHaveLength(1);
            expect(getOrSet).toHaveBeenCalledWith(
                `org:list:byUserId:${authUserId}`,
                expect.any(Function),
                300
            );
            expect(orgRepo.findOrganizationsByUserId).toHaveBeenCalled();
        });

        it("throws UserNotFoundError when auth user has no profile", async () => {
            (orgRepo.findUserIdByAuthId as jest.Mock).mockResolvedValue({ userId: null, error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            await expect(service.listMyOrganizations(authUserId)).rejects.toThrow(/User not found/);
        });
    });

    describe("getOrganizationById", () => {
        it("returns organization when user is member and no cache", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "user" },
                error: null,
            });
            (orgRepo.findOrganizationById as jest.Mock).mockResolvedValue({
                organization: orgRow,
                error: null,
            });
            (orgRepo.getMemberCounts as jest.Mock).mockResolvedValue({ [orgId]: 1 });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.getOrganizationById(authUserId, orgId);
            expect(result).not.toBeNull();
            expect(result!.organization).toMatchObject(orgRow);
            expect(result!.membership).toMatchObject({ role: "user", disabled: false });
            expect(result!.memberCount).toBe(1);
        });

        it("uses cache when provided", async () => {
            const cached = {
                organization: orgRow,
                membership: { role: "user", disabled: false },
                memberCount: 1,
            };
            const getOrSet = jest.fn().mockResolvedValue(cached);
            const service = new OrganizationService(orgRepo, userRepo, undefined, { getOrSet } as never);
            const result = await service.getOrganizationById(authUserId, orgId);
            expect(result).toEqual(cached);
            expect(getOrSet).toHaveBeenCalledWith(
                `org:byIds:${authUserId}:${orgId}`,
                expect.any(Function),
                300
            );
            expect(orgRepo.findOrganizationById).not.toHaveBeenCalled();
        });

        it("calls repository when cache misses", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "user" },
                error: null,
            });
            (orgRepo.findOrganizationById as jest.Mock).mockResolvedValue({
                organization: orgRow,
                error: null,
            });
            (orgRepo.getMemberCounts as jest.Mock).mockResolvedValue({ [orgId]: 1 });
            const getOrSet = jest.fn().mockImplementation(async (_key: string, factory: () => Promise<unknown>) => factory());
            const service = new OrganizationService(orgRepo, userRepo, undefined, { getOrSet } as never);
            const result = await service.getOrganizationById(authUserId, orgId);
            expect(result).not.toBeNull();
            expect(getOrSet).toHaveBeenCalledWith(
                `org:byIds:${authUserId}:${orgId}`,
                expect.any(Function),
                300
            );
            expect(orgRepo.findOrganizationById).toHaveBeenCalled();
        });

        it("returns null when user is not a member", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({ membership: null, error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.getOrganizationById(authUserId, orgId);
            expect(result).toBeNull();
        });
    });

    describe("createOrganization", () => {
        it("creates org and adds current user as superadmin", async () => {
            (orgRepo.createOrganization as jest.Mock).mockResolvedValue({
                organization: orgRow,
                error: null,
            });
            (orgRepo.addMember as jest.Mock).mockResolvedValue({ membership: membershipRow, error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.createOrganization(authUserId, {
                name: orgName,
                description: orgDescription,
            });
            expect(result.id).toBe(orgId);
            expect(result.name).toBe(orgName);
            expect(orgRepo.addMember).toHaveBeenCalledWith({
                userId,
                organizationId: orgId,
                role: "superadmin",
            });
        });

        it("invalidates cache after create", async () => {
            (orgRepo.createOrganization as jest.Mock).mockResolvedValue({
                organization: orgRow,
                error: null,
            });
            (orgRepo.addMember as jest.Mock).mockResolvedValue({ membership: membershipRow, error: null });
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new OrganizationService(orgRepo, userRepo, undefined, undefined, {
                invalidateKey,
                invalidatePattern,
            } as never);
            await service.createOrganization(authUserId, { name: orgName, description: orgDescription });
            expect(invalidateKey).toHaveBeenCalledWith(`org:list:byUserId:${authUserId}`);
        });
    });

    describe("createDefaultOrganizationForNewUser", () => {
        it("creates org with given name and returns row", async () => {
            const inputName = faker.company.name();
            (orgRepo.createOrganization as jest.Mock).mockResolvedValue({
                organization: orgRow,
                error: null,
            });
            (orgRepo.addMember as jest.Mock).mockResolvedValue({ membership: membershipRow, error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.createDefaultOrganizationForNewUser(authUserId, { name: inputName });
            expect(result).not.toBeNull();
            expect(result!.name).toBe(orgName);
            expect(orgRepo.createOrganization).toHaveBeenCalledWith({ name: inputName, description: null });
        });

        it("uses default name when name is empty", async () => {
            (orgRepo.createOrganization as jest.Mock).mockResolvedValue({
                organization: orgRow,
                error: null,
            });
            (orgRepo.addMember as jest.Mock).mockResolvedValue({ membership: membershipRow, error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            await service.createDefaultOrganizationForNewUser(authUserId);
            expect(orgRepo.createOrganization).toHaveBeenCalledWith({ name: "My Organization", description: null });
        });

        it("returns null when createOrganization throws", async () => {
            (orgRepo.createOrganization as jest.Mock).mockRejectedValue(new Error("DB error"));
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.createDefaultOrganizationForNewUser(authUserId, { name: orgName });
            expect(result).toBeNull();
        });
    });

    describe("updateOrganization", () => {
        it("updates when user is admin", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "admin" },
                error: null,
            });
            const updatedName = faker.company.name();
            (orgRepo.updateOrganization as jest.Mock).mockResolvedValue({
                organization: { ...orgRow, name: updatedName },
                error: null,
            });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.updateOrganization(authUserId, orgId, { name: updatedName });
            expect(result.name).toBe(updatedName);
        });

        it("throws OrganizationForbiddenError when user is not admin", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "user" },
                error: null,
            });
            const service = new OrganizationService(orgRepo, userRepo);
            await expect(
                service.updateOrganization(authUserId, orgId, { name: "X" })
            ).rejects.toThrow(/Only admins can update/);
        });

        it("invalidates cache after update", async () => {
            const updatedName = faker.company.name();
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "admin" },
                error: null,
            });
            (orgRepo.updateOrganization as jest.Mock).mockResolvedValue({
                organization: { ...orgRow, name: updatedName },
                error: null,
            });
            const invalidateKey = jest.fn().mockResolvedValue(undefined);
            const invalidatePattern = jest.fn().mockResolvedValue(undefined);
            const service = new OrganizationService(orgRepo, userRepo, undefined, undefined, {
                invalidateKey,
                invalidatePattern,
            } as never);
            await service.updateOrganization(authUserId, orgId, { name: updatedName });
            expect(invalidateKey).toHaveBeenCalledWith(`org:list:byUserId:${authUserId}`);
            expect(invalidateKey).toHaveBeenCalledWith(`org:byIds:${authUserId}:${orgId}`);
            expect(invalidatePattern).toHaveBeenCalledWith(`org:byIds:*:${orgId}`);
        });
    });

    describe("getTeam", () => {
        it("returns team members when user is member", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: membershipRow,
                error: null,
            });
            (orgRepo.getTeam as jest.Mock).mockResolvedValue({
                members: [
                    {
                        ...membershipRow,
                        email: faker.internet.email(),
                        full_name: faker.person.fullName(),
                    },
                ],
                error: null,
            });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.getTeam(authUserId, orgId);
            expect(result).toHaveLength(1);
            expect(result[0].email).toBeDefined();
            expect(result[0].role).toBe("admin");
        });

        it("throws OrganizationNotFoundError when user is not member", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({ membership: null, error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            await expect(service.getTeam(authUserId, orgId)).rejects.toThrow(/Organization not found/);
        });
    });

    describe("addTeamMember", () => {
        it("adds member when caller is admin", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "admin" },
                error: null,
            });
            (orgRepo.findOrganizationById as jest.Mock).mockResolvedValue({
                organization: orgRow,
                error: null,
            });
            (orgRepo.addMember as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, id: secondMembershipId, user_id: otherUserId, role: "user" },
                error: null,
            });
            (orgRepo.getTeam as jest.Mock).mockResolvedValue({
                members: [
                    { ...membershipRow, user_id: otherUserId, email: newMemberEmail, full_name: newMemberName, role: "user" },
                ],
                error: null,
            });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.addTeamMember(authUserId, orgId, {
                userId: otherUserId,
                workspaceRole: "user",
            });
            expect(result.user_id).toBe(otherUserId);
            expect(result.role).toBe("user");
        });

        it("throws OrganizationForbiddenError when caller is user role", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "user" },
                error: null,
            });
            const service = new OrganizationService(orgRepo, userRepo);
            await expect(
                service.addTeamMember(authUserId, orgId, { userId: otherUserId, workspaceRole: "user" })
            ).rejects.toThrow(/Only admins can add team members/);
        });
    });

    describe("removeTeamMember", () => {
        it("allows self-remove", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "user" },
                error: null,
            });
            (orgRepo.removeMember as jest.Mock).mockResolvedValue({ error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            await service.removeTeamMember(authUserId, orgId, userId);
            expect(orgRepo.removeMember).toHaveBeenCalledWith(userId, orgId);
        });

        it("allows admin to remove lower-role member", async () => {
            (orgRepo.findMembership as jest.Mock)
                .mockResolvedValueOnce({
                    membership: { ...membershipRow, role: "admin" },
                    error: null,
                })
                .mockResolvedValueOnce({
                    membership: { ...membershipRow, user_id: otherUserId, role: "user" },
                    error: null,
                });
            (orgRepo.removeMember as jest.Mock).mockResolvedValue({ error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            await service.removeTeamMember(authUserId, orgId, otherUserId);
            expect(orgRepo.removeMember).toHaveBeenCalledWith(otherUserId, orgId);
        });

        it("throws OrganizationForbiddenError when removing equal or higher role", async () => {
            (orgRepo.findMembership as jest.Mock)
                .mockResolvedValueOnce({
                    membership: { ...membershipRow, role: "admin" },
                    error: null,
                })
                .mockResolvedValueOnce({
                    membership: { ...membershipRow, user_id: otherUserId, role: "superadmin" },
                    error: null,
                });
            const service = new OrganizationService(orgRepo, userRepo);
            await expect(
                service.removeTeamMember(authUserId, orgId, otherUserId)
            ).rejects.toThrow(/cannot remove a member with equal or higher role/);
        });
    });

    describe("deleteOrganization", () => {
        it("deletes when user is superadmin", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "superadmin" },
                error: null,
            });
            (orgRepo.deleteOrganization as jest.Mock).mockResolvedValue({ error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            await service.deleteOrganization(authUserId, orgId);
            expect(orgRepo.deleteOrganization).toHaveBeenCalledWith(orgId);
        });

        it("throws OrganizationForbiddenError when user is not superadmin", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "admin" },
                error: null,
            });
            const service = new OrganizationService(orgRepo, userRepo);
            await expect(service.deleteOrganization(authUserId, orgId)).rejects.toThrow(
                /Only the organization superadmin can delete it/
            );
        });
    });

    describe("rotateApiKey", () => {
        it("returns updated org when admin", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "admin" },
                error: null,
            });
            (orgRepo.rotateApiKey as jest.Mock).mockResolvedValue({
                organization: { ...orgRow, api_key: apiKeyRotated },
                error: null,
            });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.rotateApiKey(authUserId, orgId);
            expect(result.api_key).toBe(apiKeyRotated);
        });
    });

    describe("inviteTeamMemberByEmail", () => {
        it("returns invite url and expiresAt when admin", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "admin" },
                error: null,
            });
            (orgRepo.findOrganizationById as jest.Mock).mockResolvedValue({
                organization: orgRow,
                error: null,
            });
            (orgRepo.insertInvite as jest.Mock).mockResolvedValue({
                invite: { id: inviteId, email: inviteeEmail, organization_id: orgId, role: "user", expires_at: "" },
                error: null,
            });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.inviteTeamMemberByEmail(authUserId, orgId, {
                email: inviteeEmail,
                workspaceRole: "user",
                sendEmail: false,
            });
            expect(result.url).toContain("https://app.example.com/join-org?token=");
            expect(result.expiresAt).toBeDefined();
            const token = new URL(result.url).searchParams.get("token");
            expect(token).toBeTruthy();
            const payload = verifyInviteToken(token!, "test-invite-secret");
            expect(payload).not.toBeNull();
            expect(payload!.email).toBe(inviteeEmail);
            expect(payload!.organizationId).toBe(orgId);
            expect(payload!.workspaceRole).toBe("user");
            expect(orgRepo.insertInvite).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: inviteeEmail,
                    organizationId: orgId,
                    role: "user",
                    invitedByUserId: userId,
                })
            );
            expect((orgRepo.insertInvite as jest.Mock).mock.calls[0][0].expiresAt).toBeDefined();
        });

        it("throws OrganizationForbiddenError when caller is user role", async () => {
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "user" },
                error: null,
            });
            const service = new OrganizationService(orgRepo, userRepo);
            await expect(
                service.inviteTeamMemberByEmail(authUserId, orgId, {
                    email: validateTokenEmail,
                    workspaceRole: "user",
                    sendEmail: false,
                })
            ).rejects.toThrow(/Only admins can invite team members/);
        });
    });

    describe("joinOrganizationByToken", () => {
        it("adds user to org when token valid and email matches", async () => {
            const token = signInviteToken(
                { email: joinerEmail, organizationId: orgId, workspaceRole: "user" },
                "test-invite-secret"
            );
            (userRepo.findFullUserByUserId as jest.Mock).mockResolvedValue({
                userData: { id: userId, email: joinerEmail, full_name: faker.person.fullName() },
            });
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({ membership: null, error: null });
            (orgRepo.addMember as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "user" },
                error: null,
            });
            (orgRepo.deleteInvitesByEmailAndOrganization as jest.Mock).mockResolvedValue({ error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.joinOrganizationByToken(authUserId, token);
            expect(result.organizationId).toBe(orgId);
            expect(result.workspaceRole).toBe("user");
            expect(orgRepo.addMember).toHaveBeenCalledWith({
                userId,
                organizationId: orgId,
                role: "user",
            });
            expect(orgRepo.deleteInvitesByEmailAndOrganization).toHaveBeenCalledWith(
                joinerEmail,
                orgId
            );
        });

        it("returns existing membership when already member", async () => {
            const token = signInviteToken(
                { email: existingMemberEmail, organizationId: orgId, workspaceRole: "admin" },
                "test-invite-secret"
            );
            (userRepo.findFullUserByUserId as jest.Mock).mockResolvedValue({
                userData: { id: userId, email: existingMemberEmail },
            });
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "admin" },
                error: null,
            });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.joinOrganizationByToken(authUserId, token);
            expect(result.organizationId).toBe(orgId);
            expect(result.workspaceRole).toBe("admin");
            expect(orgRepo.addMember).not.toHaveBeenCalled();
            expect(orgRepo.deleteInvitesByEmailAndOrganization).not.toHaveBeenCalled();
        });

        it("throws OrganizationForbiddenError when token invalid", async () => {
            const service = new OrganizationService(orgRepo, userRepo);
            await expect(service.joinOrganizationByToken(authUserId, "bad-token")).rejects.toThrow(
                /Invalid or expired invite token/
            );
        });

        it("throws OrganizationForbiddenError when email does not match", async () => {
            const token = signInviteToken(
                { email: invitedEmail, organizationId: orgId, workspaceRole: "user" },
                "test-invite-secret"
            );
            (userRepo.findFullUserByUserId as jest.Mock).mockResolvedValue({
                userData: { id: userId, email: otherEmail },
            });
            const service = new OrganizationService(orgRepo, userRepo);
            await expect(service.joinOrganizationByToken(authUserId, token)).rejects.toThrow(
                /different email/
            );
        });
    });

    describe("validateInviteToken", () => {
        it("returns organizationName and role for valid token", async () => {
            const token = signInviteToken(
                { email: validateTokenEmail, organizationId: orgId, workspaceRole: "admin" },
                "test-invite-secret"
            );
            (orgRepo.findOrganizationById as jest.Mock).mockResolvedValue({
                organization: orgRow,
                error: null,
            });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.validateInviteToken(token);
            expect(result).not.toBeNull();
            expect(result!.organizationName).toBe(orgName);
            expect(result!.workspaceRole).toBe("admin");
        });

        it("returns null for invalid token", async () => {
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.validateInviteToken("invalid");
            expect(result).toBeNull();
        });

        it("returns null when org no longer exists", async () => {
            const token = signInviteToken(
                { email: validateTokenEmail, organizationId: orgId, workspaceRole: "user" },
                "test-invite-secret"
            );
            (orgRepo.findOrganizationById as jest.Mock).mockResolvedValue({
                organization: null,
                error: null,
            });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.validateInviteToken(token);
            expect(result).toBeNull();
        });
    });

    describe("listPendingInvitesForUser", () => {
        it("returns pending invites for user email excluding orgs already member of", async () => {
            (userRepo.findFullUserByUserId as jest.Mock).mockResolvedValue({
                userData: { id: userId, email: userEmail, full_name: faker.person.fullName() },
            });
            (orgRepo.findPendingInvitesByEmail as jest.Mock).mockResolvedValue({
                invites: [
                    {
                        id: inviteId,
                        email: userEmail,
                        organization_id: orgId,
                        role: "user",
                        organization_name: orgName,
                        expires_at: expiresAt,
                    },
                    {
                        id: inviteId2,
                        email: userEmail,
                        organization_id: orgId2,
                        role: "admin",
                        organization_name: otherOrgName,
                        expires_at: expiresAt,
                    },
                ],
                error: null,
            });
            (orgRepo.findMembership as jest.Mock)
                .mockResolvedValueOnce({ membership: null, error: null })
                .mockResolvedValueOnce({ membership: { organizationId: orgId2, role: "admin", disabled: false }, error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.listPendingInvitesForUser(authUserId);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(inviteId);
            expect(result[0].organization_id).toBe(orgId);
            expect(result[0].organization_name).toBe(orgName);
            expect(result[0].role).toBe("user");
        });

        it("returns empty array when user has no email", async () => {
            (userRepo.findFullUserByUserId as jest.Mock).mockResolvedValue({
                userData: { id: userId, email: null, full_name: faker.person.fullName() },
            });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.listPendingInvitesForUser(authUserId);
            expect(result).toEqual([]);
            expect(orgRepo.findPendingInvitesByEmail).not.toHaveBeenCalled();
        });

        it("returns empty array when no pending invites", async () => {
            (userRepo.findFullUserByUserId as jest.Mock).mockResolvedValue({
                userData: { id: userId, email: userEmail, full_name: faker.person.fullName() },
            });
            (orgRepo.findPendingInvitesByEmail as jest.Mock).mockResolvedValue({ invites: [], error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.listPendingInvitesForUser(authUserId);
            expect(result).toEqual([]);
        });
    });

    describe("acceptPendingInvite", () => {
        const inviteRow = {
            id: acceptInviteId,
            email: userEmail,
            organization_id: orgId,
            role: "user",
            invited_by_user_id: invitedByUserId,
            created_at: orgCreatedAt,
            expires_at: futureExpiry,
        };

        it("adds user to org and deletes invite when valid", async () => {
            (userRepo.findFullUserByUserId as jest.Mock).mockResolvedValue({
                userData: { id: userId, email: userEmail, full_name: faker.person.fullName() },
            });
            (orgRepo.findInviteById as jest.Mock).mockResolvedValue({ invite: inviteRow, error: null });
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({ membership: null, error: null });
            (orgRepo.addMember as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "user" },
                error: null,
            });
            (orgRepo.deleteInvite as jest.Mock).mockResolvedValue({ error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.acceptPendingInvite(authUserId, acceptInviteId);
            expect(result.organizationId).toBe(orgId);
            expect(result.workspaceRole).toBe("user");
            expect(orgRepo.addMember).toHaveBeenCalledWith({
                userId,
                organizationId: orgId,
                role: "user",
            });
            expect(orgRepo.deleteInvite).toHaveBeenCalledWith(acceptInviteId);
        });

        it("throws when invite not found", async () => {
            (userRepo.findFullUserByUserId as jest.Mock).mockResolvedValue({
                userData: { id: userId, email: userEmail },
            });
            (orgRepo.findInviteById as jest.Mock).mockResolvedValue({ invite: null, error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            await expect(service.acceptPendingInvite(authUserId, acceptInviteId)).rejects.toThrow(
                /Invite not found or already used/
            );
            expect(orgRepo.addMember).not.toHaveBeenCalled();
        });

        it("throws when email does not match", async () => {
            (userRepo.findFullUserByUserId as jest.Mock).mockResolvedValue({
                userData: { id: userId, email: otherEmail },
            });
            (orgRepo.findInviteById as jest.Mock).mockResolvedValue({ invite: inviteRow, error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            await expect(service.acceptPendingInvite(authUserId, acceptInviteId)).rejects.toThrow(
                /different email/
            );
            expect(orgRepo.addMember).not.toHaveBeenCalled();
        });

        it("throws when invite expired", async () => {
            (userRepo.findFullUserByUserId as jest.Mock).mockResolvedValue({
                userData: { id: userId, email: userEmail },
            });
            (orgRepo.findInviteById as jest.Mock).mockResolvedValue({
                invite: { ...inviteRow, expires_at: pastExpiry },
                error: null,
            });
            const service = new OrganizationService(orgRepo, userRepo);
            await expect(service.acceptPendingInvite(authUserId, acceptInviteId)).rejects.toThrow(
                /expired/
            );
            expect(orgRepo.addMember).not.toHaveBeenCalled();
        });

        it("returns existing membership and deletes invite when already member", async () => {
            (userRepo.findFullUserByUserId as jest.Mock).mockResolvedValue({
                userData: { id: userId, email: userEmail },
            });
            (orgRepo.findInviteById as jest.Mock).mockResolvedValue({ invite: inviteRow, error: null });
            (orgRepo.findMembership as jest.Mock).mockResolvedValue({
                membership: { ...membershipRow, role: "user" },
                error: null,
            });
            (orgRepo.deleteInvite as jest.Mock).mockResolvedValue({ error: null });
            const service = new OrganizationService(orgRepo, userRepo);
            const result = await service.acceptPendingInvite(authUserId, acceptInviteId);
            expect(result.organizationId).toBe(orgId);
            expect(result.workspaceRole).toBe("user");
            expect(orgRepo.addMember).not.toHaveBeenCalled();
            expect(orgRepo.deleteInvite).toHaveBeenCalledWith(acceptInviteId);
        });
    });
});
