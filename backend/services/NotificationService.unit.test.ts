/// <reference types="jest" />
import { faker } from "@faker-js/faker";
import { buildNotificationMessageParagraph } from "../emails/notificationTransactionalEmailHtml";
import { OrganizationForbiddenError } from "../errors/OrganizationError";
import { UserNotFoundError } from "../errors/UserError";
import type { NotificationRepository } from "../repositories/NotificationRepository";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import type { UserRepository } from "../repositories/UserRepository";
import { NotificationService } from "./NotificationService";
import type { EmailService } from "./EmailService";
import type { TransactionalNotificationEmailService } from "./TransactionalNotificationEmailService";

jest.mock("../config/GlobalConfig", () => {
    const notificationEmailHolder = { transport: "in_process" as string | undefined };
    return {
        config: {
            bullmq: {
                notificationEmail: {
                    get transport() {
                        return notificationEmailHolder.transport;
                    },
                },
            },
        },
        __notificationEmailTransportHolder: notificationEmailHolder,
    };
});

const notificationEmailTransportHolder = (
    jest.requireMock("../config/GlobalConfig") as { __notificationEmailTransportHolder: { transport: string | undefined } }
).__notificationEmailTransportHolder;

const authUserId = faker.string.uuid();
const userId = faker.string.uuid();
const organizationId = faker.string.uuid();
const sinceIso = faker.date.past().toISOString();

function createMockNotificationRepo(): jest.Mocked<NotificationRepository> {
    return {
        createNotification: jest.fn().mockResolvedValue(undefined),
        countSince: jest.fn(),
        listRecentForOrg: jest.fn(),
        listPaginated: jest.fn(),
    } as unknown as jest.Mocked<NotificationRepository>;
}

