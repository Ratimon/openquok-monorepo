import { z } from 'zod';

export const workspaceCreateFormSchema = z.object({
	workspaceName: z.string().trim().min(1, 'Workspace name is required.')
});

export type WorkspaceCreateFormSchemaType = z.infer<typeof workspaceCreateFormSchema>;

export const workspaceUpdateFormSchema = z.object({
	workspaceName: z.string().trim().min(1, 'Workspace name is required.').max(256),
	workspaceDescription: z.string().trim().max(2000, 'Description must be 2000 characters or fewer.')
});

export type WorkspaceUpdateFormSchemaType = z.infer<typeof workspaceUpdateFormSchema>;

export const workspaceInviteMemberFormSchema = z.object({
	email: z.string().email('Please enter a valid email.').trim(),
	role: z.enum(['user', 'admin']),
	sendEmail: z.boolean()
});

export type WorkspaceInviteMemberFormSchemaType = z.infer<typeof workspaceInviteMemberFormSchema>;
