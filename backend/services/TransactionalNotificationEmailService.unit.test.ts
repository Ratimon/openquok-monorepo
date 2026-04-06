/// <reference types="jest" />
import { faker } from "@faker-js/faker";
import { createQueueIoredisClient } from "../connections/bullmq/createQueueIoredis";
import {
    buildNotificationDigestBodyInner,
    buildNotificationDigestSubject,
    buildNotificationEmailDocument,
} from "../emails/notificationTransactionalEmailHtml";
import { appendNotificationDigestEntry } from "../orchestrator/stores/notificationDigestRedisStore";
import { runNotificationSendPlainOrchestration } from "../orchestrator/flows/notificationEmailWorkflow";
import type { OrganizationRepository } from "../repositories/OrganizationRepository";
import { logger } from "../utils/Logger";
import { TransactionalNotificationEmailService } from "./TransactionalNotificationEmailService";

jest.mock("../connections/bullmq/createQueueIoredis", () => ({
    createQueueIoredisClient: jest.fn(),
}));

jest.mock("../orchestrator/stores/notificationDigestRedisStore", () => ({
    appendNotificationDigestEntry: jest.fn(),
}));

jest.mock("../orchestrator/flows/notificationEmailWorkflow", () => ({
    runNotificationSendPlainOrchestration: jest.fn(),
}));

const mockedCreateRedis = jest.mocked(createQueueIoredisClient);
const mockedAppendDigest = jest.mocked(appendNotificationDigestEntry);
const mockedRunSendPlain = jest.mocked(runNotificationSendPlainOrchestration);

const organizationId = faker.string.uuid();
const userId = faker.string.uuid();

function createMockOrgRepo(): jest.Mocked<Pick<OrganizationRepository, "listMembersForNotificationEmails">> {
    return {
        listMembersForNotificationEmails: jest.fn(),
    };
}

