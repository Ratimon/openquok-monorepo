import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

const workspaceMembershipRoleSchema = z.enum(["user", "admin", "superadmin"]);

export const createOrganizationBodySchema = z.object({
    name: z.string().min(1, "Name is required").max(256).trim(),
    description: z.string().max(2000).trim().optional(),
});

export const updateOrganizationBodySchema = z.object({
    name: z.string().min(1).max(256).trim().optional(),
    description: z.string().max(2000).trim().nullable().optional(),
});

export const addTeamMemberBodySchema = z.object({
    userId: z.string().uuid("Invalid user id"),
    workspaceRole: workspaceMembershipRoleSchema.default("user"),
});

const inviteRoleSchema = z.enum(["user", "admin"]);
export const inviteTeamMemberBodySchema = z.object({
    email: z.string().email("Invalid email"),
    workspaceRole: inviteRoleSchema.default("user"),
    sendEmail: z.boolean().default(true),
});

export const joinOrganizationBodySchema = z.object({
    token: z.string().min(1, "Invite token is required"),
});

const organizationIdParamSchema = z.object({ id: z.string().uuid("Invalid organization id") });
const teamUserIdParamSchema = z.object({ userId: z.string().uuid("Invalid user id") });

export const validateOrganizationIdParam: RequestHandler = validateRequest({
    params: organizationIdParamSchema,
});

export const validateOrganizationIdAndUserIdParam: RequestHandler = validateRequest({
    params: organizationIdParamSchema.merge(teamUserIdParamSchema),
});

export const validateCreateOrganizationRequest: RequestHandler = validateRequest({
    body: createOrganizationBodySchema,
});

export const validateUpdateOrganizationRequest: RequestHandler = validateRequest({
    body: updateOrganizationBodySchema,
});

export const validateAddTeamMemberRequest: RequestHandler = validateRequest({
    body: addTeamMemberBodySchema,
});

export const validateInviteTeamMemberRequest: RequestHandler = validateRequest({
    body: inviteTeamMemberBodySchema,
});

export const validateJoinOrganizationRequest: RequestHandler = validateRequest({
    body: joinOrganizationBodySchema,
});

export type ValidateCreateOrganizationRequestHandler = typeof validateCreateOrganizationRequest;
export type ValidateUpdateOrganizationRequestHandler = typeof validateUpdateOrganizationRequest;
export type ValidateAddTeamMemberRequestHandler = typeof validateAddTeamMemberRequest;
export type ValidateInviteTeamMemberRequestHandler = typeof validateInviteTeamMemberRequest;
export type ValidateJoinOrganizationRequestHandler = typeof validateJoinOrganizationRequest;
