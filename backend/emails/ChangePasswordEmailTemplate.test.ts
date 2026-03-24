import { ChangePasswordEmailTemplate } from "./ChangePasswordEmailTemplate";

describe("ChangePasswordEmailTemplate", () => {
    const FRONTEND_URL = "http://localhost:5173";
    const TOKEN = "abc123xyz";
    const EMAIL = "user@example.com";

    it("should have subject 'Change your Password'", () => {
        const template = new ChangePasswordEmailTemplate(FRONTEND_URL, TOKEN, EMAIL);
        expect(template.buildSubject()).toBe("Change your Password");
    });

    it("should contain confirm-change-password link with token and email in text body", () => {
        const template = new ChangePasswordEmailTemplate(FRONTEND_URL, TOKEN, EMAIL);
        const text = template.buildText();
        expect(text).toContain("http://localhost:5173/confirm-change-password");
        expect(text).toContain("token=");
        expect(text).toContain("email=");
        expect(text).toContain("type=recovery");
        expect(text).toContain("We received a request to change your password");
        expect(text).toContain("If you didn't ask to change your password");
        expect(text).toContain("help center");
    });

    it("should contain heading and CTA button in HTML with token in link", () => {
        const template = new ChangePasswordEmailTemplate(FRONTEND_URL, TOKEN, EMAIL);
        const html = template.buildHtml();
        expect(html).toContain("<h1");
        expect(html).toContain("Change your Password");
        expect(html).toContain("Change password →");
        expect(html).toContain("confirm-change-password");
        expect(html).toContain("type=recovery");
        expect(html).toContain(encodeURIComponent(EMAIL));
    });

    it("should strip trailing slash from frontend URL", () => {
        const template = new ChangePasswordEmailTemplate("http://localhost:5173/", TOKEN, EMAIL);
        const html = template.buildHtml();
        expect(html).toContain("http://localhost:5173/confirm-change-password");
    });
});
