/// <reference types="jest" />
import { faker } from "@faker-js/faker";
import { InternalOpsEmailService } from "./InternalOpsEmailService";
import type { CompanyService } from "./CompanyService";
import type { EmailService } from "./EmailService";
import type { TransactionalNotificationEmailService } from "./TransactionalNotificationEmailService";

jest.mock("../config/GlobalConfig", () => {
    const opsHolder = { alertEmail: "" };
    const notificationEmailHolder = { transport: "in_process" as string };
    return {
        config: {
            ops: {
                get alertEmail() {
                    return opsHolder.alertEmail;
                },
            },
            bullmq: {
                notificationEmail: {
                    get transport() {
                        return notificationEmailHolder.transport;
                    },
                },
            },
        },
        __opsHolder: opsHolder,
        __notificationEmailTransportHolder: notificationEmailHolder,
    };
});

const opsHolder = (
    jest.requireMock("../config/GlobalConfig") as { __opsHolder: { alertEmail: string } }
).__opsHolder;
const notificationEmailTransportHolder = (
    jest.requireMock("../config/GlobalConfig") as {
        __notificationEmailTransportHolder: { transport: string };
    }
).__notificationEmailTransportHolder;

const userId = faker.string.uuid();

function createMockEmailService(options?: { isEnabled?: boolean }): jest.Mocked<
    Pick<EmailService, "isEnabled" | "sendPlain">
> {
    return {
        isEnabled: options?.isEnabled ?? true,
        sendPlain: jest.fn().mockResolvedValue(undefined),
    };
}

function createMockCompanyService(
    supportEmail?: string
): jest.Mocked<Pick<CompanyService, "getCompanyInformationByProperties">> {
    return {
        getCompanyInformationByProperties: jest
            .fn()
            .mockResolvedValue({ SUPPORT_EMAIL: supportEmail ?? "" }),
    };
}

function createMockTransactionalEmail(): jest.Mocked<
    Pick<TransactionalNotificationEmailService, "enqueueSendPlainJob">
> {
    return {
        enqueueSendPlainJob: jest.fn().mockResolvedValue(undefined),
    };
}

async function flushAsyncOps(): Promise<void> {
    await new Promise<void>((resolve) => setImmediate(resolve));
}

