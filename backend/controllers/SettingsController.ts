import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../guards";
import type { OrganizationService } from "../services/OrganizationService";
import type {
    ValidateCreateOrganizationRequestHandler,
    ValidateUpdateOrganizationRequestHandler,
    ValidateAddTeamMemberRequestHandler,
    ValidateInviteTeamMemberRequestHandler,
    ValidateJoinOrganizationRequestHandler,
} from "../data/schemas/organizationSchemas";
import { OrganizationNotFoundError } from "../errors/OrganizationError";
import { UserAuthorizationError } from "../errors/UserError";
import { resolveActiveOrganizationId } from "../utils/session/resolveActiveOrganizationId";
import {
    toOrganizationWithRoleDTO,
    toOrganizationDTO,
    toOrganizationMemberDTO,
    toPendingInviteDTO,
    toWorkspaceSentInviteDTO
} from "../utils/dtos/OrganizationDTO";

export class SettingsController {
    constructor(private readonly organizationService: OrganizationService) {}

    /** GET /settings — list organizations for the authenticated user. */
    listMine = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const list = await this.organizationService.listMyOrganizations(authUserId);
            const membershipByOrg = new Map(list.memberships.map((m) => [m.organizationId, m]));
            const data = list.organizations.map((org) =>
                toOrganizationWithRoleDTO(
                    org,
                    membershipByOrg.get(org.id) ?? { role: "user", disabled: false },
                    list.memberCounts[org.id] ?? 0
                )
            );
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** GET /settings/:id — get one organization (must be member). */
    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.params as { id: string }).id;
            const result = await this.organizationService.getOrganizationById(authUserId, organizationId);
            if (!result) {
                return next(new OrganizationNotFoundError(organizationId));
            }
            const org = toOrganizationWithRoleDTO(
                result.organization,
                result.membership,
                result.memberCount
            );
            res.status(200).json({ success: true, data: org });
        } catch (error) {
            next(error);
        }
    };

    /** POST /settings — create organization and add current user as owner. */
    create: ValidateCreateOrganizationRequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const { name, description } = req.body as { name: string; description?: string };
            const row = await this.organizationService.createOrganization(authUserId, {
                name,
                description: description ?? null,
            });
            const org = toOrganizationDTO(row)!;
            res.status(201).json({ success: true, data: org });
        } catch (error) {
            next(error);
        }
    };

    /** PATCH /settings/:id — update organization (admin/owner only). */
    update: ValidateUpdateOrganizationRequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.params as { id: string }).id;
            const { name, description } = req.body as { name?: string; description?: string | null };
            const row = await this.organizationService.updateOrganization(authUserId, organizationId, {
                name,
                description,
            });
            const org = toOrganizationDTO(row)!;
            res.status(200).json({ success: true, data: org });
        } catch (error) {
            next(error);
        }
    };

    /** GET /settings/team — team for active workspace (`showorg` cookie). */
    getTeamForActiveWorkspace = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = resolveActiveOrganizationId(req, { required: true })!;
            const rows = await this.organizationService.getTeam(authUserId, organizationId);
            const members = rows.map((m) => toOrganizationMemberDTO(m, { email: m.email, full_name: m.full_name }));
            res.status(200).json({ success: true, data: members });
        } catch (error) {
            next(error);
        }
    };

    /** POST /settings/team — invite by email for active workspace (`showorg` cookie). */
    inviteTeamMemberForActiveWorkspace: ValidateInviteTeamMemberRequestHandler = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const organizationId = resolveActiveOrganizationId(req, { required: true })!;
            const { email, workspaceRole, sendEmail } = req.body as {
                email: string;
                workspaceRole: "user" | "admin";
                sendEmail: boolean;
            };
            const result = await this.organizationService.inviteTeamMemberByEmail(authUserId, organizationId, {
                email,
                workspaceRole,
                sendEmail,
            });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    /** GET /settings/:id/team — get team members. */
    getTeam = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.params as { id: string }).id;
            const rows = await this.organizationService.getTeam(authUserId, organizationId);
            const members = rows.map((m) => toOrganizationMemberDTO(m, { email: m.email, full_name: m.full_name }));
            res.status(200).json({ success: true, data: members });
        } catch (error) {
            next(error);
        }
    };

    /** POST /settings/:id/team — add team member (admin/owner only). */
    addTeamMember: ValidateAddTeamMemberRequestHandler = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.params as { id: string }).id;
            const { userId, workspaceRole } = req.body as {
                userId: string;
                workspaceRole: "user" | "admin" | "owner";
            };
            const row = await this.organizationService.addTeamMember(authUserId, organizationId, {
                userId,
                workspaceRole,
            });
            const member = toOrganizationMemberDTO(row, { email: row.email, full_name: row.full_name });
            res.status(201).json({ success: true, data: member });
        } catch (error) {
            next(error);
        }
    };

    /** DELETE /settings/:id/team/:userId — remove team member. */
    removeTeamMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const { id: organizationId, userId: targetUserId } = req.params as { id: string; userId: string };
            await this.organizationService.removeTeamMember(authUserId, organizationId, targetUserId);
            res.status(200).json({ success: true, message: "Member removed" });
        } catch (error) {
            next(error);
        }
    };

    /** DELETE /settings/:id — delete organization (owner only). */
    deleteById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.params as { id: string }).id;
            await this.organizationService.deleteOrganization(authUserId, organizationId);
            res.status(200).json({ success: true, message: "Organization deleted" });
        } catch (error) {
            next(error);
        }
    };

    /** POST /settings/:id/rotate-api-key — rotate programmatic access token (admin/owner only). */
    rotateApiKey = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.params as { id: string }).id;
            const { organization, programmaticAccessToken } =
                await this.organizationService.rotateProgrammaticAccessToken(authUserId, organizationId);
            const org = toOrganizationDTO(organization)!;
            res.status(200).json({
                success: true,
                data: { ...org, programmaticAccessToken },
            });
        } catch (error) {
            next(error);
        }
    };

    /** GET /settings/:id/programmatic-token — whether a programmatic token is configured. */
    getProgrammaticTokenStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) {
                return next(new UserAuthorizationError("Not authenticated"));
            }
            const organizationId = (req.params as { id: string }).id;
            const status = await this.organizationService.getProgrammaticTokenStatus(
                authUserId,
                organizationId
            );
            res.status(200).json({ success: true, data: status });
        } catch (error) {
            next(error);
        }
    };

    /** POST /settings/:id/invite — invite team member by email (admin/owner only). */
    inviteTeamMember: ValidateInviteTeamMemberRequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const organizationId = (req.params as { id: string }).id;
            const { email, workspaceRole, sendEmail } = req.body as {
                email: string;
                workspaceRole: "user" | "admin";
                sendEmail: boolean;
            };
            const result = await this.organizationService.inviteTeamMemberByEmail(authUserId, organizationId, {
                email,
                workspaceRole,
                sendEmail,
            });
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    /** POST /settings/join — accept invite token and add current user to the organization. */
    joinByToken: ValidateJoinOrganizationRequestHandler = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const { token } = req.body as { token: string };
            const result = await this.organizationService.joinOrganizationByToken(authUserId, token);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    };

    /** GET /settings/invite/validate — validate invite token (returns org name and workspaceRole). */
    validateInviteToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = (req.query as { token?: string }).token;
            if (!token) return res.status(200).json({ success: true, data: null, reason: "malformed" });
            const result = await this.organizationService.validateInviteToken(token);
            if (result.valid) {
                const { organizationName, workspaceRole, inviteeEmail } = result;
                return res.status(200).json({
                    success: true,
                    data: { organizationName, workspaceRole, inviteeEmail },
                });
            }
            res.status(200).json({ success: true, data: null, reason: result.reason });
        } catch (error) {
            next(error);
        }
    };

    /** GET /settings/invites/pending — list pending workspace invites for the current user. */
    listPendingInvites = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const list = await this.organizationService.listPendingInvitesForUser(authUserId);
            const data = list.map(toPendingInviteDTO);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** GET /settings/invites/sent — pending invites sent from the active workspace (`showorg` cookie); owner only. */
    listSentInvitesForActiveWorkspace = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const organizationId = resolveActiveOrganizationId(req, { required: true })!;
            const list = await this.organizationService.listSentInvitesForOrganization(
                authUserId,
                organizationId
            );
            const data = list.map(toWorkspaceSentInviteDTO);
            res.status(200).json({ success: true, data });
        } catch (error) {
            next(error);
        }
    };

    /** DELETE /settings/invites/:id — cancel a pending invite for the active workspace; owner only. */
    cancelSentInviteForActiveWorkspace = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const organizationId = resolveActiveOrganizationId(req, { required: true })!;
            const inviteId = (req.params as { id: string }).id;
            await this.organizationService.cancelSentInvite(authUserId, organizationId, inviteId);
            res.status(200).json({ success: true, message: "Invitation cancelled" });
        } catch (error) {
            next(error);
        }
    };

    /** POST /settings/invites/:id/accept — accept a pending invite by id. */
    acceptPendingInvite = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authReq = req as AuthenticatedRequest;
            const authUserId = authReq.user?.id;
            if (!authUserId) return next(new UserAuthorizationError("Not authenticated"));
            const inviteId = (req.params as { id: string }).id;
            const result = await this.organizationService.acceptPendingInvite(authUserId, inviteId);
            res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    };
}
