import { AbstractEmailTemplate } from "./AbstractEmailTemplate";

export class VerifyEmailTemplate extends AbstractEmailTemplate {
    private fullName: string;
    private verificationLink: string;

    constructor(
        backendDomainUrl: string,
        fullName: string,
        email: string,
        token: string
    ) {
        super();
        this.fullName = fullName;
        this.verificationLink = `${backendDomainUrl}/api/v1/auth/request-verify-signup?token=${token}&email=${encodeURIComponent(email)}`;
    }

    public buildSubject(): string {
        return "Please verify your email address";
    }

    public buildText(): string {
        return `
Hello ${this.fullName || "there"},

Please verify your email address by clicking the link below:

${this.verificationLink}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

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
    <title>Verify Your Email Address</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Please verify your email address</h1>
    <p>Hello <strong>${this.fullName || "there"}</strong>,</p>
    <p>Please verify your email address by clicking the link below:</p>
    <p style="margin: 20px 0;">
        <a href="${this.verificationLink}" style="display: inline-block; background-color: #3498db; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
    </p>
    <p style="color: #7f8c8d; font-size: 14px;">
        Or copy and paste this link into your browser:<br>
        <a href="${this.verificationLink}" style="color: #3498db; word-break: break-all;">${this.verificationLink}</a>
    </p>
    <p style="color: #e74c3c; font-weight: bold;">This link will expire in 24 hours.</p>
    <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
        If you did not create an account, please ignore this email.
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
