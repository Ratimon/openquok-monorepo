import { ResetPasswordEmailTemplate } from "./ResetPasswordEmailTemplate";

describe("ResetPasswordEmailTemplate", () => {
    const FRONTEND_URL = "http://localhost:5173";
    const CODE = "123456";

    it("should contain the correct subject", () => {
        const template = new ResetPasswordEmailTemplate(
            FRONTEND_URL,
            "Jane Doe",
            "jane@example.com",
            CODE
        );
        expect(template.buildSubject()).toBe("Reset your password");
    });

    it("should contain full name, code and reset link in text body", () => {
        const email = "jane@example.com";
        const template = new ResetPasswordEmailTemplate(FRONTEND_URL, "Jane Doe", email, CODE);
        const text = template.buildText();

        const expectedLink = `${FRONTEND_URL}/forgot-password?confirm=true&email=${encodeURIComponent(email)}&type=recovery`;
        expect(text).toContain("Hello Jane Doe,");
        expect(text).toContain(`Your code is ${CODE}`);
        expect(text).toContain("Follow this link to reset your password");
        expect(text).toContain(expectedLink);
        expect(text).toContain("If you did not request a password reset");
        expect(text).toContain("Best regards,");
        expect(text).toContain("The Team");
    });

    it("should contain h1 heading in the HTML email", () => {
        const template = new ResetPasswordEmailTemplate(
            FRONTEND_URL,
            "Jane Doe",
            "jane@example.com",
            CODE
        );
        const html = template.buildHtml();

        expect(html).toContain("<h1");
        expect(html).toContain("Reset your password");
        expect(html).toContain("</h1>");
    });

    it("should contain the full name in the HTML email", () => {
        const template = new ResetPasswordEmailTemplate(
            FRONTEND_URL,
            "Jane Doe",
            "jane@example.com",
            CODE
        );
        const html = template.buildHtml();

        expect(html).toContain("Hello <strong>Jane Doe</strong>");
    });

    it("should contain the code and reset link in the HTML email", () => {
        const email = "jane@example.com";
        const template = new ResetPasswordEmailTemplate(FRONTEND_URL, "Jane Doe", email, CODE);
        const html = template.buildHtml();

        const expectedLink = `${FRONTEND_URL}/forgot-password?confirm=true&email=${encodeURIComponent(email)}&type=recovery`;
        expect(html).toContain(CODE);
        expect(html).toContain(`href="${expectedLink}"`);
        expect(html).toContain("Reset password");
    });

    it("should use fallback for missing full name", () => {
        const template = new ResetPasswordEmailTemplate(
            FRONTEND_URL,
            "",
            "anon@example.com",
            CODE
        );
        const text = template.buildText();
        expect(text).toContain("Hello there,");
    });
});
