import { z } from 'zod';

export const signatureOrganizationIdSchema = z.string().uuid({ message: 'Invalid workspace.' });

export const signatureTitleSchema = z
	.string()
	.trim()
	.min(1, { message: 'Title is required.' })
	.max(80, { message: 'Title must be at most 80 characters.' });

export const signatureContentSchema = z
	.string()
	.trim()
	.min(1, { message: 'Signature content is required.' })
	.max(500, { message: 'Signature must be at most 500 characters.' });

export const createSignatureSchema = z.object({
	organizationId: signatureOrganizationIdSchema,
	title: signatureTitleSchema,
	content: signatureContentSchema,
	isDefault: z.boolean().optional()
});

export const updateSignatureSchema = z.object({
	title: signatureTitleSchema.optional(),
	content: signatureContentSchema.optional(),
	isDefault: z.boolean().optional()
});

export type CreateSignatureInput = z.infer<typeof createSignatureSchema>;
export type UpdateSignatureInput = z.infer<typeof updateSignatureSchema>;