describe("TransactionalNotificationEmailService", () => {
    let orgRepo: jest.Mocked<Pick<OrganizationRepository, "listMembersForNotificationEmails">>;
    let redisQuit: jest.Mock;

    beforeEach(() => {
        orgRepo = createMockOrgRepo();
        redisQuit = jest.fn().mockResolvedValue(undefined);
        mockedCreateRedis.mockReturnValue({ quit: redisQuit } as never);
        mockedAppendDigest.mockReset().mockResolvedValue(undefined);
        mockedRunSendPlain.mockReset().mockResolvedValue({ runId: faker.string.uuid(), enqueued: true });
    });

    function service(): TransactionalNotificationEmailService {
        return new TransactionalNotificationEmailService(orgRepo as unknown as OrganizationRepository);
    }

    describe("deliverToOrganizationMembers", () => {
        const subject = faker.lorem.sentence();
        const htmlBodyInner = `<p>${faker.lorem.words(4)}</p>`;

        it("delivers wrapped HTML to members with email who pass type filters", async () => {
            const email = faker.internet.email();
            orgRepo.listMembersForNotificationEmails.mockResolvedValue([
                {
                    userId,
                    email: `  ${email}  `,
                    sendSuccessEmails: true,
                    sendFailureEmails: true,
                },
            ]);
            const deliver = jest.fn().mockResolvedValue(undefined);

            await service().deliverToOrganizationMembers({
                organizationId,
                subject,
                htmlBodyInner,
                type: "success",
                deliver,
            });

            expect(orgRepo.listMembersForNotificationEmails).toHaveBeenCalledWith(organizationId);
            expect(deliver).toHaveBeenCalledTimes(1);
            expect(deliver).toHaveBeenCalledWith(email, subject, buildNotificationEmailDocument(htmlBodyInner));
        });

        it("skips members without usable email", async () => {
            orgRepo.listMembersForNotificationEmails.mockResolvedValue([
                { userId, email: null, sendSuccessEmails: true, sendFailureEmails: true },
                { userId, email: "   ", sendSuccessEmails: true, sendFailureEmails: true },
            ]);
            const deliver = jest.fn();

            await service().deliverToOrganizationMembers({
                organizationId,
                subject,
                htmlBodyInner,
                type: "info",
                deliver,
            });

            expect(deliver).not.toHaveBeenCalled();
        });

        it("skips success emails when member opted out", async () => {
            orgRepo.listMembersForNotificationEmails.mockResolvedValue([
                {
                    userId,
                    email: faker.internet.email(),
                    sendSuccessEmails: false,
                    sendFailureEmails: true,
                },
            ]);
            const deliver = jest.fn();

            await service().deliverToOrganizationMembers({
                organizationId,
                subject,
                htmlBodyInner,
                type: "success",
                deliver,
            });

            expect(deliver).not.toHaveBeenCalled();
        });

        it("skips failure emails when member opted out", async () => {
            orgRepo.listMembersForNotificationEmails.mockResolvedValue([
                {
                    userId,
                    email: faker.internet.email(),
                    sendSuccessEmails: true,
                    sendFailureEmails: false,
                },
            ]);
            const deliver = jest.fn();

            await service().deliverToOrganizationMembers({
                organizationId,
                subject,
                htmlBodyInner,
                type: "fail",
                deliver,
            });

            expect(deliver).not.toHaveBeenCalled();
        });

        it("always sends info type regardless of member flags", async () => {
            const email = faker.internet.email();
            orgRepo.listMembersForNotificationEmails.mockResolvedValue([
                {
                    userId,
                    email,
                    sendSuccessEmails: false,
                    sendFailureEmails: false,
                },
            ]);
            const deliver = jest.fn().mockResolvedValue(undefined);

            await service().deliverToOrganizationMembers({
                organizationId,
                subject,
                htmlBodyInner,
                type: "info",
                deliver,
            });

            expect(deliver).toHaveBeenCalledTimes(1);
        });
    });

    describe("enqueueSendPlainJob", () => {
        it("delegates to runNotificationSendPlainOrchestration", async () => {
            const payload = {
                to: faker.internet.email(),
                subject: faker.lorem.words(2),
                html: "<p>x</p>",
                replyTo: faker.internet.email(),
            };

            await service().enqueueSendPlainJob(payload);

            expect(mockedRunSendPlain).toHaveBeenCalledWith(payload);
        });
    });

    describe("appendDigestEntry", () => {
        it("appends via store and closes redis", async () => {
            const entry = { subject: "s", message: "m", type: "info" as const };

            await service().appendDigestEntry(organizationId, entry);

            expect(mockedCreateRedis).toHaveBeenCalledTimes(1);
            expect(mockedAppendDigest).toHaveBeenCalledWith(
                expect.anything(),
                organizationId,
                entry
            );
            expect(redisQuit).toHaveBeenCalledTimes(1);
        });

        it("logs warn and still quits redis when append fails", async () => {
            const warnSpy = jest.spyOn(logger, "warn").mockImplementation(() => {});
            mockedAppendDigest.mockRejectedValueOnce(new Error("redis down"));
            const entry = { subject: "s", message: "m", type: "success" as const };

            await service().appendDigestEntry(organizationId, entry);

            expect(warnSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: "[TransactionalNotificationEmail] Failed to append digest entry",
                    organizationId,
                    error: "redis down",
                })
            );
            expect(redisQuit).toHaveBeenCalledTimes(1);
            warnSpy.mockRestore();
        });
    });

    describe("deliverDigestBatch", () => {
        it("builds digest subject/body and delivers as info to org members", async () => {
            const entries = [
                { subject: faker.lorem.word(), message: faker.lorem.sentence(), type: "success" as const },
            ];
            const memberEmail = faker.internet.email();
            orgRepo.listMembersForNotificationEmails.mockResolvedValue([
                {
                    userId,
                    email: memberEmail,
                    sendSuccessEmails: true,
                    sendFailureEmails: true,
                },
            ]);
            const sendPlain = jest.fn().mockResolvedValue(undefined);

            const errorSpy = jest.spyOn(logger, "error").mockImplementation(() => {});

            await service().deliverDigestBatch(organizationId, entries, sendPlain);

            const expectedSubject = buildNotificationDigestSubject(entries);
            const expectedInner = buildNotificationDigestBodyInner(entries);
            expect(sendPlain).toHaveBeenCalledWith(
                memberEmail,
                expectedSubject,
                buildNotificationEmailDocument(expectedInner)
            );
            expect(errorSpy).not.toHaveBeenCalled();
            errorSpy.mockRestore();
        });

        it("logs error when deliverToOrganizationMembers throws", async () => {
            orgRepo.listMembersForNotificationEmails.mockRejectedValue(new Error("db error"));
            const errorSpy = jest.spyOn(logger, "error").mockImplementation(() => {});
            const entries = [{ subject: "a", message: "b", type: "info" as const }];

            await service().deliverDigestBatch(organizationId, entries, jest.fn());

            expect(errorSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    msg: "[TransactionalNotificationEmail] Digest flush delivery failed",
                    organizationId,
                    error: "db error",
                })
            );
            errorSpy.mockRestore();
        });
    });
});
