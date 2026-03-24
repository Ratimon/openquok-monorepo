import { AbstractEmailTemplate } from "./AbstractEmailTemplate";

/**
 * Change password email: sent when an authenticated user requests a link to change their password.
 * Uses a one-time recovery token (Supabase generateRecoveryLink). The link goes to an (auth) confirm
 * page that exchanges the token for a session, then redirects to the protected password page.
 */
export class ChangePasswordEmailTemplate extends AbstractEmailTemplate {
    private changePasswordLink: string;

    constructor(frontendDomainUrl: string, token: string, email: string) {
        super();
        const base = frontendDomainUrl.replace(/\/$/, "");
        this.changePasswordLink = `${base}/confirm-change-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&type=recovery`;
    }

    public buildSubject(): string {
        return "Change your Password";
    }

    public buildText(): string {
        return `
Change your Password

We received a request to change your password. Click the link below to change your password.

${this.changePasswordLink}

If you didn't ask to change your password, you can ignore this email.

Visit our help center to learn more about our platform and to share your feedback.
`.trim();
    }

    public buildHtml(): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff;">
    <h1 style="font-size: 1.75rem; font-weight: bold; color: #111; margin: 0 0 24px 0;">Change your Password</h1>
    <p style="margin: 0 0 20px; color: #111;">
        We received a request to change your password. Click the button below to change your password. If you didn't ask to change your password, you can ignore this email.
    </p>
    <p style="margin: 24px 0;">
        <a href="${this.changePasswordLink}" style="display: inline-block; background-color: #111; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Change password →</a>
    </p>
    <p style="margin-top: 32px; font-size: 14px; color: #666;">
        Visit our <a href="#" style="color: #111; text-decoration: underline;">help center</a> to learn more about our platform and to share your feedback.
    </p>
</body>
</html>
`.trim();
    }
}