function createMockUserRepo(): jest.Mocked<UserRepository> {
    return {
        getLastReadNotifications: jest.fn(),
        advanceLastReadNotifications: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;
}

function createMockOrgRepo(): jest.Mocked<OrganizationRepository> {
    return {
        findUserIdByAuthId: jest.fn(),
        findMembership: jest.fn(),
    } as unknown as jest.Mocked<OrganizationRepository>;
}

function createMockEmailService(options?: { isEnabled?: boolean }): jest.Mocked<Pick<EmailService, "isEnabled" | "sendPlain">> {
    return {
        isEnabled: options?.isEnabled ?? true,
        sendPlain: jest.fn().mockResolvedValue(undefined),
    };
}

function createMockTransactionalEmail(): jest.Mocked<
    Pick<
        TransactionalNotificationEmailService,
        "appendDigestEntry" | "deliverToOrganizationMembers" | "enqueueSendPlainJob"
    >
> {
    return {
        appendDigestEntry: jest.fn().mockResolvedValue(undefined),
        deliverToOrganizationMembers: jest.fn().mockResolvedValue(undefined),
        enqueueSendPlainJob: jest.fn().mockResolvedValue(undefined),
    };
}

function stubActiveMember(orgRepo: jest.Mocked<OrganizationRepository>): void {
    orgRepo.findUserIdByAuthId.mockResolvedValue({ userId, error: null });
    orgRepo.findMembership.mockResolvedValue({
        membership: { disabled: false } as never,
        error: null,
    });
}

describe("NotificationService", () => {
    let notificationRepo: jest.Mocked<NotificationRepository>;
    let userRepo: jest.Mocked<UserRepository>;
    let orgRepo: jest.Mocked<OrganizationRepository>;
    let emailService: jest.Mocked<Pick<EmailService, "isEnabled" | "sendPlain">>;
    let transactionalEmail: jest.Mocked<
        Pick<
            TransactionalNotificationEmailService,
            "appendDigestEntry" | "deliverToOrganizationMembers" | "enqueueSendPlainJob"
        >
    >;

    beforeEach(() => {
        notificationRepo = createMockNotificationRepo();
        userRepo = createMockUserRepo();
        orgRepo = createMockOrgRepo();
        emailService = createMockEmailService();
        transactionalEmail = createMockTransactionalEmail();
        notificationEmailTransportHolder.transport = "in_process";
    });

    function service(): NotificationService {
        return new NotificationService(
            notificationRepo,
            userRepo,
            orgRepo,
            emailService as unknown as EmailService,
            transactionalEmail as unknown as TransactionalNotificationEmailService
        );
    }

    describe("getMainPageCount", () => {
        it("throws UserNotFoundError when auth user has no app user row", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue({ userId: null, error: null });
            await expect(service().getMainPageCount(authUserId, organizationId)).rejects.toThrow(UserNotFoundError);
        });

        it("throws OrganizationForbiddenError when user is not a member", async () => {
            stubActiveMember(orgRepo);
            orgRepo.findMembership.mockResolvedValue({ membership: null, error: null });
            await expect(service().getMainPageCount(authUserId, organizationId)).rejects.toThrow(
                OrganizationForbiddenError
            );
        });

        it("throws OrganizationForbiddenError when membership is disabled", async () => {
            orgRepo.findUserIdByAuthId.mockResolvedValue({ userId, error: null });
            orgRepo.findMembership.mockResolvedValue({
                membership: { disabled: true } as never,
                error: null,
            });
            await expect(service().getMainPageCount(authUserId, organizationId)).rejects.toThrow(
                OrganizationForbiddenError
            );
        });

        it("counts since epoch when user has no last-read row", async () => {
            stubActiveMember(orgRepo);
            userRepo.getLastReadNotifications.mockResolvedValue(null);
            notificationRepo.countSince.mockResolvedValue(3);

            const result = await service().getMainPageCount(authUserId, organizationId);

            expect(result).toEqual({ total: 3 });
            expect(notificationRepo.countSince).toHaveBeenCalledWith(
                organizationId,
                "1970-01-01T00:00:00.000Z"
            );
        });

        it("counts since stored last-read when present", async () => {
            stubActiveMember(orgRepo);
            userRepo.getLastReadNotifications.mockResolvedValue({ lastReadNotifications: sinceIso });
            notificationRepo.countSince.mockResolvedValue(1);

            const result = await service().getMainPageCount(authUserId, organizationId);

            expect(result).toEqual({ total: 1 });
            expect(notificationRepo.countSince).toHaveBeenCalledWith(organizationId, sinceIso);
        });
    });

    describe("getNotificationList", () => {
        it("advances last-read and returns recent notifications", async () => {
            stubActiveMember(orgRepo);
            const previousLastRead = faker.date.past().toISOString();
            const rows = [{ created_at: faker.date.recent().toISOString(), content: faker.lorem.sentence() }];
            userRepo.advanceLastReadNotifications.mockResolvedValue({ previousLastRead });
            notificationRepo.listRecentForOrg.mockResolvedValue(rows);

            const result = await service().getNotificationList(authUserId, organizationId);

            expect(result).toEqual({ lastReadNotifications: previousLastRead, notifications: rows });
            expect(userRepo.advanceLastReadNotifications).toHaveBeenCalledWith(userId);
            expect(notificationRepo.listRecentForOrg).toHaveBeenCalledWith(organizationId, 10);
        });
    });

    describe("getNotificationsPaginated", () => {
        it("returns batch with page and limit 100", async () => {
            stubActiveMember(orgRepo);
            const page = 2;
            const batch = {
                notifications: [],
                total: 0,
                hasMore: false,
            };
            notificationRepo.listPaginated.mockResolvedValue(batch);

            const result = await service().getNotificationsPaginated(authUserId, organizationId, page);

            expect(result).toEqual({ ...batch, page, limit: 100 });
            expect(notificationRepo.listPaginated).toHaveBeenCalledWith(organizationId, page, 100);
        });
    });

    describe("inAppNotification", () => {
        const subject = faker.lorem.words(3);
        const message = faker.lorem.paragraph();

        it("always persists notification content", async () => {
            await service().inAppNotification(organizationId, subject, message, false);
            expect(notificationRepo.createNotification).toHaveBeenCalledWith(organizationId, message);
            expect(transactionalEmail.appendDigestEntry).not.toHaveBeenCalled();
            expect(transactionalEmail.deliverToOrganizationMembers).not.toHaveBeenCalled();
        });

        it("skips email when sendEmail is false", async () => {
            await service().inAppNotification(organizationId, subject, message, false, false, "info");
            expect(emailService.sendPlain).not.toHaveBeenCalled();
            expect(transactionalEmail.appendDigestEntry).not.toHaveBeenCalled();
        });

        it("skips email when sendEmail is true but email is disabled", async () => {
            emailService = createMockEmailService({ isEnabled: false });
            await service().inAppNotification(organizationId, subject, message, true);
            expect(transactionalEmail.deliverToOrganizationMembers).not.toHaveBeenCalled();
            expect(transactionalEmail.appendDigestEntry).not.toHaveBeenCalled();
        });

        it("appends digest entry when digest is true", async () => {
            await service().inAppNotification(organizationId, subject, message, true, true, "fail");
            expect(notificationRepo.createNotification).toHaveBeenCalledWith(organizationId, message);
            expect(transactionalEmail.appendDigestEntry).toHaveBeenCalledWith(organizationId, {
                subject,
                message,
                type: "fail",
            });
            expect(transactionalEmail.deliverToOrganizationMembers).not.toHaveBeenCalled();
        });

        it("delivers immediate mail in-process via EmailService.sendPlain", async () => {
            transactionalEmail.deliverToOrganizationMembers.mockImplementation(async ({ deliver }) => {
                await deliver("member@example.com", subject, "<html>doc</html>");
            });

            await service().inAppNotification(organizationId, subject, message, true, false, "success");

            expect(transactionalEmail.deliverToOrganizationMembers).toHaveBeenCalledWith(
                expect.objectContaining({
                    organizationId,
                    subject,
                    htmlBodyInner: buildNotificationMessageParagraph(message),
                    type: "success",
                })
            );
            expect(emailService.sendPlain).toHaveBeenCalledWith({
                to: "member@example.com",
                subject,
                html: "<html>doc</html>",
            });
            expect(transactionalEmail.enqueueSendPlainJob).not.toHaveBeenCalled();
        });

        it("enqueues send-plain job when transport is bullmq", async () => {
            notificationEmailTransportHolder.transport = "bullmq";
            transactionalEmail.deliverToOrganizationMembers.mockImplementation(async ({ deliver }) => {
                await deliver("queue@example.com", subject, "<html>q</html>");
            });

            await service().inAppNotification(organizationId, subject, message, true);

            expect(transactionalEmail.enqueueSendPlainJob).toHaveBeenCalledWith({
                to: "queue@example.com",
                subject,
                html: "<html>q</html>",
            });
            expect(emailService.sendPlain).not.toHaveBeenCalled();
        });

        it("swallows errors from deliverToOrganizationMembers after row is created", async () => {
            transactionalEmail.deliverToOrganizationMembers.mockRejectedValue(new Error("smtp down"));

            await expect(
                service().inAppNotification(organizationId, subject, message, true, false, "info")
            ).resolves.toBeUndefined();

            expect(notificationRepo.createNotification).toHaveBeenCalledWith(organizationId, message);
        });
    });
});
