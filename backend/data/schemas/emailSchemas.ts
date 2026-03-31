import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

const listReceivedEmailsQuerySchema = z
    .object({
        limit: z.coerce.number().int().min(1).max(100).optional(),
        after: z.string().min(1).optional(),
        before: z.string().min(1).optional(),
    })
    .refine((data) => !(data.after && data.before), {
        message: "Cannot use both after and before",
        path: ["after"],
    });

const getReceivedEmailParamsSchema = z.object({
    id: z.string().uuid(),
});

const recipientList = z.array(z.string().min(1)).max(50);
const singleOrRecipientList = z.union([z.string().min(1), recipientList]);

/** Body for POST /admin/emails/send — maps to Resend [Send Email](https://resend.com/docs/api-reference/emails/send-email). */
const sendEmailBodySchema = z
    .object({
        /**
         * Sender identity. For admin emails, the backend may override this with SITE_NAME + SENDER_EMAIL_ADDRESS
         * to keep a consistent sending reputation.
         */
        from: z.string().min(1).optional(),
        to: singleOrRecipientList,
        subject: z.string().min(1),
        text: z.string().optional(),
        html: z.string().optional(),
        cc: singleOrRecipientList.optional(),
        bcc: singleOrRecipientList.optional(),
        reply_to: singleOrRecipientList.optional(),
        /** `Message-ID` value for threading (sets `In-Reply-To` and `References` headers). */
        in_reply_to: z.string().min(1).optional(),
    })
    .refine((data) => data.text !== undefined || data.html !== undefined, {
        message: "Provide at least one of text or html",
        path: ["text"],
    });

const validateListReceivedEmailsQuery: RequestHandler = validateRequest({
    query: listReceivedEmailsQuerySchema,
});

const validateGetReceivedEmailParams: RequestHandler = validateRequest({
    params: getReceivedEmailParamsSchema,
});

const validateSendEmailBody: RequestHandler = validateRequest({
    body: sendEmailBodySchema,
});

type EmailSchemas = {
    validateListReceivedEmailsQuery: RequestHandler;
    validateGetReceivedEmailParams: RequestHandler;
    validateSendEmailBody: RequestHandler;
};

const emailSchemas: EmailSchemas = {
    validateListReceivedEmailsQuery,
    validateGetReceivedEmailParams,
    validateSendEmailBody,
};

export type SendEmailRequestBody = z.infer<typeof sendEmailBodySchema>;

export default emailSchemas;
