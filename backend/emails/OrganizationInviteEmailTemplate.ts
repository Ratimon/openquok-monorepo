import { AbstractEmailTemplate } from "./AbstractEmailTemplate";

export class OrganizationInviteEmailTemplate extends AbstractEmailTemplate {
    private inviteLink: string;
    private organizationName: string;
    private role: string;
    private expiresInHours: number;

    constructor(
        inviteLink: string,
        organizationName: string,
        role: string,
        expiresInHours: number = 1
    ) {
        super();
        this.inviteLink = inviteLink;
        this.organizationName = organizationName;
        this.role = role;
        this.expiresInHours = expiresInHours;
    }

    public buildSubject(): string {
        return `You're invited to join ${this.organizationName}`;
    }

    public buildText(): string {
        return `
You have been invited to join ${this.organizationName} as ${this.role}.

Click the link below to accept the invitation:

${this.inviteLink}

This link will expire in ${this.expiresInHours} hour(s).

If you did not expect this invitation, you can ignore this email.

Best regards,
The Team
`.trim();
    }

    public buildHtml(): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organization Invitation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">You're invited to join ${this.organizationName}</h1>
    <p>You have been invited to join <strong>${this.organizationName}</strong> as <strong>${this.role}</strong>.</p>
    <p>Click the button below to accept the invitation:</p>
    <p style="margin: 20px 0;">
        <a href="${this.inviteLink}" style="display: inline-block; background-color: #3498db; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept invitation</a>
    </p>
    <p style="color: #7f8c8d; font-size: 14px;">
        Or copy and paste this link into your browser:<br>
        <a href="${this.inviteLink}" style="color: #3498db; word-break: break-all;">${this.inviteLink}</a>
    </p>
    <p style="color: #e74c3c; font-weight: bold;">This link will expire in ${this.expiresInHours} hour(s).</p>
    <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
        If you did not expect this invitation, you can ignore this email.
    </p>
    <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The Team</strong>
    </p>
</body>
</html>
`.trim();
    }
}
