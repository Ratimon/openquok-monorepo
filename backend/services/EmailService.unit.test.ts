import { createHash } from "node:crypto";
import { EmailService } from "./EmailService";
import { AppError } from "../errors/AppError";

/** Mutable holder so tests can toggle `config.resend.secretKey` without `resetModules`. */
jest.mock("../config/GlobalConfig", () => {
    const resendSecretHolder = { secretKey: "re_test_key" };
    return {
        config: {
            email: { enabled: false },
            server: { nodeEnv: "development" },
            aws: { accessKeyId: "x", secretAccessKey: "y" },
            basic: {},
            resend: {
                get secretKey() {
                    return resendSecretHolder.secretKey;
                },
            },
        },
        __resendSecretHolder: resendSecretHolder,
    };
});

jest.mock("nodemailer", () => {
    const mockSendMail = jest.fn().mockResolvedValue({ messageId: "<test@mock>" });
    return {
        __esModule: true,
        default: {
            createTransport: jest.fn(() => ({
                sendMail: mockSendMail,
            })),
        },
        mockSendMail,
    };
});

const { mockSendMail } = jest.requireMock("nodemailer") as { mockSendMail: jest.Mock };

const resendSecretHolder = (
    jest.requireMock("../config/GlobalConfig") as {
        __resendSecretHolder: { secretKey: string };
    }
).__resendSecretHolder;

function mockFetchResponse(
    body: unknown,
    options: { ok?: boolean; status?: number } = {}
): Response {
    const { ok = true, status = ok ? 200 : 400 } = options;
    const text = typeof body === "string" ? body : JSON.stringify(body);
    return {
        ok,
        status,
        text: async () => text,
    } as Response;
}

describe("EmailService", () => {
    let service: EmailService;

    beforeEach(() => {
        service = new EmailService({ isEnabled: false });
        global.fetch = jest.fn();
    });

    describe("hashToken", () => {
        it("returns sha256 hex of the input", () => {
            const input = "verify-me";
            expect(service.hashToken(input)).toBe(
                createHash("sha256").update(input).digest("hex")
            );
        });
    });

    describe("generateVerificationToken", () => {
        it("returns a 64-character hex string", () => {
            const token = service.generateVerificationToken();
            expect(token).toMatch(/^[0-9a-f]{64}$/);
        });
    });

    describe("isResendApiConfigured", () => {
        it("is true when RESEND_SECRET_KEY is set in config mock", () => {
            expect(service.isResendApiConfigured).toBe(true);
        });
    });

    describe("listReceivedEmails", () => {
        const listPayload = {
            object: "list" as const,
            has_more: false,
            data: [],
        };

        it("calls Resend list endpoint with Bearer and User-Agent", async () => {
            (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse(listPayload));

            await service.listReceivedEmails({});

            expect(global.fetch).toHaveBeenCalledWith(
                "https://api.resend.com/emails/receiving",
                expect.objectContaining({
                    method: "GET",
                    headers: {
                        Authorization: "Bearer re_test_key",
                        "User-Agent": "openquok-backend/1.0",
                    },
                })
            );
        });

        it("appends limit, after, and before as query parameters", async () => {
            (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse(listPayload));

            await service.listReceivedEmails({
                limit: 25,
                after: "cursor-after-id",
                before: "cursor-before-id",
            });

            const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
            expect(url).toContain("limit=25");
            expect(url).toContain("after=cursor-after-id");
            expect(url).toContain("before=cursor-before-id");
            expect(url.startsWith("https://api.resend.com/emails/receiving?")).toBe(true);
        });

        it("returns parsed JSON on success", async () => {
            (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse(listPayload));

            const result = await service.listReceivedEmails({});
            expect(result).toEqual(listPayload);
        });

        it("throws AppError with Resend message and status on error response", async () => {
            (global.fetch as jest.Mock).mockResolvedValue(
                mockFetchResponse(
                    {
                        message: "Invalid cursor",
                        name: "validation_error",
                        statusCode: 422,
                    },
                    { ok: false, status: 422 }
                )
            );

            const err = await service.listReceivedEmails({ after: "bad" }).catch((e: unknown) => e);
            expect(err).toBeInstanceOf(AppError);
            expect(err).toMatchObject({
                statusCode: 422,
                message: "Invalid cursor",
            });
        });

        it("throws AppError when response body is not valid JSON", async () => {
            (global.fetch as jest.Mock).mockResolvedValue(
                mockFetchResponse("not-json", { ok: true, status: 200 })
            );

            await expect(service.listReceivedEmails({})).rejects.toMatchObject({
                statusCode: 200,
                message: "Invalid response from Resend API",
            });
        });
    });

    describe("getReceivedEmail", () => {
        it("GETs the receiving email by id with encoded path segment", async () => {
            (global.fetch as jest.Mock).mockResolvedValue(
                mockFetchResponse({ object: "email", id: "x", subject: "Hi" })
            );

            const id = "550e8400-e29b-41d4-a716-446655440000";
            await service.getReceivedEmail(id);

            expect(global.fetch).toHaveBeenCalledWith(
                `https://api.resend.com/emails/receiving/${id}`,
                expect.objectContaining({
                    method: "GET",
                    headers: {
                        Authorization: "Bearer re_test_key",
                        "User-Agent": "openquok-backend/1.0",
                    },
                })
            );
        });

        it("encodes special characters in id for the URL path", async () => {
            (global.fetch as jest.Mock).mockResolvedValue(mockFetchResponse({ object: "email" }));

            await service.getReceivedEmail("id/with%chars");

            const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
            expect(url).toContain(encodeURIComponent("id/with%chars"));
        });
    });

    describe("sendPlain", () => {
        it("throws when email is disabled", async () => {
            await expect(
                service.sendPlain({ to: "a@b.com", subject: "s", text: "t" })
            ).rejects.toMatchObject({
                statusCode: 503,
                message: "Email is disabled",
            });
        });

        it("calls transporter.sendMail with text, replyTo, and headers when enabled", async () => {
            mockSendMail.mockClear();
            const enabled = new EmailService({ isEnabled: true });

            await enabled.sendPlain({
                to: "user@example.com",
                subject: "Re: Hello",
                text: "Plain body",
                replyTo: "support@example.com",
                headers: {
                    "In-Reply-To": "<msg-1@host>",
                    References: "<msg-1@host>",
                },
            });

            expect(mockSendMail).toHaveBeenCalledTimes(1);
            expect(mockSendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: { name: "Openquok", address: "noreply@example.com" },
                    to: "user@example.com",
                    subject: "Re: Hello",
                    text: "Plain body",
                    replyTo: "support@example.com",
                    headers: {
                        "In-Reply-To": "<msg-1@host>",
                        References: "<msg-1@host>",
                    },
                })
            );
        });
    });

    describe("when Resend secret key is cleared", () => {
        beforeEach(() => {
            resendSecretHolder.secretKey = "";
        });

        afterEach(() => {
            resendSecretHolder.secretKey = "re_test_key";
        });

        it("isResendApiConfigured is false", () => {
            expect(service.isResendApiConfigured).toBe(false);
        });

        it("listReceivedEmails throws AppError 503", async () => {
            await expect(service.listReceivedEmails({})).rejects.toMatchObject({
                statusCode: 503,
                message: "Resend API key is not configured",
            });
        });

        it("getReceivedEmail throws AppError 503", async () => {
            await expect(service.getReceivedEmail("550e8400-e29b-41d4-a716-446655440000")).rejects.toMatchObject({
                statusCode: 503,
                message: "Resend API key is not configured",
            });
        });
    });
});
