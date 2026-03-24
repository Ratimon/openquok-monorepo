import { AbstractEmailTemplate } from "./AbstractEmailTemplate";

export class WelcomeEmailTemplate extends AbstractEmailTemplate {
    private fullName: string;

    constructor(fullName: string) {
        super();
        this.fullName = fullName;
    }

    public buildSubject(): string {
        return "Welcome to our platform!";
    }

    public buildText(): string {
        return `
Hello ${this.fullName || "there"},

Thank you for verifying your email address. Your account is now fully activated.

You can now access all features of our platform.

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
    <title>Welcome!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2c3e50; border-bottom: 2px solid #27ae60; padding-bottom: 10px;">Welcome to our platform!</h1>
    <p>Hello <strong>${this.fullName || "there"}</strong>,</p>
    <p>Thank you for verifying your email address. Your account is now fully activated.</p>
    <p>You can now access all features of our platform.</p>
    <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The Team</strong>
    </p>
</body>
</html>
`.trim();
    }
}
