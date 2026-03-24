import { OrganizationInviteEmailTemplate } from "./OrganizationInviteEmailTemplate";

describe("OrganizationInviteEmailTemplate", () => {
    const INVITE_LINK = "https://app.example.com/invite/abc123";
    const ORGANIZATION_NAME = "Acme Corp";
    const ROLE = "Admin";

    it("should build subject with organization name", () => {
        const template = new OrganizationInviteEmailTemplate(
            INVITE_LINK,
            ORGANIZATION_NAME,
            ROLE
        );
        expect(template.buildSubject()).toBe(
            "You're invited to join Acme Corp"
        );
    });

    it("should contain invite link, organization name, role and expiration in text body", () => {
        const template = new OrganizationInviteEmailTemplate(
            INVITE_LINK,
            ORGANIZATION_NAME,
            ROLE,
            24
        );
        const text = template.buildText();

        expect(text).toContain(INVITE_LINK);
        expect(text).toContain(ORGANIZATION_NAME);
        expect(text).toContain(ROLE);
        expect(text).toContain("You have been invited to join");
        expect(text).toContain("Click the link below to accept the invitation");
        expect(text).toContain("This link will expire in 24 hour(s)");
        expect(text).toContain("If you did not expect this invitation");
        expect(text).toContain("Best regards");
        expect(text).toContain("The Team");
    });

    it("should use default expiresInHours of 1 when not provided", () => {
        const template = new OrganizationInviteEmailTemplate(
            INVITE_LINK,
            ORGANIZATION_NAME,
            ROLE
        );
        const text = template.buildText();
        expect(text).toContain("This link will expire in 1 hour(s)");
    });

    it("should contain h1 heading and organization name in HTML", () => {
        const template = new OrganizationInviteEmailTemplate(
            INVITE_LINK,
            ORGANIZATION_NAME,
            ROLE
        );
        const html = template.buildHtml();

        expect(html).toContain("<h1");
        expect(html).toContain("You're invited to join Acme Corp");
        expect(html).toContain("</h1>");
    });

    it("should contain organization name and role in HTML body", () => {
        const template = new OrganizationInviteEmailTemplate(
            INVITE_LINK,
            ORGANIZATION_NAME,
            ROLE
        );
        const html = template.buildHtml();

        expect(html).toContain(`<strong>${ORGANIZATION_NAME}</strong>`);
        expect(html).toContain(`<strong>${ROLE}</strong>`);
        expect(html).toContain("You have been invited to join");
        expect(html).toContain("Click the button below to accept the invitation");
    });

    it("should contain accept invitation button and invite link in HTML", () => {
        const template = new OrganizationInviteEmailTemplate(
            INVITE_LINK,
            ORGANIZATION_NAME,
            ROLE
        );
        const html = template.buildHtml();

        expect(html).toContain(`href="${INVITE_LINK}"`);
        expect(html).toContain("Accept invitation");
        expect(html).toContain("Or copy and paste this link into your browser");
    });

    it("should contain expiration warning in HTML", () => {
        const template = new OrganizationInviteEmailTemplate(
            INVITE_LINK,
            ORGANIZATION_NAME,
            ROLE,
            48
        );
        const html = template.buildHtml();

        expect(html).toContain("This link will expire in 48 hour(s)");
    });

    it("should contain ignore-email disclaimer and sign-off in HTML", () => {
        const template = new OrganizationInviteEmailTemplate(
            INVITE_LINK,
            ORGANIZATION_NAME,
            ROLE
        );
        const html = template.buildHtml();

        expect(html).toContain(
            "If you did not expect this invitation, you can ignore this email"
        );
        expect(html).toContain("Best regards");
        expect(html).toContain("The Team");
    });
});
