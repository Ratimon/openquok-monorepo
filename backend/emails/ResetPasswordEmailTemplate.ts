import { AbstractEmailTemplate } from "./AbstractEmailTemplate";

/**
 * Reset password email: shows the one-time code and a link to the frontend forgot-password page.
 * Matches the flow: user requests reset → receives this email → opens link → enters code → verify-reset → update password.
 */
export class ResetPasswordEmailTemplate extends AbstractEmailTemplate {
    private fullName: string;
    private code: string;
    private resetLink: string;

    constructor(frontendDomainUrl: string, fullName: string, email: string, code: string) {
        super();
        this.fullName = fullName;
        this.code = code;
        this.resetLink = `${frontendDomainUrl}/forgot-password?confirm=true&email=${encodeURIComponent(email)}&type=recovery`;
    }

    public buildSubject(): string {
        return "Reset your password";
    }

    public buildText(): string {
        return `
Hello ${this.fullName || "there"},

Your code is ${this.code}

Follow this link to reset your password using the code above:

${this.resetLink}

If you did not request a password reset, please ignore this email.

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
    <title>Reset your password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2c3e50; border-bottom: 2px solid #e67e22; padding-bottom: 10px;">Reset your password</h1>
    <p>Hello <strong>${this.fullName || "there"}</strong>,</p>
    <p>Your code is <strong style="font-size: 1.2em; letter-spacing: 0.1em;">${this.code}</strong></p>
    <p>Follow this link to reset your password using the code above:</p>
    <p style="margin: 20px 0;">
        <a href="${this.resetLink}" style="display: inline-block; background-color: #e67e22; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset password</a>
    </p>
    <p style="color: #7f8c8d; font-size: 14px;">
        Or copy and paste this link into your browser:<br>
        <a href="${this.resetLink}" style="color: #e67e22; word-break: break-all;">${this.resetLink}</a>
    </p>
    <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
        If you did not request a password reset, please ignore this email.
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