describe("InternalOpsEmailService", () => {
    let emailService: jest.Mocked<Pick<EmailService, "isEnabled" | "sendPlain">>;
    let companyService: jest.Mocked<Pick<CompanyService, "getCompanyInformationByProperties">>;
    let transactionalEmail: jest.Mocked<Pick<TransactionalNotificationEmailService, "enqueueSendPlainJob">>;

    beforeEach(() => {
        emailService = createMockEmailService();
        companyService = createMockCompanyService();
        transactionalEmail = createMockTransactionalEmail();
        opsHolder.alertEmail = "";
        notificationEmailTransportHolder.transport = "in_process";
    });

    function service(): InternalOpsEmailService {
        return new InternalOpsEmailService(
            emailService as unknown as EmailService,
            companyService as unknown as CompanyService,
            transactionalEmail as unknown as TransactionalNotificationEmailService
        );
    }

    describe("recipient resolution", () => {
        it("uses OPS_ALERT_EMAIL override when configured", async () => {
            opsHolder.alertEmail = "ops-a@example.com, ops-b@example.com";

            service().notifyFeedbackCreated({
                feedbackType: "report",
                url: "https://app.example.com",
                description: "Something broke",
            });
            await flushAsyncOps();

            expect(companyService.getCompanyInformationByProperties).not.toHaveBeenCalled();
            expect(emailService.sendPlain).toHaveBeenCalledTimes(2);
            expect(emailService.sendPlain).toHaveBeenCalledWith(
                expect.objectContaining({ to: "ops-a@example.com" })
            );
            expect(emailService.sendPlain).toHaveBeenCalledWith(
                expect.objectContaining({ to: "ops-b@example.com" })
            );
        });

        it("falls back to company SUPPORT_EMAIL when override is empty", async () => {
            companyService = createMockCompanyService("support@company.example.com");

            service().notifyFeedbackCreated({
                feedbackType: "propose",
                url: "https://app.example.com",
                description: "Feature idea",
            });
            await flushAsyncOps();

            expect(companyService.getCompanyInformationByProperties).toHaveBeenCalledWith([
                "SUPPORT_EMAIL",
            ]);
            expect(emailService.sendPlain).toHaveBeenCalledWith(
                expect.objectContaining({ to: "support@company.example.com" })
            );
        });

        it("falls back to default support email when company config is empty", async () => {
            service().notifyAcquisitionSurveySubmitted({
                userId,
                source: "reddit",
                skipped: false,
            });
            await flushAsyncOps();

            expect(emailService.sendPlain).toHaveBeenCalledWith(
                expect.objectContaining({ to: "admin@openquok.com" })
            );
        });
    });

    describe("send behavior", () => {
        it("skips sending when email is disabled", async () => {
            emailService = createMockEmailService({ isEnabled: false });

            service().notifyFeedbackCreated({
                feedbackType: "report",
                url: "https://app.example.com",
                description: "No mail",
            });
            await flushAsyncOps();

            expect(emailService.sendPlain).not.toHaveBeenCalled();
            expect(transactionalEmail.enqueueSendPlainJob).not.toHaveBeenCalled();
        });

        it("enqueues bullmq jobs when transport is bullmq", async () => {
            opsHolder.alertEmail = "ops@example.com";
            notificationEmailTransportHolder.transport = "bullmq";

            service().notifyAcquisitionSurveySubmitted({
                userEmail: "user@example.com",
                userId,
                source: "youtube",
                skipped: false,
            });
            await flushAsyncOps();

            expect(transactionalEmail.enqueueSendPlainJob).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: "ops@example.com",
                    subject: "OpenQuok: acquisition survey",
                    replyTo: "user@example.com",
                })
            );
            expect(emailService.sendPlain).not.toHaveBeenCalled();
        });

        it("does not throw when email delivery fails (best-effort)", async () => {
            opsHolder.alertEmail = "ops@example.com";
            emailService.sendPlain.mockRejectedValue(new Error("smtp down"));

            expect(() =>
                service().notifyFeedbackCreated({
                    feedbackType: "report",
                    url: "https://app.example.com",
                    description: "Still saved",
                    email: "reporter@example.com",
                })
            ).not.toThrow();

            await flushAsyncOps();

            expect(emailService.sendPlain).toHaveBeenCalled();
        });
    });

    describe("community submission alerts", () => {
        beforeEach(() => {
            opsHolder.alertEmail = "ops@example.com";
        });

        it("notifyLinkDirectorySubmissionCreated sends subject, replyTo, and site URL", async () => {
            const submissionId = faker.string.uuid();
            const siteUrl = "https://example.com/directory";

            service().notifyLinkDirectorySubmissionCreated({
                submissionId,
                siteUrl,
                email: "suggester@example.com",
                proposedTitle: "My Site",
            });
            await flushAsyncOps();

            expect(emailService.sendPlain).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: "OpenQuok: build-backlinks site suggestion",
                    replyTo: "suggester@example.com",
                    text: expect.stringContaining(`Site URL: ${siteUrl}`),
                })
            );
        });

        it("notifyLinkDirectorySiteCommentCreated sends subject, replyTo, and content", async () => {
            const commentId = faker.string.uuid();
            const siteId = faker.string.uuid();

            service().notifyLinkDirectorySiteCommentCreated({
                commentId,
                siteId,
                siteSlug: "cool-site",
                content: "Great resource",
                userId,
                userEmail: "commenter@example.com",
            });
            await flushAsyncOps();

            expect(emailService.sendPlain).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: "OpenQuok: build-backlinks comment",
                    replyTo: "commenter@example.com",
                    text: expect.stringContaining("Content: Great resource"),
                })
            );
        });

        it("notifyBlogCommentCreated sends subject, replyTo, and post slug", async () => {
            const commentId = faker.string.uuid();
            const postId = faker.string.uuid();

            service().notifyBlogCommentCreated({
                commentId,
                postId,
                postSlug: "hello-world",
                content: "Nice post",
                userId,
                userEmail: "reader@example.com",
            });
            await flushAsyncOps();

            expect(emailService.sendPlain).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: "OpenQuok: blog comment",
                    replyTo: "reader@example.com",
                    text: expect.stringContaining("Post slug: hello-world"),
                })
            );
        });

        it("notifyListingCommentCreated sends subject, replyTo, and listing title", async () => {
            const commentId = faker.string.uuid();
            const listingId = faker.string.uuid();

            service().notifyListingCommentCreated({
                commentId,
                listingId,
                listingTitle: "OpenQuok Core",
                content: "Helpful playbook",
                userId,
                userEmail: "creator@example.com",
            });
            await flushAsyncOps();

            expect(emailService.sendPlain).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: "OpenQuok: creator listing comment",
                    replyTo: "creator@example.com",
                    text: expect.stringContaining("Listing title: OpenQuok Core"),
                })
            );
        });
    });
});
